import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import type { LinkResult } from "../scripts/source-link-audit.ts";
import type { PublishedAudit } from "../scripts/site-link-audit.ts";
import {
  applyAccessHistory, readAuditHistory, recoverAuditHistory, validatePreviousAudit,
  type AuditHistory, type AuditWorkflowRun, type HistoryReader,
} from "../scripts/source-link-history.ts";
import { applyManualReviews, findingForReview, isAwaitingConfirmation, requiresReview, type ReviewRegister } from "../scripts/source-link-review.ts";
import { makeMarkdown, makeSummary } from "../scripts/source-link-report.ts";

const earlier = "2026-10-11T15:00:00.000Z";
const later = "2026-10-12T15:00:00.000Z";
const blocked: LinkResult = {
  url: "https://source.example/article", references: [{ eventId: "fixture", eventTitle: "Synthetic entry" }],
  status: "blocked", httpStatus: 403, finalUrl: null, detail: null,
  attempts: 1, contentType: "text/html", bodyTruncated: false, fragmentStatus: "not-applicable",
};
const working = { ...blocked, status: "working" as const, httpStatus: 200 };
const empty: ReviewRegister = { schemaVersion: 1, reviews: [] };
const none: AuditHistory = { state: "none", reason: "No prior audit." };
function audit(results: LinkResult[], generatedAt = later): PublishedAudit {
  return {
    schemaVersion: 2, generatedAt, siteUrl: "https://beer.example", dataUrl: "https://beer.example/timeline-data.json", sitemapUrl: "https://beer.example/sitemap.xml",
    coverage: {
      complete: true, errors: [], publication: { mode: "live", commit: "a".repeat(40), eventCount: 1, generatedAt: earlier },
      eventCount: 1, eventsWithSourceUrls: 1, sourceUrls: results.length, sourceReferences: results.length,
      sitemapPages: 1, discoveredPages: 1, crawledPages: 1, failedPages: [], discoveredUrls: results.length,
      checkedUrls: results.length, checkedDocuments: results.length, httpRequests: results.length,
      limited: false, inventoryFindings: [], skippedSchemes: {},
    }, results,
  };
}
const history = (report: PublishedAudit): AuditHistory => ({ state: "available", runId: 10, reason: "Prior fixture audit.", report });
function assess(current: PublishedAudit, previous = none, register = empty) {
  const manual = { ...current, ...applyManualReviews(current.results, register, current.generatedAt) };
  const access = applyAccessHistory(manual, previous);
  return { ...manual, ...access,
    reviewSummary: { ...manual.reviewSummary, warningsRequiringReview: access.results.filter(requiresReview).length },
  };
}

test("first access failures stay visible while recurrence across complete audits requires review", () => {
  const raw = audit([blocked]);
  const prior = audit([working], earlier);
  const beforeRaw = structuredClone(raw);
  const beforePrior = structuredClone(prior);
  const first = assess(raw, history(prior));
  assert.equal(first.results[0].accessCheck?.state, "pending");
  assert.equal(first.accessReviewSummary.awaitingConfirmation, 1);
  assert.equal(first.reviewSummary.warningsRequiringReview, 0);
  assert.equal(makeSummary(first.results).blocked, 1);
  const { accessCheck, ...observed } = first.results[0];
  assert.ok(accessCheck);
  assert.deepEqual(observed, blocked);
  assert.deepEqual(raw, beforeRaw);
  assert.deepEqual(prior, beforePrior);

  const second = assess(audit([{ ...blocked, status: "network-error", httpStatus: null, detail: "Timeout" }], "2026-10-13T15:00:00.000Z"), history(first));
  assert.equal(second.results[0].accessCheck?.state, "persistent");
  assert.equal(second.reviewSummary.warningsRequiringReview, 1);
  assert.equal(second.accessReviewSummary.persistentWarnings, 1);
});

