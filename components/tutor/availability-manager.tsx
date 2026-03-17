"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotData {
  id: string;
  slotStart: string;
  slotEnd: string;
  state: string;
}

interface AvailabilityManagerProps {
  tutorId: string;
  existingSlots: SlotData[];
}

// Generate 30-min time slots from 6 AM to 10 PM IST
const HOURS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes, label: `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}` };
});

function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function getSlotKey(date: Date, hour: number, minutes: number): string {
  const d = new Date(date);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
}

export function AvailabilityManager({ tutorId, existingSlots }: AvailabilityManagerProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(() => {
    const set = new Set<string>();
    existingSlots.forEach((s) => {
      if (s.state === "available" || s.state === "available_now") {
        set.add(s.slotStart);
      }
    });
    return set;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const weekStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + weekOffset * 7);
    return today;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const toggleSlot = (date: Date, hour: number, minutes: number) => {
    const key = getSlotKey(date, hour, minutes);
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, minutes, 0, 0);
    
    // Don't allow toggling past slots
    if (slotTime < now) return;

    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isSlotSelected = (date: Date, hour: number, minutes: number): boolean => {
    return selectedSlots.has(getSlotKey(date, hour, minutes));
  };

  const isSlotPast = (date: Date, hour: number, minutes: number): boolean => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, minutes, 0, 0);
    return slotTime < now;
  };

  const isSlotBooked = (date: Date, hour: number, minutes: number): boolean => {
    const key = getSlotKey(date, hour, minutes);
    return existingSlots.some((s) => s.slotStart === key && (s.state === "pending" || s.state === "in_session"));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const slots = Array.from(selectedSlots).map((slotStart) => {
        const start = new Date(slotStart);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return { slotStart, slotEnd: end.toISOString() };
      });

      const res = await fetch("/api/tutor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, slots }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Availability saved!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        <span className="text-sm font-medium">
          {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((o) => Math.min(1, o + 1))}
          disabled={weekOffset === 1}
        >
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Click slots to mark as available</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row with dates */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-xs font-medium text-muted-foreground border-r">Time (IST)</div>
              {weekDates.map((date, i) => (
                <div key={i} className="p-2 text-xs font-medium text-center border-r last:border-r-0">
                  {formatDate(date)}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="max-h-[500px] overflow-y-auto">
              {HOURS.map(({ hour, minutes, label }) => (
                <div key={label} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-1.5 text-xs text-muted-foreground border-r flex items-center justify-center">
                    {label}
                  </div>
                  {weekDates.map((date, i) => {
                    const isPast = isSlotPast(date, hour, minutes);
                    const isBooked = isSlotBooked(date, hour, minutes);
                    const isSelected = isSlotSelected(date, hour, minutes);

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast || isBooked}
                        onClick={() => toggleSlot(date, hour, minutes)}
                        className={cn(
                          "p-1.5 border-r last:border-r-0 transition-colors min-h-[32px]",
                          isPast && "bg-muted/50 cursor-not-allowed",
                          isBooked && "bg-amber-100 cursor-not-allowed",
                          !isPast && !isBooked && isSelected && "bg-green-500 hover:bg-green-600",
                          !isPast && !isBooked && !isSelected && "hover:bg-muted"
                        )}
                        title={
                          isPast ? "Past slot" : isBooked ? "Booked" : isSelected ? "Available" : "Click to make available"
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-100 border" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-muted/50 border" />
          <span>Past</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Availability
        </Button>
        {message && (
          <p className={cn("text-sm", message.type === "success" ? "text-green-600" : "text-red-600")}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
