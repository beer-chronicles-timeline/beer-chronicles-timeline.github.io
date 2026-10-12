import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { LinkResult } from "../scripts/source-link-audit.ts";
import type { PublishedAudit } from "../scripts/site-link-audit.ts";
import { makeMarkdown, makeSummary } from "../scripts/source-link-report.ts";
import { applyManualReviews, findingForReview, readReviewRegister, requiresReview, validateReviewRegister, type ReviewRegister } from "../scripts/source-link-review.ts";

const timestamp = "2026-10-11T15:00:00.000Z";
const blocked: LinkResult = {
  url: "https://source.example/article", references: [{ eventId: "fixture", eventTitle: "Synthetic entry" }],
  status: "blocked", httpStatus: 403, finalUrl: null, detail: null,
  attempts: 1, contentType: "text/html", bodyTruncated: false, fragmentStatus: "not-applicable",
};
const register = (result = blocked): ReviewRegister => ({ schemaVersion: 1, reviews: [{
  url: result.url, reviewedOn: "2026-10-11", reviewAfter: "2027-04-09",
  reviewedBy: "fixture reviewer", note: "Manually confirmed by the fixture reviewer.", expectedFinding: findingForReview(result),
}] });

function audit(results: LinkResult[]): PublishedAudit {
  return {
    schemaVersion: 2, generatedAt: timestamp, siteUrl: "https://beer.example", dataUrl: "https://beer.example/timeline-data.json", sitemapUrl: "https://beer.example/sitemap.xml",
    coverage: {
      complete: true, errors: [], publication: null, eventCount: 1, eventsWithSourceUrls: 1,
      sourceUrls: results.length, sourceReferences: results.length, sitemapPages: 1, discoveredPages: 1,
      crawledPages: 1, failedPages: [], discoveredUrls: results.length, checkedUrls: results.length,
      checkedDocuments: results.length, httpRequests: results.length, limited: false, inventoryFindings: [], skippedSchemes: {},
    }, results,
  };
}

test("acknowledges only the exact previously reviewed warning without rewriting raw findings or input", () => {
  const raw = [structuredClone(blocked)];
  const before = structuredClone(raw);
  const reviewed = register();
  const beforeRegister = structuredClone(reviewed);
  const assessment = applyManualReviews(raw, reviewed, timestamp);
  assert.equal(assessment.results[0].manualReview?.state, "acknowledged");
  assert.equal(requiresReview(assessment.results[0]), false);
  assert.equal(makeSummary(assessment.results).blocked, 1);
  assert.equal(assessment.reviewSummary.acknowledgedWarnings, 1);
  assert.equal(assessment.reviewSummary.warningsRequiringReview, 0);
  assert.deepEqual(raw, before);
  assert.deepEqual(reviewed, beforeRegister);
  const { manualReview, ...observed } = assessment.results[0];
  assert.ok(manualReview);
  assert.deepEqual(observed, blocked);
});

test("a later 404, 410, or missing fragment always requires review", () => {
  for (const changed of [
    { status: "missing", httpStatus: 404 }, { status: "missing", httpStatus: 410 },
    { status: "missing-fragment", httpStatus: 200, fragmentStatus: "missing" },
  ] as const) {
    const result = applyManualReviews([{ ...blocked, ...changed }], register(), timestamp).results[0];
    assert.equal(result.manualReview?.state, "changed");
    assert.equal(result.status, changed.status);
    assert.equal(requiresReview(result), true);
    const incorrectlyAnnotated = { ...result, manualReview: { ...result.manualReview!, state: "acknowledged" as const } };
    assert.equal(requiresReview(incorrectlyAnnotated), true, "Confirmed failures cannot be hidden even by a stale or incorrect annotation");
    assert.ok(makeMarkdown(audit([incorrectlyAnnotated]), true).includes(result.url));
  }
});

test("changed HTTP response, redirect destination, fragment result, or warning reason returns to the queue", () => {
  const challenged: LinkResult = { ...blocked, status: "needs-review", httpStatus: 200, detail: "Automated-client challenge." };
  for (const change of [
    { httpStatus: 402 }, { finalUrl: "https://source.example/" },
    { detail: "Specific page redirects to a homepage." }, { fragmentStatus: "missing" },
  ] as const) {
    const result = applyManualReviews([{ ...challenged, ...change }], register(challenged), timestamp).results[0];
    assert.equal(result.manualReview?.state, "changed");
    assert.equal(requiresReview(result), true);
  }
});

