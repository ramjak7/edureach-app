import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { AvailabilityManager } from "@/components/tutor/availability-manager";

export const dynamic = "force-dynamic";

export default async function TutorAvailabilityPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { tutor: true },
  });
  if (!user) redirect("/sign-in");
  if (!user.tutor) redirect("/tutor/onboarding");

  const { tutor } = user;

  // Fetch existing availability slots for the next 14 days
  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const slots = await db.tutorAvailabilitySlot.findMany({
    where: {
      tutorId: tutor.id,
      slotStart: { gte: now, lte: twoWeeksLater },
    },
    orderBy: { slotStart: "asc" },
  });

  const slotsData = slots.map((s) => ({
    id: s.id,
    slotStart: s.slotStart.toISOString(),
    slotEnd: s.slotEnd.toISOString(),
    state: s.state,
  }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manage Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your available time slots for the next 2 weeks. Click to toggle slots.
          </p>
        </div>
        <AvailabilityManager tutorId={tutor.id} existingSlots={slotsData} />
      </div>
    </div>
  );
}
