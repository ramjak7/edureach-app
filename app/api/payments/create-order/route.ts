import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";

const schema = z.object({
  bookingId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { bookingId } = result.data;

    // Verify the requester is the student who made the booking
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { student: { select: { id: true } } },
    });

    if (!user?.student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { slot: { select: { slotStart: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.studentId !== user.student.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Booking is not in pending state" },
        { status: 400 }
      );
    }

    // If already has a Razorpay order, reuse it
    if (booking.razorpayOrderId) {
      return NextResponse.json({
        success: true,
        orderId: booking.razorpayOrderId,
        amount: booking.grossFeeInr * 100,
        currency: "INR",
      });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: booking.grossFeeInr * 100,
      currency: "INR",
      receipt: bookingId.slice(0, 40),
      notes: {
        bookingId,
        studentId: user.student.id,
      },
    });

    // Save order ID to booking
    await db.booking.update({
      where: { id: bookingId },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: booking.grossFeeInr * 100,
      currency: "INR",
    });
  } catch (error) {
    console.error("[payments/create-order] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
