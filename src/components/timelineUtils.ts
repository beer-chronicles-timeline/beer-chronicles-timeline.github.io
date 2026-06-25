// components/timelineUtils.ts
import type { TimelineEvent } from "@/lib/types";

export const urlRegex = /\b(https?:\/\/[^\s)]+|www\.[^\s)]+)\b/gi;

export function formatEventDate(event: TimelineEvent): string {
  const raw = event.event_date;
  if (!raw) return "";

  if (event.date_precision === "decade") {
    const year = raw.slice(0, 4);
    const decadeStart = Math.floor(parseInt(year, 10) / 10) * 10;
    return `${decadeStart}s`;
  }

  if (event.date_precision === "month") {
    const [year, month] = raw.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const m = parseInt(month, 10) - 1;
    return !Number.isNaN(m) && m >= 0 && m < 12 ? `${monthNames[m]} ${year}` : raw;
  }

  if (event.date_precision === "year") return raw.slice(0, 4);

  const [year, month, day] = raw.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const m = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);

  if (!Number.isNaN(m) && m >= 0 && m < 12 && !Number.isNaN(d)) {
    return `${monthNames[m]} ${d}, ${year}`;
  }

  return raw;
}

export function truncate(text: string | null | undefined, max = 160): string | null {
  if (!text) return null;
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return `${slice.slice(0, cut > 80 ? cut : max).trim()}…`;
}

export function getRelatedEvents(currentEvent: TimelineEvent, events: TimelineEvent[]) {
  const currentTagIds = new Set((currentEvent.tags ?? []).map((tag) => tag.id));
  const currentYear = parseInt(currentEvent.event_date.slice(0, 4), 10);

  return events
    .filter((event) => event.id !== currentEvent.id)
    .map((event) => {
      const eventTagIds = (event.tags ?? []).map((tag) => tag.id);
      const sharedTagCount = eventTagIds.filter((id) => currentTagIds.has(id)).length;
      const sameCategory = event.category && event.category === currentEvent.category ? 1 : 0;
      const eventYear = parseInt(event.event_date.slice(0, 4), 10);
      const yearDistance = Math.abs(currentYear - eventYear);

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
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `https://${url}`;
  return url;
}