import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";

const actionSchema = z.object({
  action: z.enum(["confirm", "decline"]),
});

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    const body = await req.json();
    const result = actionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const { action } = result.data;

    // Get tutor record via User
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { tutor: { select: { id: true } } },
    });

    if (!user?.tutor) {
      return NextResponse.json(
        { success: false, error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    const tutorId = user.tutor.id;

    // Get booking and verify it belongs to this tutor
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.tutorId !== tutorId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to modify this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Booking is not in pending status" },
        { status: 400 }
      );
    }

    if (action === "confirm") {
      // Confirm the booking
      await db.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });

        // Update slot state to blocked (confirmed)
        if (booking.slotId) {
          await tx.tutorAvailabilitySlot.update({
            where: { id: booking.slotId },
            data: { state: "blocked" },
          });
        }
      });

      return NextResponse.json({ success: true, status: "confirmed" });
    } else {
      // Decline the booking
      await db.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "cancelled_by_tutor" },
        });

        // Release the slot back to available
        if (booking.slotId) {
          await tx.tutorAvailabilitySlot.update({
            where: { id: booking.slotId },
            data: {
              state: "available",
              bookingId: null,
            },
          });
        }
      });

      return NextResponse.json({ success: true, status: "cancelled_by_tutor" });
    }
  } catch (error) {
    console.error("PATCH /api/bookings/[bookingId] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET a single booking
export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    // Get user's student and tutor IDs
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        student: { select: { id: true } },
        tutor: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true, displayName: true } },
        tutor: { select: { id: true, displayName: true } },
        slot: { select: { slotStart: true, slotEnd: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user is either the student or tutor
    const isStudent = user.student?.id === booking.studentId;
    const isTutor = user.tutor?.id === booking.tutorId;
    if (!isStudent && !isTutor) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        grossFeeInr: booking.grossFeeInr,
        sessionFocus: booking.sessionFocus,
        createdAt: booking.createdAt.toISOString(),
        confirmedAt: booking.confirmedAt?.toISOString() || null,
        student: {
          id: booking.student.id,
          displayName: booking.student.displayName,
        },
        tutor: {
          id: booking.tutor.id,
          displayName: booking.tutor.displayName,
        },
        slot: booking.slot
          ? {
              slotStart: booking.slot.slotStart.toISOString(),
              slotEnd: booking.slot.slotEnd.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/bookings/[bookingId] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
