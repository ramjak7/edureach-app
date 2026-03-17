"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award } from "lucide-react";

export interface TutorCardData {
  id: string;
  displayName: string;
  tpsTier: "platinum" | "gold" | "silver" | "bronze" | "under_review";
  subjects: string[];
  boards: string[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  bio: string | null;
  tpsScore: number;
  introVideoUrl: string | null;
}

const TPS_TIER_CONFIG: Record<string, { label: string; className: string }> = {
  platinum: { label: "Platinum", className: "bg-slate-200 text-slate-900 border-slate-400" },
  gold: { label: "Gold", className: "bg-amber-100 text-amber-800 border-amber-300" },
  silver: { label: "Silver", className: "bg-gray-100 text-gray-700 border-gray-300" },
  bronze: { label: "Bronze", className: "bg-orange-100 text-orange-800 border-orange-300" },
  under_review: { label: "New", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

export function TutorCard({ tutor }: { tutor: TutorCardData }) {
  const tierConfig = TPS_TIER_CONFIG[tutor.tpsTier] || TPS_TIER_CONFIG.bronze;
  const shortBio = tutor.bio ? tutor.bio.slice(0, 100) + (tutor.bio.length > 100 ? "…" : "") : "No bio available";

  return (
    <Link href={`/student/tutors/${tutor.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-4 space-y-3">
          {/* Header: Name + Tier Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{tutor.displayName}</h3>
            <Badge variant="outline" className={`shrink-0 ${tierConfig.className}`}>
              <Award className="h-3 w-3 mr-1" />
              {tierConfig.label}
            </Badge>
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs font-normal">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>

          {/* Bio snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2">{shortBio}</p>

          {/* Footer: Rate + TPS Score */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                ₹{tutor.hourlyRateMin}
                {tutor.hourlyRateMin !== tutor.hourlyRateMax && `–${tutor.hourlyRateMax}`}
              </span>
              <span className="text-muted-foreground">/hr</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{tutor.tpsScore.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
