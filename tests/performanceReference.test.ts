import assert from "node:assert/strict";
import test from "node:test";
import { assertMeasurementContext, createComparisonContext, snapshotFingerprint } from "../scripts/performance-reference.mjs";
import { comparePerformance, type PerformanceReport } from "../scripts/performance-report.mts";

const currentCommit = "a".repeat(40), referenceCommit = "b".repeat(40);
const snapshot = {
  commit: currentCommit, mode: "live", generatedAt: "2026-11-15T00:00:00Z",
  events: [{ id: "event", description: "Test content" }],
  tags: [{ id: "tag", name: "Test tag" }], eventTags: [{ event_id: "event", tag_id: "tag" }],
};

test("controlled references fingerprint all dataset rows independently of build identity", () => {
  const fingerprint = snapshotFingerprint(snapshot);
  assert.equal(snapshotFingerprint({ ...snapshot, mode: "fixture", commit: referenceCommit }), fingerprint);
  for (const changed of [
    { ...snapshot, events: [{ id: "event", description: "Different content" }] },
    { ...snapshot, tags: [] }, { ...snapshot, eventTags: [] },
  ]) assert.notEqual(snapshotFingerprint(changed), fingerprint);
  assert.throws(() => snapshotFingerprint({ events: [] }), /complete/);
  assert.throws(() => createComparisonContext(snapshot, currentCommit, currentCommit, "run"), /distinct/);
});

test("each measurement verifies the real snapshot and export against its role", () => {
  const context = createComparisonContext(snapshot, currentCommit, referenceCommit, "run-123");
  const publication = { commit: currentCommit, mode: "live", eventCount: 1 };
  assert.doesNotThrow(() => assertMeasurementContext({ ...context, role: "current" }, snapshot, publication, currentCommit));
  const reference = { ...snapshot, commit: referenceCommit, mode: "fixture" };
  const referencePublication = { ...publication, commit: referenceCommit, mode: "fixture" };
  assert.doesNotThrow(() => assertMeasurementContext({ ...context, role: "reference" }, reference, referencePublication, referenceCommit));
  for (const [data, exported, commit] of [
    [snapshot, referencePublication, currentCommit],
    [{ ...snapshot, eventTags: [] }, publication, currentCommit],
    [snapshot, { ...publication, eventCount: 2 }, currentCommit],
    [snapshot, publication, referenceCommit],
  ] as const) assert.throws(() => assertMeasurementContext({ ...context, role: "current" }, data, exported, commit), /does not match/);
  assert.throws(() => assertMeasurementContext({ ...context, role: "reference" }, { ...reference, mode: "live" }, referencePublication, referenceCommit), /does not match/);
});

test("only verified same-run pairs can compare a fixture reference with a live candidate", () => {
  const context = createComparisonContext(snapshot, currentCommit, referenceCommit, "run-123");
  const common = {
    schemaVersion: 1, profileKey: "same CPU, browser and harness", eventCount: 1, errors: [],
    routes: [{ name: "map", metrics: { lcpMs: 1000, readyMs: 2000 } }],
  };
  const current: PerformanceReport = { ...common, commit: currentCommit, publicationMode: "live", comparisonContext: { ...context, role: "current" } };
  const reference: PerformanceReport = { ...common, commit: referenceCommit, publicationMode: "fixture", comparisonContext: { ...context, role: "reference" } };
  const comparison = comparePerformance(current, reference);
  assert.equal(comparison.comparable, true);
  assert.match(comparison.reason, /Same-run code comparison/);
  for (const invalid of [
    { ...reference, profileKey: "different CPU" },
    { ...reference, comparisonContext: undefined },
    { ...reference, comparisonContext: { ...reference.comparisonContext!, snapshotHash: "0".repeat(64) } },
    { ...reference, comparisonContext: { ...reference.comparisonContext!, runId: "other-run" } },
    { ...reference, comparisonContext: { ...reference.comparisonContext!, role: "current" } },
    { ...reference, commit: currentCommit }, { ...reference, eventCount: 2 },
    { ...reference, errors: ["measurement failed"] },
    { ...reference, routes: [] },
    { ...reference, routes: [{ name: "map", metrics: { lcpMs: 1000 } }] },
  ]) assert.equal(comparePerformance(current, invalid).comparable, false);
});
