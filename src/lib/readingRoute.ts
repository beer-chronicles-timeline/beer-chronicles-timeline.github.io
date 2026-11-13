import { getEventPath } from "./eventUrls";
import type { TimelineEvent } from "./types";

// Editorially selected route; entry content comes from the publication snapshot.
export const READING_ROUTE_SLUG = "beer-history-in-six-stops";
export const READING_ROUTE_HREF = `/start-here/${READING_ROUTE_SLUG}`;
export const READING_ROUTE_TITLE = "Beer history in six stops";

const selections = [
  {
    id: "c96f798b-e46c-4b8b-83a7-6245aa1b795b",
    note: "Start with the evidence: what can archaeological residues and brewing experiments tell us?",
  },
  {
    id: "7b9ed8c2-2db7-4ad8-a067-9cc37d748e4b",
    note: "Turn to a different kind of source: a poem describing brewing.",
  },
  {
    id: "9d9bd659-d8bd-4990-950c-c4d83352e542",
    note: "Consider why ingredients matter through a medieval account of hops.",
  },
  {
    id: "f38bc8c6-fd68-4c37-9392-59939f2617c1",
    note: "Meet a familiar beer style at its public debut.",
  },
  {
    id: "f7049922-4fd0-4809-94dc-ce421b1eb10a",
    note: "Look at brewing through the lens of fermentation science and microbiology.",
  },
  {
    id: "7acbf246-9e60-4a7c-93e3-9a0440078f6b",
    note: "Finish with one example from the modern American craft movement.",
  },
] as const;

export type ReadingRouteStop = {
  id: string;
  title: string;
  href: string;
  note: string;
  event: TimelineEvent;
};

export type ReadingRouteLink = Pick<ReadingRouteStop, "id" | "title" | "href">;

export function getReadingRouteStops(events: readonly TimelineEvent[]): ReadingRouteStop[] {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const stops: ReadingRouteStop[] = [];
  for (const selection of selections) {
    const event = eventsById.get(selection.id);
    // A partial route would silently change the editorial selection.
    if (!event) return [];
    stops.push({
      id: event.id,
      title: event.title,
      href: `${getEventPath(event.id, event.title)}?readingRoute=${READING_ROUTE_SLUG}`,
      note: selection.note,
      event,
    });
  }
  return stops;
}
