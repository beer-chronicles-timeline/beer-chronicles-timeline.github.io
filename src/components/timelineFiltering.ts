// components/timelineFiltering.ts
import {
  compareEventsChronologicallyAscending,
  compareEventsChronologicallyDescending,
  getEventTimelineYear,
} from "./timelineUtils";
import type { TimelineEvent } from "@/lib/types";

export type TagFilterMode = "all" | "any";

type FilterTimelineEventsArgs = {
  events: TimelineEvent[];
  activeCategory: string | null;
  startYear: number;
  endYear: number;
  selectedTagIds: string[];
  tagFilterMode?: TagFilterMode;
  isOldestFirst: boolean;
  searchQuery: string;
};

export function filterTimelineEvents({
  events,
  activeCategory,
  startYear,
  endYear,
  selectedTagIds,
  tagFilterMode = "all",
  isOldestFirst,
  searchQuery,
}: FilterTimelineEventsArgs): TimelineEvent[] {
  const filtered = events.filter((event) => {
    if (activeCategory && event.category !== activeCategory) {
      return false;
    }

    const eventYear = getEventTimelineYear(event);

    if (
      eventYear === null ||
      eventYear < startYear ||
      eventYear > endYear
    ) {
      return false;
    }

    if (selectedTagIds.length > 0) {
      const eventTagIds = (event.tags ?? []).map((tag) => tag.id);

      const matchesSelectedTags =
        tagFilterMode === "any"
          ? selectedTagIds.some((id) => eventTagIds.includes(id))
          : selectedTagIds.every((id) => eventTagIds.includes(id));

      if (!matchesSelectedTags) {
        return false;
      }
    }

    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery !== "") {
      const tokens = trimmedQuery
        .split(/\s+/)
        .filter((token) => token.length > 0);

      const lowerTitle = (event.title || "").toLowerCase();
      const lowerDescription = (event.description || "").toLowerCase();

      const allTokensMatch = tokens.every((token) => {
        const lowerToken = token.toLowerCase();

        return (
          lowerTitle.includes(lowerToken) ||
          lowerDescription.includes(lowerToken)
        );
      });

      if (!allTokensMatch) {
        return false;
      }
    }

    return true;
  });

  return filtered.sort(
    isOldestFirst
      ? compareEventsChronologicallyAscending
      : compareEventsChronologicallyDescending
  );
}