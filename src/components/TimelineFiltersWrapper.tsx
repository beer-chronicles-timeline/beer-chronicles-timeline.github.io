// components/TimelineFiltersWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Tag } from "@/lib/types";
import type { TagFilterMode } from "./timelineFiltering";

// Import the actual TimelineFilters component with SSR disabled
const TimelineFilters = dynamic(
  () => import("./TimelineFilters").then((mod) => mod.TimelineFilters),
  { ssr: false }
);

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
  return (
    <Suspense fallback={<div className="h-20" />}>
      <TimelineFilters {...props} />
    </Suspense>
  );
}