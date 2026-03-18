import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, IndianRupee } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting tutor", className: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 border-green-300" },
  payment_held: { label: "Payment held", className: "bg-blue-100 text-blue-800 border-blue-300" },
  in_session: { label: "In session", className: "bg-purple-100 text-purple-800 border-purple-300" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-700 border-gray-300" },
  cancelled_by_student: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-300" },
  cancelled_by_tutor: { label: "Declined by tutor", className: "bg-red-100 text-red-700 border-red-300" },
  disputed: { label: "Disputed", className: "bg-orange-100 text-orange-800 border-orange-300" },
};

function formatSlot(start: Date, end: Date) {
  const date = start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const startTime = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const endTime = end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time: `${startTime} – ${endTime}` };
}

export default async function StudentBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: { select: { id: true } } },
  });
  if (!user?.student) redirect("/student/onboarding");

  const bookings = await db.booking.findMany({
    where: { studentId: user.student.id },
    include: {
      tutor: { select: { displayName: true, subjects: true } },
      slot: { select: { slotStart: true, slotEnd: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.filter((b) =>
    ["pending", "confirmed", "payment_held", "in_session"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    !["pending", "confirmed", "payment_held", "in_session"].includes(b.status)
  );

  function BookingCard({ booking }: { booking: (typeof bookings)[0] }) {
    const statusConfig = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
    const slotInfo = booking.slot
      ? formatSlot(booking.slot.slotStart, booking.slot.slotEnd)
      : null;

    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">{booking.tutor.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.tutor.subjects.slice(0, 2).join(", ")}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>

          {slotInfo && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {slotInfo.date}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {slotInfo.time}
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4" />
                ₹{booking.grossFeeInr}
              </div>
            </div>
          )}

          {booking.sessionFocus && (
            <p className="text-sm bg-muted/50 rounded px-2 py-1">
              <span className="text-muted-foreground">Focus: </span>
              {booking.sessionFocus}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold">My Bookings</h1>

        {bookings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No bookings yet.</p>
              <p className="text-sm mt-1">
                Head to <a href="/student/tutors" className="underline">Find a Tutor</a> to book your first session.
              </p>
            </CardContent>
          </Card>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
              Upcoming ({upcoming.length})
            </h2>
            <div className="space-y-3">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
              Past ({past.length})
            </h2>
            <div className="space-y-3">
              {past.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