test("a successful run, absence of the URL, or a different URL resets the consecutive-failure sequence", () => {
  for (const prior of [audit([working], earlier), audit([], earlier), audit([{ ...blocked, url: "https://source.example/other" }], earlier)]) {
    assert.equal(assess(audit([blocked]), history(prior)).results[0].accessCheck?.state, "pending");
  }
  const recovered = assess(audit([working]), history(audit([blocked], earlier)));
  assert.equal(recovered.results[0].accessCheck, undefined);
  assert.equal(recovered.reviewSummary.warningsRequiringReview, 0);
  const noPrior = assess(audit([blocked]));
  assert.equal(noPrior.results[0].accessCheck?.state, "pending");
});

test("missing targets, content warnings and observed destination or fragment changes bypass deferral", () => {
  for (const change of [
    { status: "missing", httpStatus: 404 }, { status: "missing", httpStatus: 410 },
    { status: "missing-fragment", httpStatus: 200, fragmentStatus: "missing" },
    { status: "needs-review", httpStatus: 200, detail: "Possible error page" },
    { status: "blocked", finalUrl: "https://source.example/" },
    { status: "network-error", httpStatus: null, fragmentStatus: "missing" },
    { status: "network-error", httpStatus: null, fragmentStatus: "unverified" },
  ] as const) {
    const assessed = assess(audit([{ ...blocked, ...change }]), history(audit([working], earlier)));
    assert.equal(requiresReview(assessed.results[0]), true);
    assert.equal(isAwaitingConfirmation(assessed.results[0]), false);
  }
  const content = { ...blocked, status: "needs-review" as const, httpStatus: 200, detail: "Possible login barrier" };
  assert.equal(assess(audit([blocked]), history(audit([content], earlier))).results[0].accessCheck?.state, "immediate");
});

test("expired or substantively changed human confirmations require review on the first access failure", () => {
  const register: ReviewRegister = { schemaVersion: 1, reviews: [{
    url: blocked.url, reviewedOn: "2026-10-11", reviewAfter: "2027-04-09", reviewedBy: "Fixture human", note: "Manually confirmed.", expectedFinding: findingForReview(blocked),
  }] };
  const expired = assess(audit([blocked], "2027-04-09T00:00:00.000Z"), history(audit([working], earlier)), register);
  assert.equal(expired.results[0].accessCheck?.state, "immediate");
  assert.equal(expired.reviewSummary.warningsRequiringReview, 1);
  const changed = assess(audit([{ ...blocked, finalUrl: "https://source.example/" }]), history(audit([working], earlier)), register);
  assert.equal(changed.results[0].accessCheck?.state, "immediate");
  assert.equal(changed.reviewSummary.changedWarnings, 1);
  const acknowledged = assess(audit([{ ...blocked, status: "network-error", httpStatus: null, detail: "Certificate mismatch" }]), history(audit([working], earlier)), register);
  assert.equal(acknowledged.results[0].manualReview?.state, "acknowledged");
  assert.equal(acknowledged.results[0].accessCheck, undefined);
  assert.equal(acknowledged.reviewSummary.warningsRequiringReview, 0);
});

test("missing or unusable history cannot silently defer warnings or count an incomplete audit", () => {
  const invalid: unknown[] = [
    { ...audit([blocked], earlier), schemaVersion: 1 },
    audit([blocked], later), audit([blocked], "2027-01-01T00:00:00.000Z"),
    { ...audit([blocked], earlier), siteUrl: "https://other.example" },
    { ...audit([blocked], earlier), dataUrl: "https://beer.example/other-data.json" },
  ];
  for (const coverage of [
    { complete: false }, { limited: true }, { errors: ["Interrupted"] }, { failedPages: ["https://beer.example/"] },
    { checkedUrls: 0 }, { discoveredUrls: 0 }, { crawledPages: 0 }, { publication: null },
    { checkedDocuments: -1 }, { httpRequests: "1" },
  ]) invalid.push({ ...audit([blocked], earlier), coverage: { ...audit([blocked], earlier).coverage, ...coverage } });
  invalid.push({ ...audit([blocked], earlier), results: [blocked, blocked], coverage: { ...audit([blocked], earlier).coverage, checkedUrls: 2, discoveredUrls: 2 } });
  invalid.push(audit([{ ...blocked, finalUrl: "javascript:alert(1)" }], earlier));
  for (const report of invalid) {
    assert.throws(() => validatePreviousAudit(report, audit([blocked])));
    const assessed = assess(audit([blocked]), { state: "available", reason: "Fixture history", report });
    assert.equal(assessed.results[0].accessCheck?.state, "immediate");
    assert.equal(assessed.accessReviewSummary.previousAudit.state, "unavailable");
    assert.equal(assessed.reviewSummary.warningsRequiringReview, 1);
  }
  const unavailable = assess(audit([blocked]), { state: "unavailable", reason: "Download failed." });
  assert.equal(unavailable.results[0].accessCheck?.state, "immediate");
  const partial = audit([blocked]);
  partial.coverage.complete = false;
  assert.equal(assess(partial, history(audit([blocked], earlier))).results[0].accessCheck?.state, "immediate");
});

