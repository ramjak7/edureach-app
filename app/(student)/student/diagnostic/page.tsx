import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { DiagnosticTest } from "@/components/student/diagnostic-test";

export const dynamic = "force-dynamic";

export default async function DiagnosticPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.student) redirect("/student/onboarding");
  if (user.student.onboardingCompleted) redirect("/student/dashboard");

  return <DiagnosticTest />;
}
