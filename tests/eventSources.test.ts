import assert from "node:assert/strict";
import test from "node:test";
import { encodeEventSources } from "../src/lib/eventSources.ts";
import { decodeEventSources, getEventSourcesPath } from "../src/lib/sourceTransport.ts";
import { loadEventSources } from "../src/lib/useEventSources.ts";

test("citation revisions preserve exact source text and change with its content", () => {
  const event = { id: "fixture", sources: "Author. Title.\r\nhttps://example.org/reference\n\nBook, page 42." };
  const data = encodeEventSources(event);
  assert.equal(data.sources, event.sources);
  assert.deepEqual(encodeEventSources({ ...event }), data);
  assert.notEqual(encodeEventSources({ ...event, sources: `${event.sources} Revised.` }).revision, data.revision);
  assert.equal(encodeEventSources({ id: "other", sources: event.sources }).revision, data.revision);
  assert.equal(encodeEventSources({ ...event, sources: null }).sources, null);
  assert.equal(getEventSourcesPath(event.id, data.revision), `/events/fixture/sources/${data.revision}/data.json`);
});

test("citations for another entry or revision are rejected instead of displayed", () => {
  const data = encodeEventSources({ id: "fixture", sources: "Reference" });
  assert.deepEqual(decodeEventSources(data, data.eventId, data.revision), data);
  for (const invalid of [
    { ...data, eventId: "other" }, { ...data, revision: "0".repeat(20) },
    { ...data, sources: {} }, { ...data, version: 2 }, null,
  ]) assert.throws(() => decodeEventSources(invalid, data.eventId, data.revision), /Sources do not match/);
  assert.throws(() => getEventSourcesPath("fixture", "../other"), /Invalid source revision/);
});

test("concurrent and repeated citation requests share the same cached response", async (t) => {
  const data = encodeEventSources({ id: "cache-fixture", sources: "Reference" });
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(data));
  const [first, second] = await Promise.all([
    loadEventSources(data.eventId, data.revision), loadEventSources(data.eventId, data.revision),
  ]);
  assert.deepEqual(first, data);
  assert.deepEqual(second, data);
  await loadEventSources(data.eventId, data.revision);
  assert.equal(fetch.mock.callCount(), 1);
});

test("failed and mismatched citation requests can be retried without poisoning the cache", async (t) => {
  const data = encodeEventSources({ id: "retry-fixture", sources: "Reference" });
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    if (requests === 1) return new Response("Unavailable", { status: 503 });
    if (requests === 2) return Response.json({ ...data, eventId: "wrong-entry" });
    return Response.json(data);
  });
  await assert.rejects(loadEventSources(data.eventId, data.revision), /Source request failed/);
  await assert.rejects(loadEventSources(data.eventId, data.revision), /Sources do not match/);
  assert.deepEqual(await loadEventSources(data.eventId, data.revision), data);
  assert.equal(requests, 3);
});
