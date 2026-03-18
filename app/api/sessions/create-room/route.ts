/**
 * POST /api/sessions/create-room
 * Called by the Inngest job at T-5 min before a confirmed booking's slot start.
 * Creates a 100ms room, creates a Session record, saves hmsRoomId.
 * Also callable manually for testing.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createHmsRoom } from "@/lib/hms";
import { SessionVerificationStatus } from "@prisma/client";

const schema = z.object({
  bookingId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    // Accept calls from Inngest (no user session) or authenticated admins/tutors
    const { userId: clerkId } = await auth();

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { bookingId } = result.data;

    // Verify booking exists and is confirmed
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: { select: { id: true, hmsRoomId: true } },
        tutor: { select: { userId: true } },
        student: { select: { userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { success: false, error: "Booking is not confirmed" },
        { status: 400 }
      );
    }

    // If session + room already exist, return existing
    if (booking.session?.hmsRoomId) {
      return NextResponse.json({
        success: true,
        sessionId: booking.session.id,
        hmsRoomId: booking.session.hmsRoomId,
        alreadyExisted: true,
      });
    }

    // Verify caller is the tutor or skip auth check for internal Inngest calls
    if (clerkId) {
      const user = await db.user.findUnique({ where: { clerkId } });
      if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      // Allow tutor of this booking or admin
      const isTutor = user.id === booking.tutor.userId;
      const isAdmin = user.role === "admin";
      if (!isTutor && !isAdmin) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    // Create 100ms room
    const hmsRoomId = await createHmsRoom(bookingId);

    // Create Session record (or update if already created without a room)
    const session = await db.session.upsert({
      where: { bookingId },
      update: { hmsRoomId },
      create: {
        bookingId,
        hmsRoomId,
        verificationStatus: SessionVerificationStatus.pending,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      hmsRoomId,
    });
  } catch (err) {
    console.error("[create-room]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
