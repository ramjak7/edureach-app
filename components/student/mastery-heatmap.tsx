"use client";

import { useState } from "react";

interface MasteryScore {
  conceptId: string;
  conceptName: string;
  score: number;
}

interface MasteryHeatmapProps {
  scores: MasteryScore[];
}

function getTileColor(score: number): string {
  if (score <= 20) return "bg-gray-200 text-gray-600";
  if (score <= 45) return "bg-red-400 text-white";
  if (score <= 65) return "bg-amber-400 text-white";
  if (score <= 84) return "bg-green-400 text-white";
  return "bg-green-600 text-white";
}

function getMasteryLabel(score: number): string {
  if (score <= 20) return "Not Started";
  if (score <= 45) return "Exploring";
  if (score <= 65) return "Practiced";
  if (score <= 84) return "Mastered";
  return "Retained";
}

export function MasteryHeatmap({ scores }: MasteryHeatmapProps) {
  const [tooltip, setTooltip] = useState<MasteryScore | null>(null);

  if (scores.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Complete your diagnostic to see your mastery map.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Mastery Map</h2>
      <div className="flex flex-wrap gap-3">
        {scores.map((s) => (
          <button
            key={s.conceptId}
            className={`h-16 w-36 rounded-lg px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${getTileColor(s.score)}`}
            onClick={() =>
              setTooltip(tooltip?.conceptId === s.conceptId ? null : s)
            }
          >
            <span className="block truncate">{s.conceptName}</span>
            <span className="block text-lg font-bold">{s.score}</span>
          </button>
        ))}
      </div>

      {tooltip && (
        <div className="rounded-lg border bg-card p-3 text-sm shadow-sm">
          <p className="font-semibold">{tooltip.conceptName}</p>
          <p className="text-muted-foreground">
            Score: {tooltip.score} — {getMasteryLabel(tooltip.score)}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-400" /> Exploring (21–45)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-400" /> Practiced (46–65)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-400" /> Mastered (66–84)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-600" /> Retained (85+)
        </span>
      </div>
    </div>
  );
}
