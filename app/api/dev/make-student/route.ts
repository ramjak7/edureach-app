/**
 * DEV ONLY — promotes the currently signed-in user to a student with test data.
 * Use this during Sprint 4 testing to get a real Clerk session that can book sessions.
 * Remove or secure before production.
 */
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  if (process.env.ENABLE_DEV_TOOLS !== "true") {
    return NextResponse.json({ error: "Dev tools not enabled" }, { status: 403 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Could not fetch Clerk user" }, { status: 401 });
  }

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    `dev-student-${clerkId.slice(-6)}@example.com`;
  const phone =
    clerkUser.phoneNumbers?.[0]?.phoneNumber ?? "+919999900001";
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    "Dev Student";

  // Upsert the User record linked to this Clerk account
  const user = await db.user.upsert({
    where: { clerkId },
    update: { role: "student" },
    create: {
      clerkId,
      email,
      phoneNumber: phone,
      role: "student",
      accountStatus: "active",
    },
  });

  // Check if student already exists
  const existing = await db.student.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({
      success: true,
      message: "Already a student",
      studentId: existing.id,
      userId: user.id,
    });
  }

  // Generate a referral code (required field)
  const referralCode = `DEV${clerkId.slice(-6).toUpperCase()}`;

  // Create student with sensible test defaults
  const student = await db.student.create({
    data: {
      userId: user.id,
      displayName,
      board: "CBSE",
      classYear: 10,
      subscriptionTier: "free",
      consentGivenAt: new Date(),
      referralCode,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Promoted to student. Go to /student/tutors to browse and book.`,
    studentId: student.id,
    userId: user.id,
    displayName,
  });
}
