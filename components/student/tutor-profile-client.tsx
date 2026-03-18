"use client";

import Link from "next/link";
import { ArrowLeft, Award, Star, Video, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlotPicker } from "@/components/student/slot-picker";

interface TutorProfileData {
  id: string;
  displayName: string;
  tpsTier: "platinum" | "gold" | "silver" | "bronze" | "under_review";
  subjects: string[];
  boards: string[];
  classYears: number[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  bio: string | null;
  tpsScore: number;
  introVideoUrl: string | null;
  reviews: {
    id: string;
    rating: number;
    reviewText: string | null;
    createdAt: string;
  }[];
}

const TPS_TIER_CONFIG: Record<string, { label: string; className: string }> = {
  platinum: { label: "Platinum Tutor", className: "bg-slate-200 text-slate-900 border-slate-400" },
  gold: { label: "Gold Tutor", className: "bg-amber-100 text-amber-800 border-amber-300" },
  silver: { label: "Silver Tutor", className: "bg-gray-100 text-gray-700 border-gray-300" },
  bronze: { label: "Bronze Tutor", className: "bg-orange-100 text-orange-800 border-orange-300" },
  under_review: { label: "New Tutor", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

const BOARD_LABELS: Record<string, string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  Maharashtra: "Maharashtra Board",
  UP_Board: "UP Board",
};

export function TutorProfileClient({ tutor }: { tutor: TutorProfileData }) {
  const tierConfig = TPS_TIER_CONFIG[tutor.tpsTier] || TPS_TIER_CONFIG.bronze;
  const avgRating =
    tutor.reviews.length > 0
      ? tutor.reviews.reduce((sum, r) => sum + r.rating, 0) / tutor.reviews.length
      : null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/student/tutors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tutors
      </Link>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-muted-foreground">
            {tutor.displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{tutor.displayName}</h1>
            <Badge variant="outline" className={tierConfig.className}>
              <Award className="h-3 w-3 mr-1" />
              {tierConfig.label}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{tutor.tpsScore.toFixed(1)}</span>
              <span className="text-muted-foreground">TPS Score</span>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({tutor.reviews.length} review{tutor.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          {/* Rate */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">
              ₹{tutor.hourlyRateMin}
              {tutor.hourlyRateMin !== tutor.hourlyRateMax && `–${tutor.hourlyRateMax}`}
            </span>
            <span className="text-muted-foreground">per hour</span>
          </div>
        </div>
      </div>

      {/* Subjects & Boards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Teaches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Boards</p>
            <div className="flex flex-wrap gap-2">
              {tutor.boards.map((board) => (
                <Badge key={board} variant="outline">
                  {BOARD_LABELS[board] || board}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Classes</p>
            <p className="text-sm">
              {tutor.classYears.sort((a, b) => a - b).join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {tutor.bio && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{tutor.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Intro Video Placeholder */}
      {tutor.introVideoUrl ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4" />
              Introduction Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Video player placeholder</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Slot Picker */}
      <div id="slot-picker">
        <SlotPicker
          tutorId={tutor.id}
          tutorName={tutor.displayName}
          hourlyRate={tutor.hourlyRateMin}
          tutorSubjects={tutor.subjects}
        />
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Reviews ({tutor.reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tutor.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to book a session!
            </p>
          ) : (
            <div className="space-y-4">
              {tutor.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.reviewText && (
                    <p className="text-sm">{review.reviewText}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Book Session CTA */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur border rounded-lg p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Ready to learn with {tutor.displayName}?</p>
            <p className="text-sm text-muted-foreground">
              Book a 1-on-1 session starting at ₹{tutor.hourlyRateMin}/hr
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              const el = document.getElementById("slot-picker");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          >
            Book a Session
          </Button>
        </div>
      </div>
    </div>
  );
}
