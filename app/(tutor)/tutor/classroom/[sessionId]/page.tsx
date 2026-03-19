import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Classroom } from "@/components/shared/classroom";

export default async function TutorClassroomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { sessionId } = await params;

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { tutor: { select: { id: true, displayName: true } } },
  });

  if (!user?.tutor) redirect("/tutor/dashboard");

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        select: {
          tutorId: true,
          sessionFocus: true,
          slot: { select: { slotStart: true, slotEnd: true } },
          student: { select: { displayName: true } },
        },
      },
    },
  });

  if (!session || session.booking.tutorId !== user.tutor.id) {
    redirect("/tutor/bookings");
  }

  return (
    <Classroom
      sessionId={sessionId}
      role="tutor"
      displayName={user.tutor.displayName}
      otherPartyName={session.booking.student.displayName}
      subject={session.booking.sessionFocus}
      slotStart={session.booking.slot?.slotStart.toISOString() ?? null}
      slotEnd={session.booking.slot?.slotEnd.toISOString() ?? null}
      backHref="/tutor/bookings"
    />
  );
}