test("a stale pending annotation cannot hide a missing target, content issue, or expired review", () => {
  const pending = { state: "pending" as const, reason: "Old first observation", previousAuditGeneratedAt: earlier };
  for (const status of ["missing", "missing-fragment", "needs-review"] as const) {
    assert.equal(requiresReview({ ...blocked, status, accessCheck: pending }), true);
  }
  assert.equal(requiresReview({ ...blocked, httpStatus: 404, accessCheck: pending }), true);
  const expired = { state: "expired" as const, reason: "Expired", reviewedOn: "2026-01-01", reviewAfter: "2026-02-01", reviewedBy: "Fixture", note: "Fixture" };
  assert.equal(requiresReview({ ...blocked, manualReview: expired, accessCheck: pending }), true);
});

test("Markdown distinguishes review, pending confirmation and manual verification without changing raw counts", () => {
  const checked = { ...blocked, url: "https://source.example/reviewed" };
  const registered: ReviewRegister = { schemaVersion: 1, reviews: [{
    url: checked.url, reviewedOn: "2026-10-11", reviewAfter: "2027-04-09", reviewedBy: "Fixture human", note: "Manually confirmed.", expectedFinding: findingForReview(checked),
  }] };
  const missing = { ...blocked, url: "https://source.example/missing", status: "missing" as const, httpStatus: 404 };
  const assessed = assess(audit([blocked, checked, missing]), history(audit([working], earlier)), registered);
  assert.equal(assessed.reviewSummary.warningsRequiringReview, 1);
  assert.equal(assessed.accessReviewSummary.awaitingConfirmation, 1);
  const brief = makeMarkdown(assessed, true);
  assert.match(brief, /Warnings requiring review: 1\. Previously manually verified warnings: 1\. Access failures awaiting confirmation: 1/);
  assert.match(brief, /\| blocked \| 0 \| 1 \| 1 \| 2 \|/);
  const [actions, pending] = brief.split("## Access failures awaiting a second audit");
  assert.ok(!actions.includes(blocked.url));
  assert.ok(actions.includes(missing.url));
  assert.ok(pending.includes(blocked.url));
  assert.ok(!brief.includes(checked.url));
  assert.equal(makeSummary(assessed.results).blocked, 2);
  assert.equal(makeSummary(assessed.results).missing, 1);
});

test("reading local raw reports or workflow history never writes inputs and exposes malformed history", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bc-source-history-test-"));
  const path = join(directory, "history.json");
  const raw = JSON.stringify(audit([blocked], earlier));
  await writeFile(path, raw);
  assert.equal((await readAuditHistory(path)).state, "available");
  assert.equal(await readFile(path, "utf8"), raw);
  const wrapped = JSON.stringify(history(audit([blocked], earlier)));
  await writeFile(path, wrapped);
  assert.equal((await readAuditHistory(path)).state, "available");
  assert.equal(await readFile(path, "utf8"), wrapped);
  await writeFile(path, "invalid JSON");
  assert.equal((await readAuditHistory(path)).state, "unavailable");
  assert.equal((await readAuditHistory(join(directory, "absent.json"))).state, "unavailable");
  assert.equal((await readAuditHistory()).state, "none");
});

