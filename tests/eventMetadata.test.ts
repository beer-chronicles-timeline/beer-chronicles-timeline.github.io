import assert from "node:assert/strict";
import test from "node:test";
import {
  getEventPublicationDates,
  getEventSitemapLastModified,
} from "../src/lib/eventMetadata.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

function makeEvent(
  timestamps: Pick<TimelineEvent, "created_at" | "updated_at">
): TimelineEvent {
  return {
    id: "event-id",
    title: "Test event",
    description: null,
    event_date: null,
    historical_year: null,
    image_url: null,
    category: null,
    date_precision: null,
    sources: null,
    ...timestamps,
  };
}

test("does not present creation time as a modification time", () => {
  const event = makeEvent({
    created_at: "2026-06-11T20:57:01.372935Z",
  });

  assert.deepEqual(getEventPublicationDates(event), {
    datePublished: "2026-06-11T20:57:01.372935Z",
  });
});

test("uses a genuine update time for structured data and sitemap", () => {
  const event = makeEvent({
    created_at: "2026-06-11T20:57:01Z",
    updated_at: "2026-08-20T09:30:00Z",
  });

  assert.deepEqual(getEventPublicationDates(event), {
    datePublished: "2026-06-11T20:57:01Z",
    dateModified: "2026-08-20T09:30:00Z",
  });
  assert.equal(
    getEventSitemapLastModified(event),
    "2026-08-20T09:30:00Z"
  );
});

test("falls back to creation time for sitemap lastmod", () => {
  const event = makeEvent({ created_at: "2026-06-11T20:57:01Z" });

  assert.equal(
    getEventSitemapLastModified(event),
    "2026-06-11T20:57:01Z"
  );
});

test("omits invalid or unavailable timestamps", () => {
  const event = makeEvent({ created_at: "not-a-date", updated_at: null });

  assert.deepEqual(getEventPublicationDates(event), {});
  assert.equal(getEventSitemapLastModified(event), undefined);
});
