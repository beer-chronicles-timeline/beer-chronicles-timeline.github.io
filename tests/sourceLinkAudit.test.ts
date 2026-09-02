import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyHttpStatus,
  collectSourceLinks,
} from "../scripts/source-link-audit.ts";

test("collects and deduplicates source URLs with their event references", () => {
  assert.deepEqual(
    collectSourceLinks([
      {
        id: "event-1",
        title: "First event",
        sources: "First source\nhttps://example.com/article",
      },
      {
        id: "event-2",
        title: "Second event",
        sources: JSON.stringify([
          { title: "Same source", url: "https://example.com/article" },
          { title: "Another source", url: "www.example.org/report.pdf" },
        ]),
      },
    ]),
    [
      {
        url: "https://example.com/article",
        references: [
          { eventId: "event-1", eventTitle: "First event" },
          { eventId: "event-2", eventTitle: "Second event" },
        ],
      },
      {
        url: "https://www.example.org/report.pdf",
        references: [{ eventId: "event-2", eventTitle: "Second event" }],
      },
    ]
  );
});

test("classifies definite failures separately from blocking and transient errors", () => {
  assert.equal(classifyHttpStatus(200, false), "working");
  assert.equal(classifyHttpStatus(200, true), "redirected");
  assert.equal(classifyHttpStatus(404, false), "missing");
  assert.equal(classifyHttpStatus(410, false), "missing");
  assert.equal(classifyHttpStatus(403, false), "blocked");
  assert.equal(classifyHttpStatus(429, false), "rate-limited");
  assert.equal(classifyHttpStatus(503, false), "transient-error");
  assert.equal(classifyHttpStatus(451, false), "needs-review");
});
