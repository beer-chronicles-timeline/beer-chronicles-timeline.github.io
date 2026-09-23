// lib/eventStorylines.ts

import {
  compareEventsChronologicallyAscending,
  getEventTimelineYear,
} from "../components/timelineUtils.ts";
import type { TimelineEvent } from "./types.ts";
import {
  STORYLINES,
  type Storyline,
} from "./storylines.ts";

function isEventInsideStorylineDateRange(
  event: TimelineEvent,
  storyline: Storyline
): boolean {
  const eventYear = getEventTimelineYear(event);

  if (eventYear === null) {
    return false;
  }

  if (
    storyline.fromYear !== undefined &&
    eventYear < storyline.fromYear
  ) {
    return false;
  }

  if (
    storyline.toYear !== undefined &&
    eventYear > storyline.toYear
  ) {
    return false;
  }

  return true;
}

export function doesEventMatchStoryline(
  event: TimelineEvent,
  storyline: Storyline
): boolean {
  if (!isEventInsideStorylineDateRange(event, storyline)) {
    return false;
  }

  const eventTagNames = new Set(
    (event.tags ?? []).map((tag) => tag.name)
  );

  if (
    !(storyline.requiredTagNames ?? []).every((tagName) =>
      eventTagNames.has(tagName)
    )
  ) {
    return false;
  }

  if (storyline.tagMode === "any") {
    return storyline.tagNames.some((tagName) =>
      eventTagNames.has(tagName)
    );
  }

  return storyline.tagNames.every((tagName) =>
    eventTagNames.has(tagName)
  );
}

export function getStorylinesForEvent(
  event: TimelineEvent
): Storyline[] {
  return STORYLINES.filter((storyline) =>
    doesEventMatchStoryline(event, storyline)
  );
}

export function getEventsForStoryline(
  events: TimelineEvent[],
  storyline: Storyline
): TimelineEvent[] {
  return events
    .filter((event) => doesEventMatchStoryline(event, storyline))
    .sort(compareEventsChronologicallyAscending);
}

export type StorylineView = {
  storyline: Storyline;
  entryCount: number;
  featuredEvent: TimelineEvent | null;
};

export function buildStorylineViews({ events, tags, eventTags }: {
  events: TimelineEvent[];
  tags: { id: string; name: string }[];
  eventTags: { event_id: string; tag_id: string }[];
}): StorylineView[] {
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));
  const tagsByEvent = new Map<string, typeof tags>();
  for (const { event_id, tag_id } of eventTags) {
    const tag = tagById.get(tag_id);
    if (tag) {
      const eventTags = tagsByEvent.get(event_id) ?? [];
      eventTags.push(tag);
      tagsByEvent.set(event_id, eventTags);
    }
  }
  const taggedEvents = events.map((event) => ({
    ...event, tags: tagsByEvent.get(event.id) ?? [],
  }));
  return STORYLINES.map((storyline) => {
    const matches = getEventsForStoryline(taggedEvents, storyline);
    return {
      storyline,
      entryCount: matches.length,
      featuredEvent: matches.find((event) => event.id === storyline.featuredEventId)
        ?? matches[0] ?? null,
    };
  });
}
