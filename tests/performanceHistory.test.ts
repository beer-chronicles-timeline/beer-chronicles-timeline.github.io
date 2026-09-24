import assert from "node:assert/strict";
import test from "node:test";
import { recoverPerformanceHistory, selectPerformanceBaseline } from "../scripts/performance-history.mjs";
const report = { schemaVersion: 1, commit: "old", profileKey: "host", publicationMode: "live", workingTreeDirty: false, errors: [], routes: [{ name: "map", metrics: { lcpMs: 1000 } }] };
const current = { ...report, commit: "current" };
const run = { id: 10, head_sha: "old", run_attempt: 2, head_branch: "main", status: "completed", conclusion: "success", created_at: "2026-09-01T00:00:00Z", html_url: "https://github.com/example/run/10" };
test("durable history recovers after a cache gap and accepts a deploy-only rerun", async () => {
  const loaded: string[] = [];
  const history = await recoverPerformanceHistory({
    listRuns: async () => [run, { ...run, id: 11, head_sha: "current" }, { ...run, id: 12, conclusion: "failure" }, { ...run, id: 13, created_at: "2026-10-01T00:00:00Z" }],
    listArtifacts: async () => [{ name: "performance-old-1", expired: false }],
    readReport: async (_id: number, name: string) => { loaded.push(name); return report; },
  }, { id: 20, commit: "current", createdAt: "2026-09-24T00:00:00Z" });
  assert.deepEqual(loaded, ["performance-old-1"]);
  const selected = selectPerformanceBaseline(current, history, Date.parse("2026-09-24T00:00:00Z"));
  assert.equal(selected.baseline?.commit, "old");
  assert.equal(selected.source?.ageDays, 23);
});
test("expired, failed, incomplete and incompatible history is explicit; never compare a commit to itself", async () => {
  const history = await recoverPerformanceHistory({ listRuns: async () => [run], listArtifacts: async () => [{ name: "performance-old-2", expired: true }], readReport: async () => { throw new Error("must not download"); } }, { id: 20, commit: "current", createdAt: "2026-09-24T00:00:00Z" });
  assert.match(history.notes[0], /expired/);
  assert.match(selectPerformanceBaseline(current, history).reason, /history gap/);
  const candidate = { report, runId: 10, runUrl: run.html_url, createdAt: run.created_at };
  for (const invalid of [{ ...report, commit: "current" }, { ...report, profileKey: "other" }, { ...report, errors: ["failed"] }, { ...report, routes: [] }]) {
    assert.equal(selectPerformanceBaseline(current, { candidates: [{ ...candidate, report: invalid }], notes: [] }).baseline, null);
  }
  const recovered = selectPerformanceBaseline(current, { candidates: [{ ...candidate, report: { ...report, profileKey: "other" } }, candidate], notes: [] });
  assert.equal(recovered.baseline?.commit, "old");
  assert.match(recovered.notes[0], /incompatible/);
});
test("history never falls back to an older successful measurement from a failed latest build attempt", async () => {
  const history = await recoverPerformanceHistory({ listRuns: async () => [run], listArtifacts: async () => [{ name: "performance-old-1", expired: false }, { name: "performance-old-2", expired: false }], readReport: async (_id: number, name: string) => { assert.equal(name, "performance-old-2"); return { ...report, errors: ["failed"] }; } }, { id: 20, commit: "current", createdAt: "2026-09-24T00:00:00Z" });
  assert.equal(history.candidates.length, 0);
});
