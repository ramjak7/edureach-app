import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BookingsManager } from "@/components/tutor/bookings-manager";

export default async function TutorBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { tutor: { select: { id: true } } },
  });

  if (!user?.tutor) redirect("/onboarding");

  // Fetch all bookings for this tutor
  const bookings = await db.booking.findMany({
    where: { tutorId: user.tutor.id },
    include: {
      student: { select: { id: true, displayName: true } },
      slot: { select: { slotStart: true, slotEnd: true } },
    },
    orderBy: [
      { status: "asc" }, // pending first
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <BookingsManager
        initialBookings={bookings.map((b) => ({
          id: b.id,
          status: b.status,
          grossFeeInr: b.grossFeeInr,
          sessionFocus: b.sessionFocus,
          createdAt: b.createdAt.toISOString(),
          confirmedAt: b.confirmedAt?.toISOString() || null,
          student: {
            id: b.student.id,
            displayName: b.student.displayName,
          },
          slot: b.slot
            ? {
                slotStart: b.slot.slotStart.toISOString(),
                slotEnd: b.slot.slotEnd.toISOString(),
              }
            : null,
        }))}
      />
    </div>
  );
}
