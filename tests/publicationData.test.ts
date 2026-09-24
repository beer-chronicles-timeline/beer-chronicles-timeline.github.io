import assert from "node:assert/strict";
import test from "node:test";
import { readAllPublicationRows, validatePublicationData } from "../src/lib/publicationData";
import { createPublicationFixture } from "./fixtures/publication";
import { getEventRouteParams, isKnownEventSlug, assertPublishedEventPaths, publishedEventPaths } from "../src/lib/eventAliases";
import { createEventSlug } from "../src/lib/eventUrls";

for (const count of [750, 1000, 1500]) {
  test(`publication retains all ${count} events under a smaller API cap`, async () => {
    const fixture = createPublicationFixture(count);
    const load = (rows: unknown[]) => readAllPublicationRows("fixture", async (from, to) => ({ data: rows.slice(from, Math.min(to + 1, from + 250)), count: rows.length, error: null }));
    const [events, tags, eventTags] = await Promise.all([load(fixture.events), load(fixture.tags), load(fixture.eventTags)]);
    const publication = validatePublicationData({ events, tags, eventTags });
    assert.equal(publication.events.length, count);
    const params = getEventRouteParams(publication.events);
    for (const event of publication.events) assert.ok(params.some((param) => param.id === event.id && param.slug === createEventSlug(event.title)));
    assert.equal(new Set(params.map((param) => param.id)).size, count);
  });
}
test("pagination rejects missing, failed, truncated and changing batches", async () => {
  await assert.rejects(readAllPublicationRows("events", async () => ({ data: [], count: 750, error: null })), /incomplete/);
  await assert.rejects(readAllPublicationRows("events", async () => ({ data: null, count: null, error: { message: "unavailable" } })), /unavailable/);
  await assert.rejects(readAllPublicationRows("events", async () => ({ data: [], count: null, error: null })), /exact row count/);
  await assert.rejects(readAllPublicationRows("events", async (from) => ({ data: [{}], count: from === 0 ? 3 : 4, error: null })), /count changed/);
});
test("publication rejects structural corruption before rendering", () => {
  const corruptions = [
    { title: "" }, { sources: "" }, { sources: "https://" }, { description: "" },
    { historical_year: 0 }, { historical_year: 1.5 }, { category: "Unknown" },
    { date_precision: "approximate" }, { event_date: "2026-02-30", historical_year: null },
    { event_date: "2026-01-01", historical_year: 2026 },
  ];
  for (const corruption of corruptions) {
    const fixture = createPublicationFixture();
    Object.assign(fixture.events[0] as object, corruption);
    assert.throws(() => validatePublicationData(fixture), JSON.stringify(corruption));
  }
  const duplicate = createPublicationFixture(); duplicate.events.push(duplicate.events[0]);
  assert.throws(() => validatePublicationData(duplicate), /duplicate/);
  const missingTag = createPublicationFixture(); missingTag.tags = [];
  assert.throws(() => validatePublicationData(missingTag), /missing tag/);
  const missingEvent = createPublicationFixture(); missingEvent.events = [];
  assert.throws(() => validatePublicationData(missingEvent), /empty/);
});
test("supported BCE dates remain valid; required Storyline references must resolve", () => {
  const fixture = createPublicationFixture();
  Object.assign(fixture.events[0] as object, { historical_year: null, event_date: "0439-01-01 BC" });
  assert.equal(validatePublicationData(fixture).events.length, 750);
  assert.throws(() => validatePublicationData(fixture, [{ slug: "test", title: "test", description: "test", sectionId: "foundations", featuredEventId: "missing", tagNames: [] }]), /missing featured/);
});
test("historical slugs survive title changes but arbitrary slugs do not", () => {
  const id = "1c650d85-7d10-4e17-a7af-76a7a8c4556e";
  const title = "A future corrected title";
  assert.ok(isKnownEventSlug(id, "balling-invents-the-saccharimeter", title));
  assert.ok(isKnownEventSlug(id, createEventSlug(title), title));
  assert.equal(isKnownEventSlug(id, "anything-else", title), false);
  assert.throws(() => assertPublishedEventPaths([{ id, title }]), /Unregistered/);
  assert.deepEqual(getEventRouteParams([{ id, title }]).map((p) => p.slug), [createEventSlug(title), ...publishedEventPaths[id]]);
});