const currentRun: AuditWorkflowRun = { id: 12, head_branch: "main", status: "in_progress", created_at: later };
const run = (id: number, created_at = earlier): AuditWorkflowRun => ({ id, head_branch: "main", status: "completed", created_at });

test("history recovery selects the immediately preceding completed run without substituting older evidence", async () => {
  const readRuns: number[] = [];
  const reader: HistoryReader = {
    listRuns: async () => [run(5, "2026-10-10T15:00:00.000Z"), { ...run(13), created_at: "2026-10-13T15:00:00.000Z" }, currentRun, { ...run(14), head_branch: "other" }, run(11)],
    listArtifacts: async (id) => [{ name: `source-link-report-${id}`, expired: false }],
    readReport: async (id, name) => { readRuns.push(id); assert.equal(name, `source-link-report-${id}`); return audit([blocked], earlier); },
  };
  const recovered = await recoverAuditHistory(reader, currentRun);
  assert.equal(recovered.state, "available");
  assert.equal(recovered.runId, 11);
  assert.deepEqual(readRuns, [11]);
  const absent = await recoverAuditHistory({ ...reader, listArtifacts: async () => [] }, currentRun);
  assert.equal(absent.state, "unavailable");
  assert.equal(absent.runId, 11);
  assert.deepEqual(readRuns, [11], "Missing evidence must not cause an older run to be reused");
  const expired = await recoverAuditHistory({ ...reader, listArtifacts: async () => [{ name: "source-link-report-11", expired: true }] }, currentRun);
  assert.equal(expired.state, "unavailable");
});

test("failed prior audits and recovery errors stay visible instead of being skipped", async () => {
  const incomplete = audit([blocked], earlier);
  incomplete.coverage.complete = false;
  const reader: HistoryReader = {
    listRuns: async () => [run(10, "2026-10-10T15:00:00.000Z"), run(11)],
    listArtifacts: async (id) => [{ name: `source-link-report-${id}`, expired: false }],
    readReport: async (id) => { assert.equal(id, 11); return incomplete; },
  };
  const recovered = await recoverAuditHistory(reader, currentRun);
  assert.equal(assess(audit([blocked]), recovered).accessReviewSummary.previousAudit.state, "unavailable");
  const failed = await recoverAuditHistory({ ...reader, readReport: async () => { throw new Error("Download failed"); } }, currentRun);
  assert.equal(failed.state, "unavailable");
  assert.match(failed.reason, /Download failed/);
  const noRuns = await recoverAuditHistory({ ...reader, listRuns: async () => [] }, currentRun);
  assert.equal(noRuns.state, "none");
  const bounded = await recoverAuditHistory({ ...reader, listRuns: async () => Array.from({ length: 100 }, (_, index) => ({ ...run(index + 20), status: "queued" })) }, currentRun);
  assert.equal(bounded.state, "unavailable");
});

test("history restore workflow command starts in the project's module mode and records unavailable context offline", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bc-source-history-cli-test-"));
  const path = join(directory, "cache", "history.json");
  const env: NodeJS.ProcessEnv = { ...process.env, SOURCE_LINK_HISTORY_FILE: path };
  delete env.GITHUB_REPOSITORY;
  delete env.GITHUB_RUN_ID;
  delete env.GH_TOKEN;
  const execute = promisify(execFile);
  const { stdout, stderr } = await execute(process.execPath, [
    join(process.cwd(), "node_modules/tsx/dist/cli.mjs"), "scripts/restore-source-link-history.ts",
  ], { cwd: process.cwd(), env, timeout: 10_000 });
  assert.equal(stderr, "");
  assert.match(stdout, /Previous audit history: unavailable/);
  const restored = await readAuditHistory(path);
  assert.equal(restored.state, "unavailable");
  assert.match(restored.reason, /Missing GitHub workflow context/);
});
