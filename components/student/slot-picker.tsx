"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
}

interface SlotData {
  id: string;
  slotStart: string;
  slotEnd: string;
  state: string;
}

interface SlotPickerProps {
  tutorId: string;
  tutorName: string;
  hourlyRate: number;
  onBookingComplete?: () => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function SlotPicker({ tutorId, tutorName, hourlyRate, onBookingComplete }: SlotPickerProps) {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch(`/api/tutor/availability?tutorId=${tutorId}`);
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots);
        }
      } catch {
        console.error("Failed to fetch slots");
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [tutorId]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, SlotData[]> = {};
    slots.forEach((slot) => {
      const dateKey = getDateKey(new Date(slot.slotStart));
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(slot);
    });
    // Sort slots within each day
    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    });
    return grouped;
  }, [slots]);

  // Get array of next 7 days
  const daysToShow = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset + i);
      days.push(d);
    }
    return days;
  }, [dayOffset]);

  const handleBookSlot = useCallback(async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);

    try {
      // Step 1: Create booking (status: pending)
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, slotId: selectedSlot.id }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        setError(bookingData.error || "Failed to create booking");
        setBooking(false);
        return;
      }

      const bookingId: string = bookingData.booking.id;

      // Step 2: Create Razorpay order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.error || "Failed to create payment order");
        setBooking(false);
        return;
      }

      // Step 3: Load and open Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Payment gateway failed to load. Please check your connection.");
        setBooking(false);
        return;
      }

      const capturedSlot = selectedSlot;

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EduReach",
        description: `Session with ${tutorName}`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayPaymentResponse) => {
          // Step 4: Verify payment signature on server
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSlots((prev) => prev.filter((s) => s.id !== capturedSlot.id));
              setSelectedSlot(null);
              onBookingComplete?.();
              alert(
                `Payment successful! Session booked on ${formatDate(new Date(capturedSlot.slotStart))} at ${formatTime(capturedSlot.slotStart)}.\nWaiting for ${tutorName} to confirm.`
              );
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch {
            setError("Payment verification error. Please contact support.");
          }
          setBooking(false);
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            setBooking(false);
            setError("Payment was cancelled.");
          },
        },
      });

      rzp.open();
    } catch {
      setError("Network error. Please try again.");
      setBooking(false);
    }
  }, [selectedSlot, tutorId, tutorName, onBookingComplete]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Available Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No available slots in the next 2 weeks. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Book a Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDayOffset((o) => Math.max(0, o - 7))}
            disabled={dayOffset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {formatDate(daysToShow[0])} — {formatDate(daysToShow[6])}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDayOffset((o) => o + 7)}
            disabled={dayOffset >= 7}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days with slots */}
        <div className="space-y-4">
          {daysToShow.map((day) => {
            const dateKey = getDateKey(day);
            const daySlots = slotsByDate[dateKey] || [];

            if (daySlots.length === 0) return null;

            return (
              <div key={dateKey}>
                <p className="text-sm font-medium mb-2">{formatDate(day)}</p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md border transition-colors",
                        selectedSlot?.id === slot.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {formatTime(slot.slotStart)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {daysToShow.every((day) => !(slotsByDate[getDateKey(day)]?.length)) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No slots available for this week
            </p>
          )}
        </div>

        {/* Selected Slot Summary */}
        {selectedSlot && (
          <div className="border-t pt-4 space-y-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-medium">Selected:</span>{" "}
                {formatDate(new Date(selectedSlot.slotStart))} at {formatTime(selectedSlot.slotStart)}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Duration:</span> 30 minutes
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Fee:</span> ₹{Math.round(hourlyRate / 2)}
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleBookSlot} disabled={booking} className="w-full">
              {booking ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <>Pay ₹{Math.round(hourlyRate / 2)} & Book</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Payment is held securely until the tutor confirms your session
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
