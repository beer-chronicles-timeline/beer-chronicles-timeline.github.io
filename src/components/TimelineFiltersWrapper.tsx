// components/TimelineFiltersWrapper.tsx
"use client";

import { TimelineFilters } from "./TimelineFilters";
import type { Tag } from "@/lib/types";
import type { TagFilterMode } from "./timelineFiltering";

type TimelineFiltersWrapperProps = {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  startYear: number;
  endYear: number;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;

  // Tags shown in the manual dropdown
  allTags: Tag[];

  // Complete tag list used for resolving direct links
  urlTags: Tag[];

  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  tagFilterMode: TagFilterMode;
  setTagFilterMode: (mode: TagFilterMode) => void;
  tagCounts?: Map<string, number>;
  minYear: number;
  maxYear: number;
};

export function TimelineFiltersWrapper(
  props: TimelineFiltersWrapperProps
) {
  return <TimelineFilters {...props} />;
}
