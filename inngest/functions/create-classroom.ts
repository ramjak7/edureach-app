import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { createHmsRoom } from "@/lib/hms";
import { SessionVerificationStatus } from "@prisma/client";

/**
 * Triggered when a booking is confirmed (event: "booking/confirmed").
 * Schedules a room creation step at T-5 minutes before the slot start.
 */
export const createClassroom = inngest.createFunction(
  { id: "create-classroom", name: "Create 100ms Classroom" },
  { event: "booking/confirmed" },
  async ({ event, step }) => {
    const { bookingId, slotStart } = event.data as {
      bookingId: string;
      slotStart: string; // ISO string
    };

    // Wait until T-5 minutes before session starts
    const roomCreateAt = new Date(new Date(slotStart).getTime() - 5 * 60 * 1000);
    const now = new Date();

    if (roomCreateAt > now) {
      await step.sleepUntil("wait-until-t-minus-5", roomCreateAt);
    }

    // Create the 100ms room and session record
    await step.run("create-hms-room", async () => {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: { session: { select: { id: true, hmsRoomId: true } } },
      });

      if (!booking || booking.status !== "confirmed") {
        throw new Error(`Booking ${bookingId} not confirmed — skipping room creation`);
      }

      // Skip if already created
      if (booking.session?.hmsRoomId) return { alreadyExisted: true };

      const hmsRoomId = await createHmsRoom(bookingId);

      await db.session.upsert({
        where: { bookingId },
        update: { hmsRoomId },
        create: {
          bookingId,
          hmsRoomId,
          verificationStatus: SessionVerificationStatus.pending,
        },
      });

      return { hmsRoomId };
    });
  }
);
