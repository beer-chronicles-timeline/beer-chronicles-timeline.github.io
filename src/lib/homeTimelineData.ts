import {
  getEventTimelineYear,
  truncate,
} from "@/components/timelineUtils";
import { getPublicationSnapshot } from "@/lib/publicationSnapshot";
import type { Tag, TimelineEvent } from "@/lib/types";

export type HomeTimelineData = {
  events: TimelineEvent[];
  visibleTags: Tag[];
  tags: Tag[];
  minYear: number;
  maxYear: number;
};

export type HomeTimelineIndex = HomeTimelineData;

const MIN_VISIBLE_TAG_EVENT_COUNT = 3;

export async function getHomeTimelineData(): Promise<HomeTimelineData> {
  const { events, tags, eventTags: eventTagRows } = getPublicationSnapshot();
  const activeEventIds = new Set(events.map((event) => event.id));
  const activeEventIdsByTag = new Map<string, Set<string>>();

  eventTagRows.forEach(({ event_id, tag_id }) => {
    if (!activeEventIds.has(event_id)) {
      return;
    }

    const eventIds = activeEventIdsByTag.get(tag_id) ?? new Set<string>();

    eventIds.add(event_id);
    activeEventIdsByTag.set(tag_id, eventIds);
  });

  const visibleTags = tags.filter(
    (tag) =>
      (activeEventIdsByTag.get(tag.id)?.size ?? 0) >=
      MIN_VISIBLE_TAG_EVENT_COUNT
  );

  const years = events
    .map((event) => getEventTimelineYear(event))
    .filter((year): year is number => year !== null);

  const fallbackYear = new Date().getFullYear();
  const minYear = years.length > 0 ? Math.min(...years) : fallbackYear;
  const maxYear = years.length > 0 ? Math.max(...years) : fallbackYear;

  return {
    events,
    visibleTags,
    tags,
    minYear,
    maxYear,
  };
}

export function createHomeTimelineIndex(
  timelineData: HomeTimelineData
): HomeTimelineIndex {
  return {
    ...timelineData,
    events: timelineData.events.map(
      ({
        id,
        title,
        description,
        event_date,
        historical_year,
        category,
        date_precision,
        tags,
      }) => ({
        id,
        title,
        description: truncate(description, 170),
        event_date,
        historical_year,
        category,
        date_precision,
        tags: tags?.map((tag) => ({
          id: tag.id,
          name: tag.name === "Milestone" ? tag.name : "",
        })),
        image_url: null,
        created_at: null,
        sources: null,
      })
    ),
  };
}
