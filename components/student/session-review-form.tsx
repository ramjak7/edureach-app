"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface SessionReviewFormProps {
  sessionId: string;
  tutorName: string;
}

export function SessionReviewForm({ sessionId, tutorName }: SessionReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
        Thanks for rating your session with {tutorName}!
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/sessions/${sessionId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit review.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg bg-muted/50 border p-4">
      <p className="text-sm font-medium">Rate your session with {tutorName}</p>

      {/* Star rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus:outline-none"
            aria-label={`${star} star`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="space-y-2">
          <Textarea
            placeholder="Optional: share what went well or could be improved (max 500 chars)"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={2}
            className="text-sm"
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit rating"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
