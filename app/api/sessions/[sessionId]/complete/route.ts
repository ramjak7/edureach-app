/**
 * POST /api/sessions/[sessionId]/complete
 * Tutor-triggered session completion (placeholder flow while HMS video is deferred).
 * Sets actualStartAt/actualEndAt using slot times as proxy, marks booking completed,
 * fires session/completed Inngest event to start the 2-hour dispute window.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { BookingStatus, PaymentStatus, SessionVerificationStatus } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            slot: { select: { slotStart: true, slotEnd: true } },
            tutor: { include: { user: { select: { clerkId: true } } } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (session.booking.tutor.user.clerkId !== clerkId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { booking } = session;

    if (booking.status === BookingStatus.completed) {
      return NextResponse.json(
        { success: false, error: "Session already completed" },
        { status: 409 }
      );
    }

    if (booking.status !== BookingStatus.confirmed && booking.status !== BookingStatus.in_session) {
      return NextResponse.json(
        { success: false, error: "Booking is not in a completable state" },
        { status: 400 }
      );
    }

    // Proxy timestamps — real HMS webhooks will replace these when video is integrated
    const now = new Date();
    const proxyStart = booking.slot?.slotStart ?? session.createdAt;
    const proxyEnd = now;
    const durationMinutes = Math.round((proxyEnd.getTime() - proxyStart.getTime()) / 60000);

    await db.$transaction([
      db.session.update({
        where: { id: sessionId },
        data: {
          actualStartAt: proxyStart,
          actualEndAt: proxyEnd,
          actualDurationMinutes: durationMinutes,
          verificationStatus: SessionVerificationStatus.verified_complete,
        },
      }),
      db.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.completed },
      }),
    ]);

    await inngest.send({
      name: "session/completed",
      data: { sessionId, bookingId: booking.id },
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("[session/complete]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
