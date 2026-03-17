import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { db } from "@/lib/db";
import { TutorProfileClient } from "@/components/student/tutor-profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tutorId: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { tutorId } = await params;
  
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.student) redirect("/student/onboarding");

  // Fetch tutor with reviews
  const tutor = await db.tutor.findUnique({
    where: { id: tutorId, accountStatus: "active" },
    include: {
      reviews: {
        orderBy: { submittedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!tutor) {
    notFound();
  }

  // Transform data
  const tutorData = {
    id: tutor.id,
    displayName: tutor.displayName,
    tpsTier: tutor.tpsTier as "platinum" | "gold" | "silver" | "bronze" | "under_review",
    subjects: tutor.subjects,
    boards: tutor.boards,
    classYears: tutor.classYears,
    hourlyRateMin: tutor.hourlyRateMin,
    hourlyRateMax: tutor.hourlyRateMax,
    bio: tutor.bio,
    tpsScore: Number(tutor.tpsScore),
    introVideoUrl: tutor.introVideoUrl,
    reviews: tutor.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      reviewText: r.comment,
      createdAt: r.submittedAt.toISOString(),
    })),
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-6">
        <TutorProfileClient tutor={tutorData} />
      </div>
    </div>
  );
}
