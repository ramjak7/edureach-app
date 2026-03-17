import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createBookingSchema = z.object({
  tutorId: z.string().uuid(),
  slotId: z.string().uuid(),
  sessionFocus: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { tutorId, slotId, sessionFocus } = result.data;

    // Get student record via User
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { student: { select: { id: true } } },
    });

    if (!user?.student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      );
    }

    const studentId = user.student.id;

    // Get slot and verify it belongs to the tutor and is available
    const slot = await db.tutorAvailabilitySlot.findUnique({
      where: { id: slotId },
      include: { tutor: { select: { id: true, hourlyRateMin: true } } },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot not found" },
        { status: 404 }
      );
    }

    if (slot.tutorId !== tutorId) {
      return NextResponse.json(
        { success: false, error: "Slot does not belong to this tutor" },
        { status: 400 }
      );
    }

    if (slot.state !== "available") {
      return NextResponse.json(
        { success: false, error: "Slot is no longer available" },
        { status: 409 }
      );
    }

    // Check slot is in the future
    if (new Date(slot.slotStart) <= new Date()) {
      return NextResponse.json(
        { success: false, error: "Cannot book a slot in the past" },
        { status: 400 }
      );
    }

    // Calculate fee (30-minute slot = half the hourly rate)
    const grossFeeInr = Math.round(slot.tutor.hourlyRateMin / 2);

    // Create booking and update slot atomically
    const booking = await db.$transaction(async (tx) => {
      // Double-check slot is still available (for race conditions)
      const currentSlot = await tx.tutorAvailabilitySlot.findUnique({
        where: { id: slotId },
      });

      if (currentSlot?.state !== "available") {
        throw new Error("Slot was just booked by someone else");
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          studentId,
          tutorId,
          slotId,
          bookingType: "scheduled",
          status: "pending", // Awaiting tutor confirmation
          sessionFocus,
          grossFeeInr,
        },
      });

      // Update slot to pending
      await tx.tutorAvailabilitySlot.update({
        where: { id: slotId },
        data: {
          state: "pending",
          bookingId: newBooking.id,
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        grossFeeInr: booking.grossFeeInr,
      },
    });
  } catch (error) {
    console.error("POST /api/bookings error:", error);

    if (error instanceof Error && error.message.includes("just booked")) {
      return NextResponse.json(
        { success: false, error: "Slot was just booked by someone else" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get bookings for current user (student or tutor)
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "student";

    // Get user with both student and tutor profiles
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

    if (role === "tutor") {
      if (!user.tutor) {
        return NextResponse.json(
          { success: false, error: "Tutor profile not found" },
          { status: 404 }
        );
      }

      const bookings = await db.booking.findMany({
        where: { tutorId: user.tutor.id },
        include: {
          student: { select: { id: true, displayName: true } },
          slot: { select: { slotStart: true, slotEnd: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, bookings });
    } else {
      if (!user.student) {
        return NextResponse.json(
          { success: false, error: "Student profile not found" },
          { status: 404 }
        );
      }

      const bookings = await db.booking.findMany({
        where: { studentId: user.student.id },
        include: {
          tutor: { select: { id: true, displayName: true } },
          slot: { select: { slotStart: true, slotEnd: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, bookings });
    }
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
