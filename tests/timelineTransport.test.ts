import assert from "node:assert/strict";
import test from "node:test";
import { encodeTimelineData, decodeTimelineData } from "../src/lib/timelineTransport.ts";
import { filterTimelineEvents } from "../src/components/timelineFiltering.ts";
import type { HomeTimelineData } from "../src/lib/homeTimelineData.ts";

const data: HomeTimelineData = {
  events: [{
    id: "fixture", title: "Fixture entry", description: "a".repeat(200) + " Unterhefe",
    event_date: null, historical_year: -1, image_url: null, created_at: "2026-01-01",
    sources: "Source A\nhttps://example.org/source", category: "Events",
    date_precision: "year", tags: [{ id: "uk", name: "United Kingdom" }],
  }],
  tags: [{ id: "uk", name: "United Kingdom" }],
  visibleTags: [{ id: "uk", name: "United Kingdom" }], minYear: -1, maxYear: 2026,
};

test("compact transport preserves full text, sources, dates and shared tags", () => {
  const encoded = encodeTimelineData(data);
  assert.deepEqual(encoded.events[0].tags, [0]);
  assert.ok(!("created_at" in encoded.events[0]));
  assert.ok(!("image_url" in encoded.events[0]));
  const decoded = decodeTimelineData(JSON.parse(JSON.stringify(encoded)));
  assert.deepEqual(decoded, {
    ...data, events: [{ ...data.events[0], created_at: null }],
  });
  const matches = filterTimelineEvents({
    events: decoded.events, activeCategory: null, startYear: -1, endYear: 2026,
    selectedTagIds: [], tagFilterMode: "all", isOldestFirst: true,
    searchQuery: "Unterhefe",
  });
  assert.equal(matches.length, 1);
});

test("empty data and legacy cached data can be decoded", () => {
  assert.deepEqual(decodeTimelineData(data), data);
  const empty = { ...data, events: [], tags: [], visibleTags: [] };
  assert.deepEqual(decodeTimelineData(encodeTimelineData(empty)), empty);
});

test("invalid tag references fail instead of silently losing membership", () => {
  assert.throws(() => encodeTimelineData({ ...data, tags: [] }), /Unknown timeline tag/);
  const compact = encodeTimelineData(data);
  compact.events[0].tags = [999];
  assert.throws(() => decodeTimelineData(compact), /Invalid timeline tag/);
});
