// lib/eventPageData.ts

import { cache } from "react";
import { compareEventsChronologicallyDescending } from "@/components/timelineUtils";
import { supabase } from "@/lib/supabaseClient";
import type {
  EventRow,
  Tag,
  TimelineEvent,
} from "@/lib/types";

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

type EventPageDataset = {
  events: TimelineEvent[];
  eventById: Map<string, TimelineEvent>;
};

export type EventStaticParamSource = {
  id: string;
  title: string;
  created_at: string | null;
  updated_at?: string | null;
};

export type EventPageData = {
  event: TimelineEvent;
  events: TimelineEvent[];
};

const EVENT_TAG_PAGE_SIZE = 1000;

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

const loadEventPageDataset = cache(
  async (): Promise<EventPageDataset> => {
    const [
      { data: eventData, error: eventsError },
      { data: tagData, error: tagsError },
      eventTagRows,
    ] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .is("deleted_at", null),
      supabase
        .from("tags")
        .select("id, name")
        .order("name", { ascending: true }),
      fetchAllEventTags(),
    ]);

    if (eventsError) {
      throw new Error(
        `Could not load events: ${eventsError.message}`
      );
    }

    if (tagsError) {
      throw new Error(
        `Could not load tags: ${tagsError.message}`
      );
    }

    const eventRows = (eventData ?? []) as EventRow[];
    const tags = (tagData ?? []) as Tag[];

    const tagById = new Map<string, Tag>();

    tags.forEach((tag) => {
      tagById.set(tag.id, tag);
    });

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

    const eventById = new Map<string, TimelineEvent>();

    events.forEach((event) => {
      eventById.set(event.id, event);
    });

    return {
      events,
      eventById,
    };
  }
);

export async function getEventPageData(
  eventId: string
): Promise<EventPageData | null> {
  const dataset = await loadEventPageDataset();
  const event = dataset.eventById.get(eventId);

  if (!event) {
    return null;
  }

  return {
    event,
    events: dataset.events,
  };
}

export async function getEventStaticParamSources(): Promise<
  EventStaticParamSource[]
> {
  const dataset = await loadEventPageDataset();

  return dataset.events.map((event) => ({
    id: event.id,
    title: event.title,
    created_at: event.created_at,
    updated_at: event.updated_at,
  }));
}
