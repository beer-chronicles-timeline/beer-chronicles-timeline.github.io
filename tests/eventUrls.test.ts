import assert from "node:assert/strict";
import test from "node:test";
import {
  getCorrectionSubmissionPath,
  getEventPath,
} from "../src/lib/eventUrls.ts";

test("builds correction submission context with the canonical event URL", () => {
  const id = "event/id";
  const title = "Bräu’s Beer & Brewing: 1842!";
  const path = getCorrectionSubmissionPath(id, title);
  const url = new URL(path, "http://localhost:3000");

  assert.equal(url.pathname, "/submit");
  assert.equal(url.searchParams.get("submissionType"), "correction");
  assert.equal(url.searchParams.get("eventTitle"), title);
  assert.equal(
    url.searchParams.get("eventUrl"),
    "https://beer-chronicles.org/events/event%2Fid/braus-beer-and-brewing-1842"
  );
});

test("preserves existing event path behavior", () => {
  assert.equal(
    getEventPath("event/id", "Bräu’s Beer & Brewing: 1842!"),
    "/events/event%2Fid/braus-beer-and-brewing-1842"
  );
});
