import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/student/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");

  // Already has a student profile — go to appropriate next step
  if (user.student) {
    if (!user.student.onboardingCompleted) redirect("/student/diagnostic");
    redirect("/student/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <OnboardingForm />
    </main>
  );
}
