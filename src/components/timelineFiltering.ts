// components/timelineFiltering.ts
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

function getTimelineYear(eventDate: string): number | null {
  const trimmedDate = eventDate.trim();
  const yearMatch = trimmedDate.match(/^(\d+)-/);

  if (!yearMatch) {
    return null;
  }

  const year = Number.parseInt(yearMatch[1], 10);

  if (Number.isNaN(year)) {
    return null;
  }

  return /\sBC$/i.test(trimmedDate) ? -year : year;
}

function getTimelineSortValue(eventDate: string): number {
  const trimmedDate = eventDate.trim();
  const dateMatch = trimmedDate.match(
    /^(\d+)-(\d{2})-(\d{2})(?:\s+BC)?$/i
  );

  if (!dateMatch) {
    return Number.NEGATIVE_INFINITY;
  }

  const year = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10);
  const day = Number.parseInt(dateMatch[3], 10);
  const isBce = /\sBC$/i.test(trimmedDate);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const signedYear = isBce ? -year : year;

  return signedYear * 10_000 + month * 100 + day;
}

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

    const eventYear = getTimelineYear(event.event_date);

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

  return filtered.sort((firstEvent, secondEvent) => {
    const firstSortValue = getTimelineSortValue(firstEvent.event_date);
    const secondSortValue = getTimelineSortValue(secondEvent.event_date);

    return isOldestFirst
      ? firstSortValue - secondSortValue
      : secondSortValue - firstSortValue;
  });
}