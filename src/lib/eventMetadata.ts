import type { TimelineEvent } from "@/lib/types";

export function getEventDocumentTitle(
  event: Pick<TimelineEvent, "title" | "seo_title">
): string {
  return `${event.seo_title?.trim() || event.title} | Beer Chronicles`;
}

function getValidTimestamp(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : value;
}

export function getEventPublicationDates(event: TimelineEvent): {
  datePublished?: string;
  dateModified?: string;
} {
  const datePublished = getValidTimestamp(event.created_at);
  const dateModified = getValidTimestamp(event.updated_at);

  return {
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function getEventSitemapLastModified(
  event: Pick<TimelineEvent, "updated_at">
): string | undefined {
  const value = event.updated_at;
  if (!value) return undefined;

  // W3C Datetime requires an explicit timezone whenever a time is supplied.
  // Date.parse also accepts ambiguous local times and normalizes invalid days.
  // Never infer UTC for a timezone-less database timestamp, or replace a
  // missing modification date with creation time, event time, or build time.
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2})))?$/);
  if (!match || match[0] !== value) return undefined;

  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = match;
  const y = Number(year), m = Number(month), d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > days[m - 1]) return undefined;
  if (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second ?? 0) > 59)) return undefined;
  // Keep offsets within the sitemap XML Schema's dateTime range as well.
  const oh = Number(offsetHour ?? 0), om = Number(offsetMinute ?? 0);
  if (oh > 14 || om > 59 || (oh === 14 && om !== 0)) return undefined;

  // Preserve verified precision and offset rather than changing the instant.
  return value;
}
