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
  event: Pick<TimelineEvent, "created_at" | "updated_at">
): string | undefined {
  return getValidTimestamp(event.updated_at) ?? getValidTimestamp(event.created_at);
}