test("manual confirmations expire at the boundary and cannot acknowledge audits before the review", () => {
  for (const checkedAt of ["2027-04-09T00:00:00.000Z", "2027-04-10T12:00:00.000Z"]) {
    const result = applyManualReviews([blocked], register(), checkedAt);
    assert.equal(result.results[0].manualReview?.state, "expired");
    assert.equal(result.reviewSummary.expiredWarnings, 1);
    assert.equal(requiresReview(result.results[0]), true);
  }
  const earlier = applyManualReviews([blocked], register(), "2026-10-10T23:59:59.000Z");
  assert.equal(earlier.results[0].manualReview?.state, "changed");
  assert.equal(requiresReview(earlier.results[0]), true);
  assert.throws(() => applyManualReviews([blocked], register(), "invalid"));
});

test("recovered URLs need no acknowledgement and new unregistered warnings stay visible", () => {
  for (const status of ["working", "redirected"] as const) {
    const recovered = applyManualReviews([{ ...blocked, status, httpStatus: 200 }], register(), timestamp);
    assert.equal(recovered.results[0].manualReview?.state, "not-needed");
    assert.equal(recovered.reviewSummary.acknowledgedWarnings, 0);
    assert.equal(requiresReview(recovered.results[0]), false);
  }
  const unknown = applyManualReviews([{ ...blocked, url: "https://source.example/new" }], register(), timestamp);
  assert.equal(unknown.results[0].manualReview, undefined);
  assert.equal(unknown.reviewSummary.warningsRequiringReview, 1);
});

test("rejects permanent ignores, invalid dates, duplicates, malformed URLs and acknowledgement of missing targets", () => {
  for (const change of [
    { reviewAfter: "2027-04-10" }, { reviewAfter: "2026-10-11" }, { reviewedOn: "2026-02-30" },
    { note: "" }, { url: "https://user:password@source.example/" }, { url: "mailto:fixture@example.org" },
    { expectedFinding: { ...findingForReview(blocked), status: "missing" } },
    { expectedFinding: { ...findingForReview(blocked), status: "missing-fragment" } },
    { expectedFinding: { ...findingForReview(blocked), httpStatus: 404 } },
    { expectedFinding: { ...findingForReview(blocked), finalUrl: "javascript:alert(1)" } },
  ]) {
    assert.throws(() => validateReviewRegister({ schemaVersion: 1, reviews: [{ ...register().reviews[0], ...change }] }));
  }
  assert.throws(() => validateReviewRegister({ schemaVersion: 1, reviews: [register().reviews[0], register().reviews[0]] }), /Duplicate/);
});

test("accepts audited root URLs with or without the slash while preserving their exact keys", () => {
  const bare = { ...blocked, url: "https://source.example" };
  const slash = { ...blocked, url: "https://source.example/" };
  const reviews: ReviewRegister = { schemaVersion: 1, reviews: [register(bare).reviews[0], register(slash).reviews[0]] };
  const assessed = applyManualReviews([bare, slash], reviews, timestamp);
  assert.equal(assessed.reviewSummary.acknowledgedWarnings, 2);
  assert.deepEqual(assessed.results.map((result) => result.url), [bare.url, slash.url]);
  for (const url of [" https://source.example", "https://source.example:443", "https://SOURCE.EXAMPLE", "https://user:password@source.example"]) {
    assert.throws(() => validateReviewRegister({ schemaVersion: 1, reviews: [{ ...register().reviews[0], url }] }));
  }
});

test("matches independent of JSON key order and ignores only incidental OpenSSL memory addresses", () => {
  const expected = register();
  expected.reviews[0].expectedFinding = { detail: null, fragmentStatus: "not-applicable", finalUrl: null, httpStatus: 403, status: "blocked" };
  assert.equal(applyManualReviews([blocked], expected, timestamp).reviewSummary.acknowledgedWarnings, 1);
  const original: LinkResult = { ...blocked, status: "network-error", httpStatus: null, detail: "fetch failed (40EDE77A317F0000:error:0A000438:TLS internal error)" };
  const repeated = { ...original, detail: "fetch failed (1234567890ABCDEF:error:0A000438:TLS internal error)" };
  assert.equal(applyManualReviews([repeated], register(original), timestamp).reviewSummary.acknowledgedWarnings, 1);
  const different = { ...original, detail: "fetch failed (certificate has expired)" };
  assert.equal(applyManualReviews([different], register(original), timestamp).reviewSummary.changedWarnings, 1);
});

