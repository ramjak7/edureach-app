import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { DiagnosticSubmitSchema } from "@/lib/validators/student";
import { computeMasteryScore, getMasteryStatus, upsertMasteryScore } from "@/lib/mastery";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user?.student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  const { student } = user;

  // Idempotency guard — don't reprocess if already completed
  if (student.onboardingCompleted) {
    return NextResponse.json({ success: true, data: null });
  }

  const body = await req.json();
  const parsed = DiagnosticSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { attempts } = parsed.data;

  // Fetch correct answers from DB (never exposed to client)
  const contentObjectIds = attempts.map((a) => a.contentObjectId);
  const questions = await db.contentObject.findMany({
    where: { id: { in: contentObjectIds } },
    select: { id: true, correctOptionId: true },
  });
  const correctMap = new Map<string, string | null>();
  for (const q of questions) {
    correctMap.set(q.id, q.correctOptionId);
  }

  // Build practice attempt rows with server-computed isCorrect
  const attemptRows = attempts.map((a) => {
    const isCorrect = correctMap.get(a.contentObjectId) === a.selectedOptionId;
    return {
      studentId: student.id,
      contentObjectId: a.contentObjectId,
      conceptId: a.conceptId,
      isCorrect,
      errorType: isCorrect ? null : ("knowledge_gap" as const),
      timeTakenSeconds: a.timeTakenSeconds,
      sessionContext: "diagnostic" as const,
    };
  });

  await db.practiceAttempt.createMany({ data: attemptRows });

  // Group by concept and compute accuracy
  const byConceptId = new Map<string, { correct: number; total: number }>();
  for (const row of attemptRows) {
    const agg = byConceptId.get(row.conceptId) ?? { correct: 0, total: 0 };
    agg.total += 1;
    if (row.isCorrect) agg.correct += 1;
    byConceptId.set(row.conceptId, agg);
  }

  // Upsert mastery scores — diagnostic defaults for non-accuracy components
  await Promise.all(
    Array.from(byConceptId.entries()).map(([conceptId, { correct, total }]) => {
      const accuracy = correct / total;
      const components = {
        accuracy,
        timeEfficiency: 0.5,
        difficultyProgression: 0.5,
        spacedRepetitionScore: 0.5,
        tutorFeedback: 0.5,
      };
      const score = computeMasteryScore(components);
      const status = getMasteryStatus(score);
      return upsertMasteryScore(student.id, conceptId, score, components, status);
    })
  );

  await db.student.update({
    where: { id: student.id },
    data: { onboardingCompleted: true },
  });

  return NextResponse.json({ success: true, data: null });
}
