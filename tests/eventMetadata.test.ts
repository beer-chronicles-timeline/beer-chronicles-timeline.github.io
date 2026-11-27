import assert from "node:assert/strict";
import test from "node:test";
import {
  getEventDocumentTitle,
  getEventPublicationDates,
  getEventSitemapLastModified,
} from "../src/lib/eventMetadata.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

test("Raqefet's SEO override changes only its document title", () => {
  const event = {
    ...makeEvent({ created_at: null }),
    id: "c96f798b-e46c-4b8b-83a7-6245aa1b795b",
    title: "Raqefet Cave Preserves the Earliest Known Evidence of Cereal Beer Brewing",
    seo_title: "Raqefet Cave: Earliest Known Evidence of Beer Brewing",
  };
  const before = structuredClone(event);
  assert.equal(getEventDocumentTitle(event),
    "Raqefet Cave: Earliest Known Evidence of Beer Brewing | Beer Chronicles");
  assert.deepEqual(event, before);
});

test("events without a nonempty SEO override retain their exact document titles", () => {
  for (const title of [
    "Raqefet Cave Preserves the Earliest Known Evidence of Cereal Beer Brewing",
    "Bavaria Prohibits Summer Brewing",
    "The Hymn to Ninkasi Describes Mesopotamian Brewing",
    "Large-Scale Brewing Develops at Hierakonpolis",
  ]) {
    for (const seo_title of [undefined, null, "", "  "]) {
      assert.equal(getEventDocumentTitle({ title, seo_title }), `${title} | Beer Chronicles`);
    }
  }
});

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

test("omits sitemap lastmod when only creation time is known", () => {
  const event = makeEvent({ created_at: "2026-06-11T20:57:01Z" });

  assert.equal(getEventSitemapLastModified(event), undefined);
});

test("omits invalid or unavailable timestamps", () => {
  const event = makeEvent({ created_at: "not-a-date", updated_at: null });

  assert.deepEqual(getEventPublicationDates(event), {});
  assert.equal(getEventSitemapLastModified(event), undefined);
});

test("sitemap rejects timezone-free timestamps from Google's reported lines", () => {
  for (const updated_at of [
    "2026-09-04T11:33:15.30406", // line 167
    "2026-09-05T14:04:05.111631", // line 171
    "2026-09-14T14:34:43.941155", // line 175
  ]) {
    assert.equal(getEventSitemapLastModified(makeEvent({
      created_at: "2026-06-11T20:57:01Z", updated_at,
    })), undefined, updated_at);
  }
});

for (const updated_at of [
  "2026-11-27",
  "2024-02-29",
  "2000-02-29",
  "2026-11-27T14:30Z",
  "2026-11-27T14:30:00Z",
  "2026-11-27T14:30:00.1Z",
  "2026-11-27T14:30:00.111631Z",
  "2026-11-27T14:30:00+00:00",
  "2026-11-27T14:30:00.111631+01:00",
  "2026-11-27T14:30-08:00",
  "2026-11-27T14:30:00+05:30",
  "2026-11-27T14:30:00+14:00",
  "2026-11-27T14:30:00-14:00",
]) {
  test(`sitemap preserves verified W3C modification date ${updated_at}`, () => {
    assert.equal(getEventSitemapLastModified(makeEvent({ created_at: null, updated_at })), updated_at);
  });
}

for (const updated_at of [
  undefined, null, "", "not-a-date", "2026", "2026-11", "2026-2-03",
  "2026-02-29", "1900-02-29", "2026-04-31", "2026-00-01", "2026-13-01",
  "2026-11-00", "2026-11-32", "0000-01-01", "-001000-01-01", "+010000-01-01",
  "2026-11-27T24:00:00Z", "2026-11-27T14:60:00Z", "2026-11-27T14:30:60Z",
  "2026-11-27T14:30:00", "2026-11-27T14:30:00.111631",
  "2026-11-27 14:30:00Z", "2026-11-27T14:30:00+0100",
  "2026-11-27T14:30:00+01", "2026-11-27T14:30:00+00:60",
  "2026-11-27T14:30:00+14:01", "2026-11-27T14:30:00-15:00",
  "2026-11-27T14:30:00+24:00", "2026-11-27T14:30.5Z",
  "2026-11-27T14:30:00.Z", " 2026-11-27", "2026-11-27\n", "November 27, 2026",
]) {
  test(`sitemap omits unverifiable modification date ${JSON.stringify(updated_at)}`, () => {
    assert.equal(getEventSitemapLastModified(makeEvent({
      created_at: "2026-06-11T20:57:01Z", updated_at,
    })), undefined);
  });
}

test("sitemap never substitutes historical, creation, or build dates for modification time", () => {
  for (const dates of [
    { event_date: "1516-04-23", historical_year: null },
    { event_date: null, historical_year: -13000 },
  ]) {
    const event = {
      ...makeEvent({ created_at: "2026-11-27T14:30:00Z" }), ...dates,
    };
    const before = structuredClone(event);
    assert.equal(getEventSitemapLastModified(event), undefined);
    assert.deepEqual(event, before);
  }
});
