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
    <div className="h-full flex flex-col px-4 md:px-8">
      <div className="mx-auto w-full max-w-2xl flex flex-col h-full">
        <div className="shrink-0 pt-4 pb-3">
          <h1 className="text-2xl font-bold">Ask AI</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Get step-by-step explanations for any board exam doubt.
          </p>
        </div>
        {/* flex-1 min-h-0: gives AskAIClient a definite height equal to remaining flex space */}
        <div className="flex-1 min-h-0">
          <AskAIClient
            initialUsed={used}
            isFree={false} /* TEMPORARILY DISABLED FOR TESTING */
            weeklyLimit={FREE_TIER_WEEKLY_LIMIT}
          />
        </div>
      </div>
    </div>
  );
}
