import { compareEventsChronologicallyDescending } from "@/components/timelineUtils";
import { createEventSlug } from "./eventUrls";
import { buildMapLocations } from "./mapLocations";
import { STORYLINES, type Storyline } from "./storylines";
import type { EventRow, Tag, TimelineEvent } from "./types";

export type EventTagRow = { event_id: string; tag_id: string };
export type PublicationData = {
  events: TimelineEvent[];
  tags: Tag[];
  eventTags: EventTagRow[];
};
export type PublicationRows = { events: unknown[]; tags: unknown[]; eventTags: unknown[] };
export type PublicationPage = {
  data: unknown[] | null;
  count: number | null;
  error: { message: string } | null;
};

// Count every page, and advance by the actual response size. A project limit
// smaller than our requested page size must not masquerade as the last page.
export async function readAllPublicationRows(
  label: string,
  read: (from: number, to: number) => PromiseLike<PublicationPage>,
  pageSize = 500,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  let expected: number | null = null;
  for (;;) {
    const page = await read(rows.length, rows.length + pageSize - 1);
    if (page.error) throw new Error(`${label}: ${page.error.message}`);
    if (!Array.isArray(page.data) || page.count === null || !Number.isSafeInteger(page.count) || page.count < 0) {
      throw new Error(`${label}: missing data or exact row count`);
    }
    expected ??= page.count;
    if (page.count !== expected) throw new Error(`${label}: row count changed during publication`);
    if (page.data.length > pageSize || rows.length + page.data.length > expected) {
      throw new Error(`${label}: inconsistent page size/count`);
    }
    rows.push(...page.data);
    if (rows.length === expected) return rows;
    if (page.data.length === 0) throw new Error(`${label}: incomplete dataset (${rows.length}/${expected})`);
  }
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}: expected a record`);
  return value as Record<string, unknown>;
}
function required(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label}: required nonempty text`);
}
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`${label}: duplicate key`);
}
function webUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) throw new Error();
  } catch { throw new Error(`${label}: malformed HTTP(S) URL`); }
}

export function validatePublicationData(rows: PublicationRows, storylines: Storyline[] = STORYLINES): PublicationData {
  const events = rows.events.map((value) => {
    const row = record(value, "event");
    for (const key of ["id", "title", "description", "sources"]) required(row[key], `event ${row.id}: ${key}`);
    if (!/^[a-zA-Z0-9-]+$/.test(String(row.id)) || !createEventSlug(String(row.title))) throw new Error(`event ${row.id}: invalid route`);
    if ((row.event_date == null) === (row.historical_year == null)) throw new Error(`event ${row.id}: exactly one date is required`);
    if (row.historical_year != null && (!Number.isSafeInteger(row.historical_year) || row.historical_year === 0)) throw new Error(`event ${row.id}: invalid historical year`);
    if (row.event_date != null) {
      const date = typeof row.event_date === "string" && row.event_date.match(/^(\d+)-(\d{2})-(\d{2})( BC)?$/);
      if (!date) throw new Error(`event ${row.id}: invalid date format`);
      const [, year, month, day, bc] = date;
      const y = Number(year), m = Number(month), d = Number(day);
      const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
      const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if ((!bc && y === 0) || m < 1 || m > 12 || d < 1 || d > days[m - 1]) throw new Error(`event ${row.id}: invalid calendar date`);
    }
    if (!["Laws", "Breweries", "Events", "People", "Science", "Styles", "Community"].includes(String(row.category))) throw new Error(`event ${row.id}: invalid category`);
    if (!["date", "month", "year", "decade", "century"].includes(String(row.date_precision))) throw new Error(`event ${row.id}: invalid date precision`);
    for (const field of ["image_url", "created_at", "updated_at"]) {
      if (row[field] != null && typeof row[field] !== "string") throw new Error(`event ${row.id}: invalid ${field}`);
    }
    const urls = String(row.sources).match(/https?:\/\/[^\s<>]*/g) ?? [];
    for (const url of urls) webUrl(url.replace(/[).,;]+$/, ""), `event ${row.id} source`);
    if (row.image_url) webUrl(String(row.image_url), `event ${row.id} image`);
    return row as EventRow;
  });
  unique(events.map((event) => event.id), "events");
  if (!events.length) throw new Error("Refusing to publish an empty event dataset");
  const tags = rows.tags.map((value) => {
    const row = record(value, "tag");
    required(row.id, "tag id"); required(row.name, "tag name");
    return { id: row.id, name: row.name };
  });
  unique(tags.map((tag) => tag.id), "tags");
  unique(tags.map((tag) => tag.name), "tag names");
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));
  const eventIds = new Set(events.map((event) => event.id));
  const eventTags = rows.eventTags.map((value) => {
    const row = record(value, "event tag");
    required(row.event_id, "event tag event_id"); required(row.tag_id, "event tag tag_id");
    // Relations for soft-deleted events are not part of the publication.
    if (eventIds.has(row.event_id) && !tagById.has(row.tag_id)) throw new Error(`event ${row.event_id}: missing tag ${row.tag_id}`);
    return { event_id: row.event_id, tag_id: row.tag_id };
  }).filter((row) => eventIds.has(row.event_id));
  unique(eventTags.map((row) => `${row.event_id}/${row.tag_id}`), "event tags");
  const tagsByEvent = new Map<string, Tag[]>();
  for (const row of eventTags) tagsByEvent.set(row.event_id, [...(tagsByEvent.get(row.event_id) ?? []), tagById.get(row.tag_id)!]);
  const tagged = events.map((event) => ({ ...event, tags: tagsByEvent.get(event.id) ?? [] })).sort(compareEventsChronologicallyDescending);
  const names = new Set(tags.map((tag) => tag.name));
  unique(storylines.map((storyline) => storyline.slug), "Storylines");
  for (const storyline of storylines) {
    if (!eventIds.has(storyline.featuredEventId)) throw new Error(`Storyline ${storyline.slug}: missing featured event`);
    for (const name of [...storyline.tagNames, ...(storyline.requiredTagNames ?? [])]) {
      if (!names.has(name)) throw new Error(`Storyline ${storyline.slug}: missing tag ${name}`);
    }
  }
  const locations = buildMapLocations(tagged);
  unique(locations.map((location) => location.id), "map locations");
  for (const location of locations) {
    if (!Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 || !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180) throw new Error(`Map ${location.id}: invalid coordinates`);
  }
  return { events: tagged, tags, eventTags };
}