test("a changing Google 429 challenge token does not repeat a confirmed warning or alter raw evidence", () => {
  const challenge = (token: string) => `https://www.google.com/sorry/index?continue=${encodeURIComponent(blocked.url)}&q=${token}`;
  const original: LinkResult = { ...blocked, status: "rate-limited", httpStatus: 429, finalUrl: challenge("first-token") };
  const repeated = { ...original, finalUrl: challenge("second-token") };
  const reviews = register(original);
  const savedReviews = structuredClone(reviews);
  const assessment = applyManualReviews([repeated], reviews, timestamp);
  assert.equal(assessment.results[0].manualReview?.state, "acknowledged");
  assert.equal(requiresReview(assessment.results[0]), false);
  assert.equal(assessment.results[0].finalUrl, repeated.finalUrl, "The observed destination must remain intact in the report");
  assert.equal(makeSummary(assessment.results)["rate-limited"], 1);
  assert.deepEqual(reviews, savedReviews);
});

test("Google challenge matching retains real destination, response, and fragment changes", () => {
  const destination = `https://www.google.com/sorry/index?continue=${encodeURIComponent(blocked.url)}&q=first-token`;
  const original: LinkResult = { ...blocked, status: "rate-limited", httpStatus: 429, finalUrl: destination };
  for (const change of [
    { finalUrl: destination.replace("www.google.com", "source.example") },
    { finalUrl: destination.replace("https:", "http:") },
    { finalUrl: destination.replace("/sorry/index", "/different") },
    { finalUrl: destination.replace(encodeURIComponent(blocked.url), encodeURIComponent("https://source.example/other")) },
    { finalUrl: destination + "&new=parameter" },
    { finalUrl: destination + "#changed" },
    { finalUrl: destination + "&q=second-token" },
    { httpStatus: 403 }, { status: "missing", httpStatus: 404 },
    { fragmentStatus: "missing" }, { detail: "Different error reason" },
  ] as const) {
    const result = applyManualReviews([{ ...original, ...change }], register(original), timestamp).results[0];
    assert.equal(result.manualReview?.state, "changed");
    assert.equal(requiresReview(result), true);
  }
  const incomplete = { ...original, finalUrl: "https://www.google.com/sorry/index?q=first-token" };
  assert.equal(applyManualReviews([{ ...incomplete, finalUrl: incomplete.finalUrl.replace("first-token", "second-token") }], register(incomplete), timestamp).reviewSummary.changedWarnings, 1);
  const ordinary: LinkResult = { ...original, status: "needs-review", httpStatus: 200 };
  assert.equal(applyManualReviews([{ ...ordinary, finalUrl: destination.replace("first-token", "second-token") }], register(ordinary), timestamp).reviewSummary.changedWarnings, 1);
});

test("GitHub summary omits matching warnings from action lists but retains observed counts and complete evidence", () => {
  const reviewed = applyManualReviews([blocked, { ...blocked, url: "https://source.example/new" }], register(), timestamp);
  const report = { ...audit(reviewed.results), reviewSummary: reviewed.reviewSummary };
  const brief = makeMarkdown(report, true);
  assert.match(brief, /Warnings requiring review: 1\. Previously manually verified matching warnings: 1/);
  assert.match(brief, /\| blocked \| 1 \| 1 \| 2 \|/);
  assert.ok(!brief.includes(blocked.url));
  assert.ok(brief.includes("https://source.example/new"));
  const full = makeMarkdown(report);
  const [actions, confirmations] = full.split("## Previously manually verified matching warnings");
  assert.ok(!actions.includes(blocked.url));
  assert.ok(confirmations.includes(blocked.url));
  assert.match(full, /user-confirmed current state/);
  assert.equal(makeSummary(report.results).blocked, 2);
});

test("committed register is valid and reads do not write or renew its reviews", async () => {
  const path = new URL("../scripts/source-link-review-register.json", import.meta.url);
  const before = await readFile(path, "utf8");
  const reviewed = await readReviewRegister(path);
  assert.ok(reviewed.reviews.length);
  assert.ok(reviewed.reviews.every((review) => review.note.includes("User-confirmed current state")));
  applyManualReviews([blocked], reviewed, timestamp);
  assert.equal(await readFile(path, "utf8"), before);
});
