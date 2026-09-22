// components/timelineFiltering.ts
import {
  compareEventsChronologicallyAscending,
  compareEventsChronologicallyDescending,
  getEventTimelineYear,
} from "./timelineUtils";
import type { Tag, TimelineEvent } from "@/lib/types";
import { normalizeSearchText } from "@/lib/searchText";
import { doesEventMatchStoryline } from "@/lib/eventStorylines";
import { getStorylineBySlug } from "@/lib/storylines";

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
  storylineSlug?: string | null;
  urlTags?: Tag[];
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
  storylineSlug,
  urlTags = [],
}: FilterTimelineEventsArgs): TimelineEvent[] {
  const storyline = storylineSlug ? getStorylineBySlug(storylineSlug) : undefined;
  const tagNamesById = new Map(urlTags.map((tag) => [tag.id, tag.name]));
  const tokens = normalizeSearchText(searchQuery).split(/\s+/).filter(Boolean);
  const filtered = events.filter((event) => {
    if (storyline) {
      // The initial homepage preview has tag IDs but omits most tag names.
      const namedEvent = {
        ...event,
        tags: event.tags?.map((tag) => ({
          ...tag,
          name: tag.name || tagNamesById.get(tag.id) || "",
        })),
      };
      if (!doesEventMatchStoryline(namedEvent, storyline)) {
        return false;
      }
    }

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

    if (tokens.length > 0) {
      const title = normalizeSearchText(event.title || "");
      const description = normalizeSearchText(event.description || "");

      const allTokensMatch = tokens.every(
        (token) => title.includes(token) || description.includes(token)
      );

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
