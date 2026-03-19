import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

/**
 * Triggered by "session/completed" event.
 * Sleeps for the 2-hour dispute window, then releases payment if no dispute was filed.
 * When Razorpay Route payouts are wired up (Sprint 10), also trigger the transfer here.
 */
export const releasePayment = inngest.createFunction(
  { id: "release-payment", name: "Release Payment After Dispute Window" },
  { event: "session/completed" },
  async ({ event, step }) => {
    const { bookingId } = event.data as { bookingId: string; sessionId: string };

    // 2-hour dispute window
    const releaseAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await step.sleepUntil("wait-dispute-window", releaseAt);

    await step.run("check-and-release", async () => {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
          session: {
            include: { disputes: { select: { id: true } } },
          },
        },
      });

      if (!booking) return { skipped: true, reason: "booking not found" };
      if (booking.paymentStatus !== PaymentStatus.held) {
        return { skipped: true, reason: `payment already in state: ${booking.paymentStatus}` };
      }

      const hasOpenDispute = (booking.session?.disputes?.length ?? 0) > 0;
      if (hasOpenDispute) {
        await db.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: PaymentStatus.dispute_pending },
        });
        return { skipped: true, reason: "dispute filed — payment held for ops review" };
      }

      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: PaymentStatus.released },
      });

      return { released: true, bookingId };
    });
  }
);
