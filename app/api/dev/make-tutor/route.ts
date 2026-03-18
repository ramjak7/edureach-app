/**
 * DEV ONLY — promotes the currently signed-in user to a tutor with test data.
 * Use this during Sprint 4 testing to get a real Clerk session that can access /tutor/bookings.
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
    `dev-tutor-${clerkId.slice(-6)}@example.com`;
  const phone =
    clerkUser.phoneNumbers?.[0]?.phoneNumber ?? "+919999900000";
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    "Dev Tutor";

  // Upsert the User record linked to this Clerk account
  const user = await db.user.upsert({
    where: { clerkId },
    update: { role: "tutor" },
    create: {
      clerkId,
      email,
      phoneNumber: phone,
      role: "tutor",
      accountStatus: "active",
    },
  });

  // Check if tutor record already exists
  const existing = await db.tutor.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({
      success: true,
      message: "Already a tutor",
      tutorId: existing.id,
      userId: user.id,
    });
  }

  // Create tutor with sensible test defaults
  const tutor = await db.tutor.create({
    data: {
      userId: user.id,
      displayName,
      tutorType: "marketplace",
      accountStatus: "active",
      tpsScore: 80,
      tpsTier: "gold",
      hourlyRateMin: 500,
      hourlyRateMax: 800,
      subjects: ["Mathematics", "Physics"],
      boards: ["CBSE", "ICSE"],
      classYears: [9, 10, 11, 12],
      bio: `Dev test tutor account for ${displayName}`,
      backgroundCheckStatus: "passed",
    },
  });

  return NextResponse.json({
    success: true,
    message: `Promoted to tutor. Go to /tutor/bookings to test.`,
    tutorId: tutor.id,
    userId: user.id,
    displayName,
  });
}
