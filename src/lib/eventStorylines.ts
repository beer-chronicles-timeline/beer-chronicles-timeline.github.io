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
