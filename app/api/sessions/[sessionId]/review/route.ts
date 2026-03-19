/**
 * POST /api/sessions/[sessionId]/review
 * Student submits a 1–5 star rating + optional comment for a completed session.
 * Review is hidden from tutor for 7 days (isVisibleToTutor defaults to false).
 * Enforced: session must be verified_complete; one review per session.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ReviewerType, SessionVerificationStatus } from "@prisma/client";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(""),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { rating, comment } = result.data;

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { student: { select: { id: true } } },
    });

    if (!user?.student) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        review: { select: { id: true } },
        booking: { select: { studentId: true, tutorId: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (session.booking.studentId !== user.student.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (session.verificationStatus !== SessionVerificationStatus.verified_complete) {
      return NextResponse.json(
        { success: false, error: "Session is not yet complete" },
        { status: 400 }
      );
    }

    if (session.review) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this session" },
        { status: 409 }
      );
    }

    await db.review.create({
      data: {
        sessionId,
        reviewerId: user.id,
        reviewerType: ReviewerType.student,
        tutorId: session.booking.tutorId,
        rating,
        comment: comment || null,
        // isVisibleToTutor defaults to false — revealed after 7 days (scheduled job, Sprint 11)
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[session/review]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
