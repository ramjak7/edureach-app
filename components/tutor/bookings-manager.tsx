"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Clock, Calendar, User, IndianRupee } from "lucide-react";

interface BookingData {
  id: string;
  status: string;
  grossFeeInr: number;
  sessionFocus: string | null;
  createdAt: string;
  confirmedAt: string | null;
  student: {
    id: string;
    displayName: string;
  };
  slot: {
    slotStart: string;
    slotEnd: string;
  } | null;
}

interface BookingsManagerProps {
  initialBookings: BookingData[];
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 border-green-300" },
  payment_held: { label: "Payment Held", className: "bg-blue-100 text-blue-800 border-blue-300" },
  in_session: { label: "In Session", className: "bg-purple-100 text-purple-800 border-purple-300" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-800 border-gray-300" },
  cancelled_by_student: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-300" },
  cancelled_by_tutor: { label: "Declined", className: "bg-red-100 text-red-800 border-red-300" },
  no_show_student: { label: "No Show (Student)", className: "bg-red-100 text-red-800 border-red-300" },
  no_show_tutor: { label: "No Show (You)", className: "bg-red-100 text-red-800 border-red-300" },
  disputed: { label: "Disputed", className: "bg-orange-100 text-orange-800 border-orange-300" },
};

function formatSlotTime(slotStart: string, slotEnd: string): string {
  const start = new Date(slotStart);
  const end = new Date(slotEnd);
  const date = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = start.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = end.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${startTime} – ${endTime}`;
}

function formatCreatedAt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter((b) =>
    ["confirmed", "payment_held"].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) => !["pending", "confirmed", "payment_held", "in_session"].includes(b.status)
  );

  async function handleAction(bookingId: string, action: "confirm" | "decline") {
    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: action === "confirm" ? "confirmed" : "cancelled_by_tutor",
                  confirmedAt: action === "confirm" ? new Date().toISOString() : null,
                }
              : b
          )
        );
      } else {
        alert(data.error || "Failed to process booking");
      }
    } catch {
      alert("Network error");
    } finally {
      setProcessingId(null);
    }
  }

  function BookingCard({ booking, showActions }: { booking: BookingData; showActions: boolean }) {
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              {/* Student & Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{booking.student.displayName}</span>
                </div>
                <Badge variant="outline" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Slot Time */}
              {booking.slot && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatSlotTime(booking.slot.slotStart, booking.slot.slotEnd)}
                </div>
              )}

              {/* Fee & Requested */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  <span>₹{booking.grossFeeInr}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Requested {formatCreatedAt(booking.createdAt)}</span>
                </div>
              </div>

              {/* Subject & Session Focus */}
              {booking.sessionFocus && (() => {
                const colonIdx = booking.sessionFocus!.indexOf(": ");
                const subject = colonIdx !== -1 ? booking.sessionFocus!.slice(0, colonIdx) : booking.sessionFocus!;
                const note = colonIdx !== -1 ? booking.sessionFocus!.slice(colonIdx + 2) : null;
                return (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {subject}
                      </Badge>
                    </div>
                    {note && (
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        <span className="font-medium text-foreground">Focus: </span>
                        {note}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            {showActions && booking.status === "pending" && (
              <div className="flex gap-2 sm:flex-col">
                <Button
                  size="sm"
                  onClick={() => handleAction(booking.id, "confirm")}
                  disabled={processingId === booking.id}
                >
                  {processingId === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Confirm
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(booking.id, "decline")}
                  disabled={processingId === booking.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No bookings yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Make sure you have availability set up for students to book with you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Pending Requests ({pendingBookings.length})
          </h2>
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Sessions */}
      {upcomingBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Upcoming Sessions ({upcomingBookings.length})
          </h2>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={false} />
            ))}
          </div>
        </section>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Past ({pastBookings.length})
          </h2>
          <div className="space-y-3">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
