import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Classroom } from "@/components/shared/classroom";

export default async function StudentClassroomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { sessionId } = await params;

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: { select: { id: true, displayName: true } } },
  });

  if (!user?.student) redirect("/student/onboarding");

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        select: {
          studentId: true,
          sessionFocus: true,
          slot: { select: { slotStart: true, slotEnd: true } },
          tutor: { select: { displayName: true } },
        },
      },
    },
  });

  if (!session || session.booking.studentId !== user.student.id) {
    redirect("/student/bookings");
  }

  return (
    <Classroom
      sessionId={sessionId}
      role="student"
      displayName={user.student.displayName}
      otherPartyName={session.booking.tutor.displayName}
      subject={session.booking.sessionFocus}
      slotStart={session.booking.slot?.slotStart.toISOString() ?? null}
      slotEnd={session.booking.slot?.slotEnd.toISOString() ?? null}
      backHref="/student/bookings"
    />
  );
}
