"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TutorObjectiveAchieved } from "@prisma/client";

interface PostSessionFormProps {
  sessionId: string;
  studentName: string;
  subject: string | null;
  alreadySubmitted: boolean;
}

const OBJECTIVE_OPTIONS: { value: TutorObjectiveAchieved; label: string; description: string }[] = [
  { value: "achieved", label: "Achieved", description: "Student met the session objective" },
  { value: "partially", label: "Partially achieved", description: "Some progress made, more work needed" },
  { value: "not_achieved", label: "Not achieved", description: "Objective was not met this session" },
];

export function PostSessionForm({
  sessionId,
  studentName,
  subject,
  alreadySubmitted,
}: PostSessionFormProps) {
  const router = useRouter();
  const [objective, setObjective] = useState<TutorObjectiveAchieved>("achieved");
  const [notes, setNotes] = useState("");
  const [homeworkAssigned, setHomeworkAssigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (alreadySubmitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-lg font-semibold text-green-600">Post-session notes submitted ✓</p>
        <p className="text-muted-foreground text-sm">Your notes have been shared with the student.</p>
        <Button variant="outline" onClick={() => router.push("/tutor/bookings")}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/sessions/${sessionId}/post-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectiveAchieved: objective,
        notes,
        homeworkAssigned,
      }),
    });

    if (res.ok) {
      router.push("/tutor/bookings");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Post-Session Notes</h2>
        <p className="text-muted-foreground text-sm">
          Session with <span className="font-medium">{studentName}</span>
          {subject ? ` · ${subject}` : ""}
        </p>
      </div>

      {/* Objective */}
      <div className="space-y-3">
        <Label className="text-base">Session objective</Label>
        <div className="space-y-2">
          {OBJECTIVE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                objective === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="objective"
                value={opt.value}
                checked={objective === opt.value}
                onChange={() => setObjective(opt.value)}
                className="mt-1 accent-primary"
              />
              <span className="space-y-0.5">
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes" className="text-base">Notes for student</Label>
          <span className="text-xs text-muted-foreground">{notes.length}/500</span>
        </div>
        <Textarea
          id="notes"
          placeholder="What did you cover? Any specific tips or observations for the student…"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">Visible to student and parent after submission.</p>
      </div>

      {/* Homework */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Homework assigned</p>
          <p className="text-xs text-muted-foreground">Include details in the notes above</p>
        </div>
        <Switch
          checked={homeworkAssigned}
          onCheckedChange={setHomeworkAssigned}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Submitting…" : "Submit & finish"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/tutor/bookings")}
          disabled={isSubmitting}
        >
          Skip
        </Button>
      </div>
    </form>
  );
}
