import {
  compareEventsChronologicallyDescending,
  getEventTimelineYear,
  truncate,
} from "@/components/timelineUtils";
import { supabase } from "@/lib/supabaseClient";
import type { EventRow, Tag, TimelineEvent } from "@/lib/types";

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

export type HomeTimelineData = {
  events: TimelineEvent[];
  visibleTags: Tag[];
  tags: Tag[];
  minYear: number;
  maxYear: number;
};

export type HomeTimelineIndex = HomeTimelineData;

const EVENT_TAG_PAGE_SIZE = 1000;
const MIN_VISIBLE_TAG_EVENT_COUNT = 3;

async function fetchAllEventTags(): Promise<EventTagRow[]> {
  const allRows: EventTagRow[] = [];
  let from = 0;

  while (true) {
    const to = from + EVENT_TAG_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("event_tags")
      .select("event_id, tag_id")
      .order("event_id", { ascending: true })
      .order("tag_id", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(
        `Could not load event-tag relations: ${error.message}`
      );
    }

    const rows = (data ?? []) as EventTagRow[];

    allRows.push(...rows);

    if (rows.length < EVENT_TAG_PAGE_SIZE) {
      break;
    }

    from += EVENT_TAG_PAGE_SIZE;
  }

  return allRows;
}

export async function getHomeTimelineData(): Promise<HomeTimelineData> {
  const [
    { data: eventData, error: eventsError },
    { data: tagData, error: tagsError },
    eventTagRows,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .is("deleted_at", null)
      .order("id", { ascending: true }),
    supabase
      .from("tags")
      .select("id, name")
      .order("name", { ascending: true }),
    fetchAllEventTags(),
  ]);

  if (eventsError) {
    throw new Error(`Could not load events: ${eventsError.message}`);
  }

  if (tagsError) {
    throw new Error(`Could not load tags: ${tagsError.message}`);
  }

  const eventRows = (eventData ?? []) as EventRow[];
  const tags = (tagData ?? []) as Tag[];
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));
  const tagsForEvent = new Map<string, Tag[]>();

  eventTagRows.forEach(({ event_id, tag_id }) => {
    const tag = tagById.get(tag_id);

    if (!tag) {
      return;
    }

    const existingTags = tagsForEvent.get(event_id) ?? [];

    existingTags.push(tag);
    tagsForEvent.set(event_id, existingTags);
  });

  const events: TimelineEvent[] = eventRows
    .map((event) => ({
      ...event,
      tags: tagsForEvent.get(event.id) ?? [],
    }))
    .sort(compareEventsChronologicallyDescending);

  const activeEventIds = new Set(eventRows.map((event) => event.id));
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
