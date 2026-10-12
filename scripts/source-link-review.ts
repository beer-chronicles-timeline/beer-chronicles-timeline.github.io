import { readFile } from "node:fs/promises";
import type { LinkResult, LinkStatus } from "./source-link-audit.ts";

const reviewableStatuses = new Set<LinkStatus>([
  "needs-review", "blocked", "rate-limited", "transient-error", "network-error",
]);
const maxReviewDays = 180;

export type ReviewFinding = Pick<LinkResult, "status" | "httpStatus" | "finalUrl" | "detail" | "fragmentStatus">;
export type ManualLinkReview = {
  url: string;
  reviewedOn: string;
  reviewAfter: string;
  reviewedBy: string;
  note: string;
  expectedFinding: ReviewFinding;
};
export type ReviewRegister = { schemaVersion: 1; reviews: ManualLinkReview[] };
export type ReviewAnnotation = Omit<ManualLinkReview, "url" | "expectedFinding"> & {
  state: "acknowledged" | "expired" | "changed" | "not-needed";
  reason: string;
};
export type ReviewSummary = {
  registeredUrls: number;
  presentUrls: number;
  acknowledgedWarnings: number;
  warningsRequiringReview: number;
  expiredWarnings: number;
  changedWarnings: number;
};

export function isWarning(result: LinkResult): boolean {
  return result.status !== "working" && result.status !== "redirected";
}

export function requiresReview(result: LinkResult): boolean {
  return isWarning(result) && !isAcknowledged(result);
}

export function isAcknowledged(result: LinkResult): boolean {
  return reviewableStatuses.has(result.status) && result.manualReview?.state === "acknowledged";
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function date(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Review dates must use YYYY-MM-DD.");
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error(`Invalid review date: ${value}`);
  return timestamp;
}

function validateUrl(value: unknown): void {
  if (typeof value !== "string") throw new Error("Review URLs must be strings.");
  const url = new URL(value);
  // Published links can omit the root slash. Preserve their exact audit key.
  const matchesRecordedUrl = url.href === value || (url.pathname === "/" && url.href === `${value}/`);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || !matchesRecordedUrl) {
    throw new Error(`Invalid or non-canonical review URL: ${value}`);
  }
}

export function validateReviewRegister(value: unknown): ReviewRegister {
  if (!object(value) || value.schemaVersion !== 1 || !Array.isArray(value.reviews)) throw new Error("Invalid manual link-review register.");
  const urls = new Set<string>();
  for (const review of value.reviews) {
    if (!object(review)) throw new Error("Invalid manual link-review record.");
    validateUrl(review.url);
    if (urls.has(review.url as string)) throw new Error(`Duplicate manual review: ${review.url}`);
    urls.add(review.url as string);
    const reviewed = date(review.reviewedOn), expires = date(review.reviewAfter);
    if (expires <= reviewed || expires - reviewed > maxReviewDays * 86_400_000) throw new Error(`Manual reviews must expire within ${maxReviewDays} days: ${review.url}`);
    if ([review.reviewedBy, review.note].some((text) => typeof text !== "string" || !text.trim())) throw new Error("Manual reviews require a reviewer and note.");
    const finding = review.expectedFinding;
    if (!object(finding) || !reviewableStatuses.has(finding.status as LinkStatus) ||
        finding.httpStatus === 404 || finding.httpStatus === 410 ||
        !(finding.httpStatus === null || (Number.isInteger(finding.httpStatus) && (finding.httpStatus as number) >= 100 && (finding.httpStatus as number) <= 599)) ||
        !(finding.detail === null || typeof finding.detail === "string") ||
        !["not-applicable", "valid", "missing", "unverified"].includes(finding.fragmentStatus as string)) {
      throw new Error(`Invalid expected warning; missing links/fragments cannot be acknowledged: ${review.url}`);
    }
    if (finding.finalUrl !== null) validateUrl(finding.finalUrl);
  }
  return value as unknown as ReviewRegister;
}

export async function readReviewRegister(path: string | URL): Promise<ReviewRegister> {
  return validateReviewRegister(JSON.parse(await readFile(path, "utf8")));
}

export function findingForReview(result: LinkResult): ReviewFinding {
  return {
    status: result.status, httpStatus: result.httpStatus, finalUrl: result.finalUrl,
    detail: result.detail, fragmentStatus: result.fragmentStatus,
  };
}

function stableDestination(finding: ReviewFinding, sourceUrl: string): string | null {
  if (finding.status !== "rate-limited" || finding.httpStatus !== 429 || !finding.finalUrl) return finding.finalUrl;
  const destination = new URL(finding.finalUrl);
  if (destination.origin === "https://www.google.com" && destination.pathname === "/sorry/index" &&
      !destination.username && !destination.password &&
      destination.searchParams.getAll("continue").length === 1 && destination.searchParams.get("continue") === sourceUrl &&
      destination.searchParams.getAll("q").length === 1) {
    // This Google anti-bot token changes per request. Keep the source target
    // and every other destination component so real changes still reappear.
    destination.searchParams.delete("q");
    return destination.href;
  }
  return finding.finalUrl;
}

function signature(finding: ReviewFinding, sourceUrl: string): string {
  // OpenSSL can put a process-specific memory address before an error code.
  // Keep the actual error reason while ignoring that incidental address.
  return JSON.stringify({
    status: finding.status, httpStatus: finding.httpStatus, finalUrl: stableDestination(finding, sourceUrl),
    fragmentStatus: finding.fragmentStatus,
    detail: finding.detail?.replace(/[a-f\d]{12,}(?=:error:)/gi, "<runtime-address>") ?? null,
  });
}

export function applyManualReviews(results: LinkResult[], register: ReviewRegister, generatedAt: string) {
  validateReviewRegister(register);
  const checkedAt = Date.parse(generatedAt);
  if (!Number.isFinite(checkedAt)) throw new Error("Invalid audit timestamp for manual review assessment.");
  const byUrl = new Map(register.reviews.map((review) => [review.url, review]));
  const annotated = results.map((result): LinkResult => {
    const review = byUrl.get(result.url);
    if (!review) return result;
    const { reviewedOn, reviewAfter, reviewedBy, note } = review;
    let state: ReviewAnnotation["state"], reason: string;
    if (!isWarning(result)) {
      state = "not-needed";
      reason = "The current automated check has no warning.";
    } else if (checkedAt < date(reviewedOn)) {
      state = "changed";
      reason = "The manual review is newer than this audit; it cannot acknowledge an earlier result.";
    } else if (checkedAt >= date(reviewAfter)) {
      state = "expired";
      reason = "The manual verification has expired; check this URL again.";
    } else if (reviewableStatuses.has(result.status) && signature(findingForReview(result), result.url) === signature(review.expectedFinding, review.url)) {
      state = "acknowledged";
      reason = "The warning matches the finding already checked manually.";
    } else {
      state = "changed";
      reason = "The status, HTTP response, destination, fragment finding, or warning reason changed; check this URL again.";
    }
    return { ...result, manualReview: { state, reason, reviewedOn, reviewAfter, reviewedBy, note } };
  });
  const reviewSummary: ReviewSummary = {
    registeredUrls: register.reviews.length,
    presentUrls: annotated.filter((result) => result.manualReview).length,
    acknowledgedWarnings: annotated.filter(isAcknowledged).length,
    warningsRequiringReview: annotated.filter(requiresReview).length,
    expiredWarnings: annotated.filter((result) => result.manualReview?.state === "expired").length,
    changedWarnings: annotated.filter((result) => result.manualReview?.state === "changed").length,
  };
  return { results: annotated, reviewSummary };
}
