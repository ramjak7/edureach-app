import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { MasteryHeatmap } from "@/components/student/mastery-heatmap";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.student) redirect("/student/onboarding");
  if (!user.student.onboardingCompleted) redirect("/student/diagnostic");

  const masteryScores = await db.masteryScore.findMany({
    where: { studentId: user.student.id },
    include: { concept: { select: { name: true } } },
    orderBy: { score: "desc" },
  });

  const scores = masteryScores.map((m) => ({
    conceptId: m.conceptId,
    conceptName: m.concept.name,
    score: m.score.toNumber(),
  }));

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user.student.displayName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user.student.board} · Class {user.student.classYear}
          </p>
        </div>
        <MasteryHeatmap scores={scores} />
      </div>
    </main>
  );
}
