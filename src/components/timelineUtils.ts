// components/timelineUtils.ts
import type { TimelineEvent } from "@/lib/types";
import { STORYLINES } from "@/lib/storylines";

export const urlRegex = /\b(https?:\/\/[^\s)]+|www\.[^\s)]+)\b/gi;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type EventChronology = Pick<
  TimelineEvent,
  "event_date" | "historical_year"
>;

function isBceDate(raw: string): boolean {
  return /\sBC$/i.test(raw.trim());
}

function getDisplayedYearFromDate(raw: string): number | null {
  const match = raw.trim().match(/^(\d+)-/);

  if (!match) {
    return null;
  }

  const storedYear = Number.parseInt(match[1], 10);

  if (Number.isNaN(storedYear)) {
    return null;
  }

  return isBceDate(raw) ? storedYear + 1 : storedYear;
}

function getTimelineYearFromDate(raw: string): number | null {
  const displayedYear = getDisplayedYearFromDate(raw);

  if (displayedYear === null) {
    return null;
  }

  return isBceDate(raw) ? -displayedYear : displayedYear;
}

function getDateSortValue(raw: string): number | null {
  const trimmedDate = raw.trim();
  const dateMatch = trimmedDate.match(
    /^(\d+)-(\d{2})-(\d{2})(?:\s+BC)?$/i
  );

  if (!dateMatch) {
    return null;
  }

  const storedYear = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10);
  const day = Number.parseInt(dateMatch[3], 10);

  if (
    Number.isNaN(storedYear) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  const timelineYear = isBceDate(trimmedDate)
    ? -(storedYear + 1)
    : storedYear;

  return timelineYear * 10_000 + month * 100 + day;
}

function getDateCenturyNumber(
  displayedYear: number,
  isBce: boolean
): number {
  return isBce
    ? Math.ceil(displayedYear / 100)
    : Math.floor(displayedYear / 100) + 1;
}

function getHistoricalCenturyNumber(
  historicalYear: number
): number {
  return Math.ceil(Math.abs(historicalYear) / 100);
}

function getHistoricalDecadeStart(
  historicalYear: number
): number {
  return Math.ceil(Math.abs(historicalYear) / 10) * 10;
}

