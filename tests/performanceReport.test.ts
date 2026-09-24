import assert from "node:assert/strict";
import test from "node:test";
import { median, calculateCls, comparePerformance, capacityForecast, type PerformanceReport } from "../scripts/performance-report.mts";

test("performance comparisons ignore noise and incompatible environments", () => {
  const baseline: PerformanceReport = { schemaVersion: 1, profileKey: "same", publicationMode: "live", commit: "old", routes: [{ name: "map", metrics: { lcpMs: 1500, cls: 0, jsEncodedBytes: 500_000 } }] };
  const current = { ...baseline, commit: "new", routes: [{ name: "map", metrics: { lcpMs: 2000, cls: 0.04, jsEncodedBytes: 510_000 } }] };
  assert.deepEqual(comparePerformance(current, baseline).changes.filter((change) => change.warning).map((change) => change.metric), ["lcpMs", "cls"]);
  assert.equal(comparePerformance({ ...current, profileKey: "another host" }, baseline).comparable, false);
  assert.equal(comparePerformance({ ...current, publicationMode: "fixture" }, baseline).comparable, false);
  assert.equal(comparePerformance(current, null).comparable, false);
});
test("medians and capacity projections preserve the measured baseline", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 4, 2, 3]), 2.5);
  assert.throws(() => median([]));
  const result = capacityForecast(590, 915835, 325171, 1150 * 1024, 384 * 1024);
  assert.equal(result.estimatedAdditionalEvents, 123);
  assert.equal(result.projections[0].events, 750);
  assert.equal(result.projections[0].exceedsCurrentBudget, true);
  assert.throws(() => capacityForecast(0, 0, 0, 100, 100));
});

test("CLS uses the largest session, anchored to the first actual shift", () => {
  assert.equal(calculateCls([]), 0);
  const continuous = [500, 1400, 2300, 3200, 4100, 5000].map((time) => ({ time, value: 0.1 }));
  assert.ok(Math.abs(calculateCls(continuous) - 0.6) < 1e-10);
  assert.ok(Math.abs(calculateCls([...continuous, { time: 5900, value: 0.2 }]) - 0.6) < 1e-10);
  assert.equal(calculateCls([{ time: 500, value: 0.1 }, { time: 1500, value: 0.2 }]), 0.2);
});
