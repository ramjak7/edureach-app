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
    include: { booking: { select: { tutorId: true } } },
  });

  if (!session || session.booking.tutorId !== user.tutor.id) {
    redirect("/tutor/bookings");
  }

  return (
    <div className="h-screen flex flex-col">
      <Classroom
        sessionId={sessionId}
        role="tutor"
        displayName={user.tutor.displayName}
      />
    </div>
  );
}
