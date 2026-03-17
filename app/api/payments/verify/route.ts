import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";

const schema = z.object({
  bookingId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
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

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;

    // Verify signature: HMAC-SHA256(orderId + "|" + paymentId, secret)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    // Verify booking ownership
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { student: { select: { id: true } } },
    });

    if (!user?.student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.studentId !== user.student.id) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json({ success: false, error: "Order ID mismatch" }, { status: 400 });
    }

    // Update payment status to held (authorized = payment captured, awaiting tutor confirm)
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "held" },
    });

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error("[payments/verify] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
