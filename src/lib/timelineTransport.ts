import type { HomeTimelineData } from "./homeTimelineData";
import type { TimelineEvent } from "./types";
import { isSourceRevision } from "./sourceTransport";

export const TIMELINE_INDEX_PATH = "/timeline-index.json";

// Keep full searchable descriptions. The browser index references separate
// citations; the full public download remains compatible with existing readers.
type TransportEvent = Pick<TimelineEvent, "id" | "title"> &
  Partial<Pick<TimelineEvent,
    "description" | "event_date" | "historical_year" | "image_url" |
    "category" | "date_precision" | "sources"
  >> & { tags: number[]; sourceRevision?: string };

export type TimelineTransport = {
  version: 1 | 2;
  events: TransportEvent[];
  tags: HomeTimelineData["tags"];
  visibleTags: number[];
  minYear: number;
  maxYear: number;
};

export type DecodedTimelineData = HomeTimelineData & {
  sourceRevisions?: Record<string, string>;
};

export function encodeTimelineData(
  data: HomeTimelineData,
  sourceRevisions?: Readonly<Record<string, string>>
): TimelineTransport {
  const tagIndex = new Map(data.tags.map((tag, index) => [tag.id, index]));
  const indexForTag = (tag: { id: string }) => {
    const index = tagIndex.get(tag.id);
    if (index === undefined) throw new Error(`Unknown timeline tag: ${tag.id}`);
    return index;
  };

  return {
    version: sourceRevisions ? 2 : 1,
    events: data.events.map((event) => {
      const compact: TransportEvent = {
        id: event.id, title: event.title,
        tags: (event.tags ?? []).map(indexForTag),
      };
      for (const field of ["description", "event_date", "historical_year",
        "image_url", "category", "date_precision"] as const) {
        if (event[field] != null) Object.assign(compact, { [field]: event[field] });
      }
      if (sourceRevisions) {
        const revision = sourceRevisions[event.id];
        if (!isSourceRevision(revision)) throw new Error(`Missing source revision: ${event.id}`);
        compact.sourceRevision = revision;
      } else if (event.sources != null) {
        compact.sources = event.sources;
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
): DecodedTimelineData {
  // Accept the previous representation during a deployment/cache transition.
  if (!("version" in data)) return data;
  if (data.version !== 1 && data.version !== 2) throw new Error("Unsupported timeline data version");
  const sourceRevisions: Record<string, string> = {};
  const getTag = (index: number) => {
    const tag = data.tags[index];
    if (!tag) throw new Error("Invalid timeline tag reference");
    return tag;
  };
  return {
    events: data.events.map(({ sourceRevision, ...event }) => {
      if (data.version === 2) {
        if (!isSourceRevision(sourceRevision) || "sources" in event) {
          throw new Error(`Invalid source reference: ${event.id}`);
        }
        sourceRevisions[event.id] = sourceRevision;
      }
      return {
        description: null, event_date: null, historical_year: null,
        image_url: null, created_at: null, category: null,
        date_precision: null, sources: null,
        ...event,
        tags: event.tags.map(getTag),
      };
    }),
    tags: data.tags,
    visibleTags: data.visibleTags.map(getTag),
    minYear: data.minYear,
    maxYear: data.maxYear,
    ...(data.version === 2 ? { sourceRevisions } : {}),
  };
}
