"use client";

import { useState, useMemo } from "react";
import { TutorCard, TutorCardData } from "./tutor-card";
import { TutorFiltersPanel, TutorFilters } from "./tutor-filters";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TutorsListClientProps {
  tutors: TutorCardData[];
}

export function TutorsListClient({ tutors }: TutorsListClientProps) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TutorFilters>({
    subject: "all",
    board: "all",
    maxRate: 2000,
    availableNow: false,
  });

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesName = tutor.displayName.toLowerCase().includes(searchLower);
        const matchesSubject = tutor.subjects.some((s) =>
          s.toLowerCase().includes(searchLower)
        );
        const matchesBio = tutor.bio?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesSubject && !matchesBio) return false;
      }

      // Subject filter
      if (filters.subject !== "all") {
        if (!tutor.subjects.some((s) => s.toLowerCase() === filters.subject.toLowerCase())) {
          return false;
        }
      }

      // Board filter
      if (filters.board !== "all") {
        if (!tutor.boards.includes(filters.board as "CBSE" | "ICSE" | "Maharashtra" | "UP_Board")) {
          return false;
        }
      }

      // Max rate filter
      if (filters.maxRate < 2000) {
        if (tutor.hourlyRateMin > filters.maxRate) return false;
      }

      // Available now filter - placeholder (would need real availability data)
      // For now, skip this filter

      return true;
    });
  }, [tutors, search, filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <TutorFiltersPanel filters={filters} onFiltersChange={setFilters} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search Bar + Mobile Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, subject, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden">
            <TutorFiltersPanel filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} found
        </p>

        {/* Tutors Grid */}
        {filteredTutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">No tutors found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
