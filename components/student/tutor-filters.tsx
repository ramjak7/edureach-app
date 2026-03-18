"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "Computer Science",
  "Accountancy",
  "Economics",
  "Business Studies",
];

const BOARDS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "Maharashtra", label: "Maharashtra Board" },
  { value: "UP_Board", label: "UP Board" },
];

export interface TutorFilters {
  subject: string;
  board: string;
  maxRate: number;
  availableNow: boolean;
}

interface TutorFiltersProps {
  filters: TutorFilters;
  onFiltersChange: (filters: TutorFilters) => void;
}

export function TutorFiltersPanel({ filters, onFiltersChange }: TutorFiltersProps) {
  const updateFilter = <K extends keyof TutorFilters>(key: K, value: TutorFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Filters
      </h3>

      {/* Subject Filter */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={filters.subject}
          onValueChange={(v) => updateFilter("subject", v)}
        >
          <SelectTrigger id="subject">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board Filter */}
      <div className="space-y-2">
        <Label htmlFor="board">Board</Label>
        <Select
          value={filters.board}
          onValueChange={(v) => updateFilter("board", v)}
        >
          <SelectTrigger id="board">
            <SelectValue placeholder="All boards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All boards</SelectItem>
            {BOARDS.map((board) => (
              <SelectItem key={board.value} value={board.value}>
                {board.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max Hourly Rate Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Max hourly rate</Label>
          <span className="text-sm font-medium">
            {filters.maxRate === 2000 ? "Any" : `₹${filters.maxRate}/hr`}
          </span>
        </div>
        <Slider
          value={[filters.maxRate]}
          onValueChange={([v]) => updateFilter("maxRate", v)}
          min={100}
          max={2000}
          step={50}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹100</span>
          <span>₹2000+</span>
        </div>
      </div>

      {/* Available Now Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="available-now" className="cursor-pointer">
          Available now
        </Label>
        <Switch
          id="available-now"
          checked={filters.availableNow}
          onCheckedChange={(v) => updateFilter("availableNow", v)}
        />
      </div>
    </div>
  );
}
