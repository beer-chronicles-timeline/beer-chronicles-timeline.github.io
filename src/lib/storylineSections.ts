import { getEventTimelineYear } from "@/components/timelineUtils";
import type { TimelineEvent } from "./types";

export type StorylineDateSection = {
  id: string;
  label: string;
  startIndex: number;
  events: TimelineEvent[];
};

function formatDateRange(start: number, end: number): string {
  if (start === end) return start < 0 ? `${-start} BCE` : String(start);
  if (end < 0) return `${-start}–${-end} BCE`;
  if (start < 0) return `${-start} BCE–${end} CE`;
  return `${start}–${end}`;
}

/** Group existing chronological milestones by date, without splitting a year. */
export function getStorylineDateSections(
  events: readonly TimelineEvent[]
): StorylineDateSection[] {
  if (events.length < 40) return [];

  const years = events.map(getEventTimelineYear);
  if (years.some((year) => year === null || !Number.isSafeInteger(year) || year === 0)) {
    return [];
  }

  const sections: StorylineDateSection[] = [];
  let startIndex = 0;

  while (startIndex < events.length) {
    let endIndex = Math.min(startIndex + 25, events.length);
    while (endIndex < events.length && years[endIndex] === years[endIndex - 1]) {
      endIndex++;
    }
    // Avoid leaving a short final section when the same-year boundary shifts.
    if (events.length - endIndex < 10) endIndex = events.length;

    const startYear = years[startIndex]!;
    const endYear = years[endIndex - 1]!;
    sections.push({
      id: `milestones-${startYear < 0 ? `bce-${-startYear}` : startYear}`,
      label: formatDateRange(startYear, endYear),
      startIndex,
      events: events.slice(startIndex, endIndex),
    });
    startIndex = endIndex;
  }

  return sections.length > 1 ? sections : [];
}
