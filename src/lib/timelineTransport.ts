import type { HomeTimelineData } from "./homeTimelineData";
import type { TimelineEvent } from "./types";

// Keep full descriptions and sources; share the tag dictionary and omit
// database metadata and null fields that the interactive timeline never uses.
type TransportEvent = Pick<TimelineEvent, "id" | "title"> &
  Partial<Pick<TimelineEvent,
    "description" | "event_date" | "historical_year" | "image_url" |
    "category" | "date_precision" | "sources"
  >> & { tags: number[] };

export type TimelineTransport = {
  version: 1;
  events: TransportEvent[];
  tags: HomeTimelineData["tags"];
  visibleTags: number[];
  minYear: number;
  maxYear: number;
};

export function encodeTimelineData(data: HomeTimelineData): TimelineTransport {
  const tagIndex = new Map(data.tags.map((tag, index) => [tag.id, index]));
  const indexForTag = (tag: { id: string }) => {
    const index = tagIndex.get(tag.id);
    if (index === undefined) throw new Error(`Unknown timeline tag: ${tag.id}`);
    return index;
  };

  return {
    version: 1,
    events: data.events.map((event) => {
      const compact: TransportEvent = {
        id: event.id, title: event.title,
        tags: (event.tags ?? []).map(indexForTag),
      };
      for (const field of ["description", "event_date", "historical_year",
        "image_url", "category", "date_precision", "sources"] as const) {
        if (event[field] != null) Object.assign(compact, { [field]: event[field] });
      }
      return compact;
    }),
    tags: data.tags,
    visibleTags: data.visibleTags.map(indexForTag),
    minYear: data.minYear,
    maxYear: data.maxYear,
  };
}

export function decodeTimelineData(
  data: TimelineTransport | HomeTimelineData
): HomeTimelineData {
  // Accept the previous representation during a deployment/cache transition.
  if (!("version" in data)) return data;
  if (data.version !== 1) throw new Error("Unsupported timeline data version");
  const getTag = (index: number) => {
    const tag = data.tags[index];
    if (!tag) throw new Error("Invalid timeline tag reference");
    return tag;
  };
  return {
    events: data.events.map((event) => ({
      description: null, event_date: null, historical_year: null,
      image_url: null, created_at: null, category: null,
      date_precision: null, sources: null,
      ...event,
      tags: event.tags.map(getTag),
    })),
    tags: data.tags,
    visibleTags: data.visibleTags.map(getTag),
    minYear: data.minYear,
    maxYear: data.maxYear,
  };
}
