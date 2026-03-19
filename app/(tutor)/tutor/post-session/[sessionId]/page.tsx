import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PostSessionForm } from "@/components/tutor/post-session-form";

export default async function PostSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { sessionId } = await params;

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { tutor: { select: { id: true } } },
  });

  if (!user?.tutor) redirect("/tutor/dashboard");

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        select: {
          tutorId: true,
          sessionFocus: true,
          student: { select: { displayName: true } },
        },
      },
    },
  });

  if (!session || session.booking.tutorId !== user.tutor.id) {
    redirect("/tutor/bookings");
  }

  return (
    <div className="max-w-xl mx-auto p-6 py-12">
      <PostSessionForm
        sessionId={sessionId}
        studentName={session.booking.student.displayName}
        subject={session.booking.sessionFocus}
        alreadySubmitted={session.tutorObjectiveAchieved !== null}
      />
    </div>
  );
}
