// lib/eventStorylines.ts

import type { TimelineEvent } from "@/lib/types";
import {
  STORYLINES,
  type Storyline,
} from "@/lib/storylines";

function isBceDate(eventDate: string): boolean {
  return /\sBC$/i.test(eventDate.trim());
}

function getTimelineYear(eventDate: string): number | null {
  const trimmedDate = eventDate.trim();
  const yearMatch = trimmedDate.match(/^(\d+)-/);

  if (!yearMatch) {
    return null;
  }

  const storedYear = Number.parseInt(yearMatch[1], 10);

  if (Number.isNaN(storedYear)) {
    return null;
  }

  return isBceDate(trimmedDate)
    ? -(storedYear + 1)
    : storedYear;
}

function isEventInsideStorylineDateRange(
  event: TimelineEvent,
  storyline: Storyline
): boolean {
  const eventYear = getTimelineYear(event.event_date);

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