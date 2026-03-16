import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { AskAIClient } from "@/components/student/askai-client";

export const dynamic = "force-dynamic";

const FREE_TIER_WEEKLY_LIMIT = 5;

export default async function AskAIPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.student) redirect("/student/onboarding");

  const { student } = user;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const used = await db.askAIQuery.count({
    where: { studentId: student.id, createdAt: { gte: weekAgo }, promptInjection: false },
  });

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ask AI</h1>
          <p className="mt-1 text-muted-foreground">
            Get step-by-step explanations for any board exam doubt.
          </p>
        </div>
        <AskAIClient
          initialUsed={used}
          isFree={student.subscriptionTier === "free"}
          weeklyLimit={FREE_TIER_WEEKLY_LIMIT}
        />
      </div>
    </main>
  );
}
