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
    include: { booking: { select: { studentId: true } } },
  });

  if (!session || session.booking.studentId !== user.student.id) {
    redirect("/student/bookings");
  }

  return (
    <div className="h-screen flex flex-col">
      <Classroom
        sessionId={sessionId}
        role="student"
        displayName={user.student.displayName}
      />
    </div>
  );
}
