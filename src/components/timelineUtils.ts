// components/timelineUtils.ts
import type { TimelineEvent } from "@/lib/types";

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

function isBceDate(raw: string): boolean {
  return /\sBC$/i.test(raw.trim());
}

function getDisplayedYear(raw: string): number | null {
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

function getTimelineYear(raw: string): number | null {
  const displayedYear = getDisplayedYear(raw);

  if (displayedYear === null) {
    return null;
  }

  return isBceDate(raw) ? -displayedYear : displayedYear;
}

function getCenturyNumber(
  displayedYear: number,
  isBce: boolean
): number {
  return isBce
    ? Math.ceil(displayedYear / 100)
    : Math.floor(displayedYear / 100) + 1;
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

export function formatEventDate(event: TimelineEvent): string {
  const raw = event.event_date;

  if (!raw) {
    return "";
  }

  const displayedYear = getDisplayedYear(raw);
  const isBce = isBceDate(raw);
  const eraSuffix = isBce ? " BC" : "";

  if (displayedYear === null) {
    return raw;
  }

  if (event.date_precision === "century") {
    const centuryNumber = getCenturyNumber(
      displayedYear,
      isBce
    );
    const centuryLabel = `${formatOrdinal(centuryNumber)} century`;

    return isBce ? `${centuryLabel} BCE` : centuryLabel;
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
  const currentTagIds = new Set(
    (currentEvent.tags ?? []).map((tag) => tag.id)
  );

  const currentYear = getTimelineYear(currentEvent.event_date);

  return events
    .filter((event) => event.id !== currentEvent.id)
    .map((event) => {
      const eventTagIds = (event.tags ?? []).map((tag) => tag.id);
      const sharedTagCount = eventTagIds.filter((id) =>
        currentTagIds.has(id)
      ).length;

      const sameCategory =
        event.category && event.category === currentEvent.category ? 1 : 0;

      const eventYear = getTimelineYear(event.event_date);

      const yearDistance =
        currentYear !== null && eventYear !== null
          ? Math.abs(currentYear - eventYear)
          : Number.POSITIVE_INFINITY;

      const score =
        sharedTagCount * 100 +
        sameCategory * 20 +
        Math.max(0, 20 - Math.floor(yearDistance / 25));

      return { event, score, sharedTagCount };
    })
    .filter((item) => item.sharedTagCount > 0)
    .sort((a, b) => b.score - a.score)
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