import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { TutorsListClient } from "@/components/student/tutors-list-client";

export const dynamic = "force-dynamic";

export default async function TutorsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.student) redirect("/student/onboarding");

  // Fetch all active tutors, ordered by TPS score descending
  const tutors = await db.tutor.findMany({
    where: { accountStatus: "active" },
    orderBy: { tpsScore: "desc" },
    select: {
      id: true,
      displayName: true,
      tpsTier: true,
      subjects: true,
      boards: true,
      hourlyRateMin: true,
      hourlyRateMax: true,
      bio: true,
      tpsScore: true,
      introVideoUrl: true,
    },
  });

  // Transform data for client component
  const tutorsData = tutors.map((t) => ({
    id: t.id,
    displayName: t.displayName,
    tpsTier: t.tpsTier as "platinum" | "gold" | "silver" | "bronze" | "under_review",
    subjects: t.subjects,
    boards: t.boards,
    hourlyRateMin: t.hourlyRateMin,
    hourlyRateMax: t.hourlyRateMax,
    bio: t.bio,
    tpsScore: Number(t.tpsScore),
    introVideoUrl: t.introVideoUrl,
  }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Find a Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse expert tutors for personalized 1-on-1 sessions
          </p>
        </div>
        <TutorsListClient tutors={tutorsData} />
      </div>
    </div>
  );
}
