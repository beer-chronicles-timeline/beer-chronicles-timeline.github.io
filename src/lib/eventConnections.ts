import type { TimelineEvent } from "./types";

type ReviewedEventConnection = {
  earlierEventId: string;
  laterEventId: string;
  earlierLabel: string;
  laterLabel: string;
  sourceUrl: string;
};

export type ConnectedEvent = {
  event: TimelineEvent;
  label: string;
};

// Editorial relationships require individual human review. Do not infer new
// connections from shared titles, tags, dates, or locations.
const REVIEWED_EVENT_CONNECTIONS: readonly ReviewedEventConnection[] = [
  {
    // Approved Union pair: continuity of premises, not uninterrupted operation
    // or corporate identity. The source is also cited by both published entries.
    earlierEventId: "052dddfe-48d9-4d9c-874c-6cced052d10e",
    laterEventId: "416e2437-3334-453f-8e11-77b3000572a2",
    earlierLabel: "Earlier history at the same site",
    laterLabel: "Later history at the same site",
    sourceUrl: "https://brauerei-bremen.de/union-brauerei/",
  },
];

export function getConnectedEvents(
  currentEvent: TimelineEvent,
  publishedEvents: readonly TimelineEvent[]
): ConnectedEvent[] {
  const eventById = new Map(publishedEvents.map((event) => [event.id, event]));
  const connections = new Map<string, ConnectedEvent>();

  for (const connection of REVIEWED_EVENT_CONNECTIONS) {
    const isEarlier = currentEvent.id === connection.earlierEventId;
    const isLater = currentEvent.id === connection.laterEventId;
    if (!isEarlier && !isLater) continue;

    const targetId = isEarlier ? connection.laterEventId : connection.earlierEventId;
    const event = eventById.get(targetId);
    // Missing/unpublished targets must not produce a card or an empty section.
    if (!event || event.id === currentEvent.id) continue;

    connections.set(event.id, {
      event,
      label: isEarlier ? connection.laterLabel : connection.earlierLabel,
    });
  }

  return Array.from(connections.values());
}
