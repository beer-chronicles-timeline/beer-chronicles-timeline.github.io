// components/timelineFiltering.ts
import type { TimelineEvent } from "@/lib/types";

type FilterTimelineEventsArgs = {
  events: TimelineEvent[];
  activeCategory: string | null;
  startYear: number;
  endYear: number;
  selectedTagIds: string[];
  isOldestFirst: boolean;
  searchQuery: string;
};

export function filterTimelineEvents({
  events,
  activeCategory,
  startYear,
  endYear,
  selectedTagIds,
  isOldestFirst,
  searchQuery,
}: FilterTimelineEventsArgs): TimelineEvent[] {
  const filtered = events.filter((event) => {
    if (activeCategory && event.category !== activeCategory) return false;

    const eventYear = parseInt(event.event_date.slice(0, 4), 10);
    if (eventYear < startYear || eventYear > endYear) return false;

    if (selectedTagIds.length > 0) {
      const eventTagIds = (event.tags ?? []).map((tag) => tag.id);
      if (!selectedTagIds.every((id) => eventTagIds.includes(id))) return false;
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery !== "") {
      const tokens = trimmedQuery.split(/\s+/).filter((token) => token.length > 0);
      const lowerTitle = (event.title || "").toLowerCase();
      const lowerDescription = (event.description || "").toLowerCase();

      const allTokensMatch = tokens.every((token) => {
        const lowerToken = token.toLowerCase();
        return lowerTitle.includes(lowerToken) || lowerDescription.includes(lowerToken);
      });

      if (!allTokensMatch) return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    const yearA = parseInt(a.event_date.slice(0, 4), 10);
    const yearB = parseInt(b.event_date.slice(0, 4), 10);
    return isOldestFirst ? yearA - yearB : yearB - yearA;
  });
}