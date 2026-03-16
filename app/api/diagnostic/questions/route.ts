import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const { board, classYear } = user.student;

  const baseWhere = { type: "practice_question" as const, productionStatus: "live" as const };
  const orderBy = [{ conceptId: "asc" as const }, { difficultyLevel: "asc" as const }];
  const select = {
    id: true,
    conceptId: true,
    difficultyLevel: true,
    questionText: true,
    options: true,
    concept: { select: { id: true, name: true } },
  };

  // Try exact board+class match first; fall back to all live questions (covers
  // boards not yet seeded — important during testing and early content rollout)
  let questions = await db.contentObject.findMany({
    where: { ...baseWhere, board, classYear },
    select,
    orderBy,
  });

  if (questions.length === 0) {
    questions = await db.contentObject.findMany({
      where: baseWhere,
      select,
      orderBy,
    });
  }

  return NextResponse.json({ success: true, data: questions });
}
