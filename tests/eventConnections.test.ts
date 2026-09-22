import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ConnectedHistory from "../src/components/ConnectedHistory.tsx";
import { getConnectedEvents } from "../src/lib/eventConnections.ts";
import { getRelatedEvents } from "../src/components/timelineUtils.ts";
import { getEventPath } from "../src/lib/eventUrls.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

const foundationId = "052dddfe-48d9-4d9c-874c-6cced052d10e";
const revivalId = "416e2437-3334-453f-8e11-77b3000572a2";

// Synthetic descriptions/tags using the two approved connection IDs.
function fixture(id: string, year: number, tagNames = ["Fixture topic"]): TimelineEvent {
  return {
    id,
    title: `Entry ${id}`,
    description: "Connection test fixture",
    historical_year: year,
    event_date: null,
    date_precision: "year",
    image_url: null,
    created_at: null,
    category: "Breweries",
    tags: tagNames.map((name) => ({ id: name, name })),
  };
}

const foundation = fixture(foundationId, 1907);
const revival = fixture(revivalId, 2015);

test("the approved Union pair resolves in both directions with distinct labels", () => {
  const events = [foundation, revival];
  const before = structuredClone(events);
  assert.deepEqual(getConnectedEvents(foundation, events), [
    { event: revival, label: "Later history at the same site" },
  ]);
  assert.deepEqual(getConnectedEvents(revival, events), [
    { event: foundation, label: "Earlier history at the same site" },
  ]);
  assert.deepEqual(events, before);
});

test("connections require a published target and are not inferred from similar entries", () => {
  assert.deepEqual(getConnectedEvents(foundation, [foundation]), []);
  assert.deepEqual(getConnectedEvents(revival, []), []);
  const unreviewed = { ...foundation, id: "unreviewed" };
  assert.deepEqual(getConnectedEvents(unreviewed, [foundation, revival, unreviewed]), []);
  assert.equal(getConnectedEvents(foundation, [foundation, revival, revival]).length, 1);
});

test("connected entries are excluded before choosing three topical suggestions", () => {
  for (const [current, connected] of [[foundation, revival], [revival, foundation]]) {
    const strongest = fixture(connected.id, current.historical_year!, ["Fixture topic", "Rare fixture"]);
    const withRareTag = fixture(current.id, current.historical_year!, ["Fixture topic", "Rare fixture"]);
    const candidates = [fixture("a", 1900), fixture("b", 1950), fixture("c", 2000)];
    const events = [withRareTag, strongest, ...candidates];
    const before = structuredClone(events);
    const suggestions = getRelatedEvents(withRareTag, events);
    assert.equal(suggestions.length, 3);
    assert.deepEqual(new Set(suggestions.map(({ id }) => id)), new Set(["a", "b", "c"]));
    assert.deepEqual(events, before);
    assert.equal(getConnectedEvents(withRareTag, events)[0].event.id, connected.id);
  }
});

test("empty connected history renders no heading, wrapper, or spacing in either view", () => {
  assert.equal(renderToStaticMarkup(createElement(ConnectedHistory, { connections: [] })), "");
  assert.equal(renderToStaticMarkup(createElement(ConnectedHistory, {
    connections: [], onOpenEvent: () => {},
  })), "");
});

test("connected history uses a permanent link on pages and a button in modals", () => {
  const connections = getConnectedEvents(foundation, [foundation, revival]);
  const page = renderToStaticMarkup(createElement(ConnectedHistory, { connections }));
  assert.ok(page.includes('href="' + getEventPath(revival.id, revival.title) + '"'));
  assert.ok(page.includes("Later history at the same site"));
  assert.ok(page.includes("2,015"));
  assert.ok(page.includes("<h2"));
  const modal = renderToStaticMarkup(createElement(ConnectedHistory, {
    connections, onOpenEvent: () => {},
  }));
  assert.ok(modal.includes('<button type="button"'));
  assert.ok(modal.includes("<h3"));
  assert.ok(!modal.includes("href="));
});
