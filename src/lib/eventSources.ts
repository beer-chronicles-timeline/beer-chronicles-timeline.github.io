import { createHash } from "node:crypto";
import type { TimelineEvent } from "./types";
import type { EventSources } from "./sourceTransport";

export function encodeEventSources(
  event: Pick<TimelineEvent, "id" | "sources">
): EventSources {
  const sources = event.sources ?? null;
  // Content-addressed paths cannot silently mix citations across publications.
  const revision = createHash("sha256")
    .update(JSON.stringify(sources))
    .digest("hex")
    .slice(0, 20);

  return { version: 1, eventId: event.id, revision, sources };
}

export function getEventSourceRevisions(
  events: readonly Pick<TimelineEvent, "id" | "sources">[]
): Record<string, string> {
  return Object.fromEntries(events.map((event) => [event.id, encodeEventSources(event).revision]));
}
