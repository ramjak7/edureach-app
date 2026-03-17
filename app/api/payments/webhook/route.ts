import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;

    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId: string = payment.order_id;

      // Find booking by order ID
      const booking = await db.booking.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (booking && booking.paymentStatus !== "held") {
        await db.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "held" },
        });
      }
    }

    if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId: string = payment.order_id;

      const booking = await db.booking.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (booking) {
        // Release the slot back to available on payment failure
        await db.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: "cancelled_by_student",
              paymentStatus: "refunded",
            },
          });

          if (booking.slotId) {
            await tx.tutorAvailabilitySlot.update({
              where: { id: booking.slotId },
              data: { state: "available", bookingId: null },
            });
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payments/webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