function formatOrdinal(value: number): string {
  const lastTwoDigits = value % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function formatCenturyLabel(
  centuryNumber: number,
  isBce: boolean
): string {
  if (isBce && centuryNumber >= 100) {
    const approximateYear = (centuryNumber * 100).toLocaleString(
      "en-US"
    );

    return `c. ${approximateYear} BCE`;
  }

  const centuryLabel = `${formatOrdinal(centuryNumber)} century`;

  return isBce ? `${centuryLabel} BCE` : centuryLabel;
}

function formatHistoricalYear(historicalYear: number): string {
  const absoluteYear = Math.abs(historicalYear).toLocaleString(
    "en-US"
  );

  return historicalYear < 0
    ? `${absoluteYear} BCE`
    : absoluteYear;
}

function formatHistoricalEventDate(
  event: TimelineEvent,
  historicalYear: number
): string {
  if (event.date_precision === "century") {
    const centuryNumber =
      getHistoricalCenturyNumber(historicalYear);

    return formatCenturyLabel(centuryNumber, historicalYear < 0);
  }

  if (event.date_precision === "decade") {
    const decadeStart =
      getHistoricalDecadeStart(historicalYear);
    const decadeLabel = `${decadeStart.toLocaleString(
      "en-US"
    )}s`;

    return historicalYear < 0
      ? `${decadeLabel} BCE`
      : decadeLabel;
  }

  return formatHistoricalYear(historicalYear);
}

export function getEventTimelineYear(
  event: EventChronology
): number | null {
  if (
    event.historical_year !== null &&
    event.historical_year !== 0
  ) {
    return event.historical_year;
  }

  if (!event.event_date) {
    return null;
  }

  return getTimelineYearFromDate(event.event_date);
}

export function getEventChronologicalSortValue(
  event: EventChronology
): number {
  if (
    event.historical_year !== null &&
    event.historical_year !== 0
  ) {
    return event.historical_year * 10_000 + 101;
  }

  if (!event.event_date) {
    return Number.NEGATIVE_INFINITY;
  }

  return (
    getDateSortValue(event.event_date) ??
    Number.NEGATIVE_INFINITY
  );
}

export function compareEventsChronologicallyAscending(
  firstEvent: EventChronology,
  secondEvent: EventChronology
): number {
  return (
    getEventChronologicalSortValue(firstEvent) -
    getEventChronologicalSortValue(secondEvent)
  );
}

export function compareEventsChronologicallyDescending(
  firstEvent: EventChronology,
  secondEvent: EventChronology
): number {
  return (
    getEventChronologicalSortValue(secondEvent) -
    getEventChronologicalSortValue(firstEvent)
  );
}

export function formatEventDate(event: TimelineEvent): string {
  if (
    event.historical_year !== null &&
    event.historical_year !== 0
  ) {
    return formatHistoricalEventDate(
      event,
      event.historical_year
    );
  }

  const raw = event.event_date;

  if (!raw) {
    return "";
  }

  const displayedYear = getDisplayedYearFromDate(raw);
  const isBce = isBceDate(raw);
  const eraSuffix = isBce ? " BC" : "";

  if (displayedYear === null) {
    return raw;
  }

  if (event.date_precision === "century") {
    const centuryNumber = getDateCenturyNumber(
      displayedYear,
      isBce
    );

    return formatCenturyLabel(centuryNumber, isBce);
  }

  if (event.date_precision === "decade") {
    const decadeStart = Math.ceil(displayedYear / 10) * 10;
    return `${decadeStart}s${eraSuffix}`;
  }

  if (event.date_precision === "month") {
    const [, month] = raw.split("-");
    const monthIndex = Number.parseInt(month, 10) - 1;

    return !Number.isNaN(monthIndex) &&
      monthIndex >= 0 &&
      monthIndex < 12
      ? `${monthNames[monthIndex]} ${displayedYear}${eraSuffix}`
      : raw;
  }

  if (event.date_precision === "year") {
    return `${displayedYear}${eraSuffix}`;
  }

  const [, month, dayPart] = raw.split("-");
  const monthIndex = Number.parseInt(month, 10) - 1;
  const day = Number.parseInt(dayPart, 10);

  if (
    !Number.isNaN(monthIndex) &&
    monthIndex >= 0 &&
    monthIndex < 12 &&
    !Number.isNaN(day)
  ) {
    return `${monthNames[monthIndex]} ${day}, ${displayedYear}${eraSuffix}`;
  }

  return raw;
}

export function truncate(
  text: string | null | undefined,
  max = 160
): string | null {
  if (!text) {
    return null;
  }

  if (text.length <= max) {
    return text;
  }

  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");

  return `${slice.slice(0, cut > 80 ? cut : max).trim()}…`;
}

export function getRelatedEvents(
  currentEvent: TimelineEvent,
  events: TimelineEvent[]
) {
  const genericRelationshipTags = new Set([
    "Breweries",
    "Community",
    "Events",
    "Laws",
    "People",
    "Science",
    "Styles",
  ]);
  const currentTagIds = new Set(
    (currentEvent.tags ?? [])
      .filter((tag) => !genericRelationshipTags.has(tag.name))
      .map((tag) => tag.id)
  );

  const currentYear = getEventTimelineYear(currentEvent);
  const getMatchingStorylineSlugs = (event: TimelineEvent) => {
    const eventYear = getEventTimelineYear(event);
    const tagNames = new Set((event.tags ?? []).map((tag) => tag.name));

    return STORYLINES.filter((storyline) => {
      if (
        eventYear === null ||
        (storyline.fromYear !== undefined &&
          eventYear < storyline.fromYear) ||
        (storyline.toYear !== undefined && eventYear > storyline.toYear)
      ) {
        return false;
      }

      return storyline.tagMode === "any"
        ? storyline.tagNames.some((tagName) => tagNames.has(tagName))
        : storyline.tagNames.every((tagName) => tagNames.has(tagName));
    }).map((storyline) => storyline.slug);
  };
  const currentStorylineSlugs = new Set(
    getMatchingStorylineSlugs(currentEvent)
  );

  return events
    .filter((event) => event.id !== currentEvent.id)
    .map((event) => {
      const eventTagIds = (event.tags ?? [])
        .filter((tag) => !genericRelationshipTags.has(tag.name))
        .map((tag) => tag.id);
      const sharedTagCount = eventTagIds.filter((id) =>
        currentTagIds.has(id)
      ).length;
      const sharedStorylineCount = getMatchingStorylineSlugs(event).filter(
        (slug) => currentStorylineSlugs.has(slug)
      ).length;

      const sameCategory =
        event.category && event.category === currentEvent.category
          ? 1
          : 0;

      const eventYear = getEventTimelineYear(event);

      const yearDistance =
        currentYear !== null && eventYear !== null
          ? Math.abs(currentYear - eventYear)
          : Number.POSITIVE_INFINITY;

      const score =
        sharedStorylineCount * 1_000 +
        sharedTagCount * 100 +
        sameCategory * 10 +
        Math.max(0, 50 - Math.floor(yearDistance / 25));

      return { event, score, sharedStorylineCount, sharedTagCount };
    })
    .filter(
      (item) =>
        item.sharedStorylineCount > 0 || item.sharedTagCount > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        compareEventsChronologicallyAscending(a.event, b.event)
    )
    .slice(0, 3)
    .map((item) => item.event);
}

export function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (/^www\./i.test(url)) {
    return `https://${url}`;
  }

  return url;
}
