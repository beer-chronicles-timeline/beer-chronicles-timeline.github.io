import publishedPaths from "@/data/published-event-paths.json";
import { createEventSlug } from "./eventUrls";

export const publishedEventPaths: Record<string, string[]> = publishedPaths;

export function isKnownEventSlug(id: string, slug: string, title: string): boolean {
  return slug === createEventSlug(title) || (publishedEventPaths[id] ?? []).includes(slug);
}

export function getEventRouteParams(events: { id: string; title: string }[]) {
  return events.flatMap((event) => [...new Set([
    createEventSlug(event.title), ...(publishedEventPaths[event.id] ?? []),
  ])].map((slug) => ({ id: event.id, slug })));
}

export function assertPublishedEventPaths(events: { id: string; title: string }[]) {
  for (const event of events) {
    if (!(publishedEventPaths[event.id] ?? []).includes(createEventSlug(event.title))) {
      throw new Error(`Unregistered event path: ${event.id}. Run npm run register:event-paths after reviewing the prepared snapshot; retain all old paths.`);
    }
  }
}
