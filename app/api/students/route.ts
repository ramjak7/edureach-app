import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { StudentRegistrationSchema } from "@/lib/validators/student";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  // Idempotency — return existing student if already created
  const existing = await db.student.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ success: true, data: { studentId: existing.id } });
  }

  const body = await req.json();
  const parsed = StudentRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { displayName, board, classYear, targetExamScore } = parsed.data;

  const referralCode = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  const student = await db.student.create({
    data: {
      userId: user.id,
      displayName,
      board,
      classYear,
      targetExamScore: targetExamScore ?? null,
      consentGivenAt: new Date(),
      referralCode,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true, data: { studentId: student.id } }, { status: 201 });
}
