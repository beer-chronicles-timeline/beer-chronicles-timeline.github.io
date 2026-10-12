import { readFile } from "node:fs/promises";
import { validatePublication, type PublishedAudit } from "./site-link-audit.ts";
import type { LinkResult, LinkStatus } from "./source-link-audit.ts";
import {
  destinationChanged, isAccessFailure, isAcknowledged, isAwaitingConfirmation, isWarning,
} from "./source-link-review.ts";

export type AuditHistory = {
  state: "available" | "none" | "unavailable";
  reason: string;
  runId?: number;
  report?: unknown;
};
export type AccessReviewSummary = {
  previousAudit: Omit<AuditHistory, "report"> & { generatedAt: string | null };
  awaitingConfirmation: number;
  persistentWarnings: number;
  immediateWarnings: number;
};
const statuses = new Set<LinkStatus>([
  "missing", "missing-fragment", "needs-review", "blocked", "rate-limited",
  "transient-error", "network-error", "redirected", "working",
]);

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function httpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

export function validatePreviousAudit(value: unknown, current: PublishedAudit): PublishedAudit {
  if (!Number.isFinite(Date.parse(current.generatedAt))) throw new Error("Invalid current audit timestamp.");
  if (!object(value) || value.schemaVersion !== 2 || typeof value.generatedAt !== "string" ||
      !Number.isFinite(Date.parse(value.generatedAt)) || Date.parse(value.generatedAt) >= Date.parse(current.generatedAt) ||
      value.siteUrl !== current.siteUrl || value.dataUrl !== current.dataUrl || value.sitemapUrl !== current.sitemapUrl ||
      !object(value.coverage) || !Array.isArray(value.results)) {
    throw new Error("Previous report must be an earlier audit of the same public site and inputs.");
  }
  const coverage = value.coverage;
  const empty = (items: unknown) => Array.isArray(items) && items.length === 0;
  for (const field of ["eventCount", "eventsWithSourceUrls", "sourceUrls", "sourceReferences", "sitemapPages",
    "discoveredPages", "crawledPages", "discoveredUrls", "checkedUrls", "checkedDocuments", "httpRequests"]) {
    if (!Number.isSafeInteger(coverage[field]) || (coverage[field] as number) < 0) {
      throw new Error("Previous report contains invalid coverage counts.");
    }
  }
  if (coverage.complete !== true || coverage.limited !== false || value.limited === true ||
      !empty(coverage.errors) || !empty(coverage.failedPages) || !empty(coverage.inventoryFindings) ||
      coverage.checkedUrls !== value.results.length || coverage.discoveredUrls !== value.results.length ||
      coverage.crawledPages !== coverage.discoveredPages || !Number.isInteger(coverage.eventCount) ||
      (coverage.eventCount as number) < 1) {
    throw new Error("Previous report has incomplete or inconsistent coverage.");
  }
  const publication = validatePublication(coverage.publication);
  if (publication.eventCount !== coverage.eventCount) throw new Error("Previous publication count differs from its audit coverage.");
  if (Date.parse(publication.generatedAt) > Date.parse(value.generatedAt)) throw new Error("Previous audit predates its publication.");
  const urls = new Set<string>();
  for (const result of value.results) {
    if (!object(result) || !httpUrl(result.url) || urls.has(result.url) ||
        !statuses.has(result.status as LinkStatus) ||
        !(result.httpStatus === null || (Number.isInteger(result.httpStatus) && (result.httpStatus as number) >= 100 && (result.httpStatus as number) <= 599)) ||
        !(result.finalUrl === null || httpUrl(result.finalUrl)) ||
        !(result.detail === null || typeof result.detail === "string") ||
        !["not-applicable", "valid", "missing", "unverified"].includes(result.fragmentStatus as string)) {
      throw new Error("Previous report contains malformed or duplicate URL findings.");
    }
    urls.add(result.url);
  }
  return value as unknown as PublishedAudit;
}

export async function readAuditHistory(path?: string): Promise<AuditHistory> {
  if (!path) return { state: "none", reason: "No previous report supplied; new access failures await a second complete audit." };
  try {
    const value: unknown = JSON.parse(await readFile(path, "utf8"));
    if (object(value) && value.schemaVersion === 2) {
      return { state: "available", reason: "A previous audit report was supplied locally.", report: value };
    }
    if (!object(value) || !["available", "none", "unavailable"].includes(value.state as string) ||
        typeof value.reason !== "string" || !value.reason.trim() ||
        (value.runId !== undefined && (!Number.isSafeInteger(value.runId) || (value.runId as number) < 1)) ||
        (value.state === "available" && !value.report)) throw new Error("Invalid audit history input.");
    return value as unknown as AuditHistory;
  } catch (error) {
    return { state: "unavailable", reason: `Previous report could not be read: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export function applyAccessHistory(audit: PublishedAudit, history: AuditHistory) {
  let previous: PublishedAudit | null = null;
  let effective = history;
  if (history.state === "available") {
    try { previous = validatePreviousAudit(history.report, audit); }
    catch (error) {
      effective = { state: "unavailable", runId: history.runId,
        reason: `Previous report rejected: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  const byUrl = new Map(previous?.results.map((result) => [result.url, result]) ?? []);
  const results = audit.results.map((observed): LinkResult => {
    const result = { ...observed };
    delete result.accessCheck;
    if (!isAccessFailure(result) || isAcknowledged(result)) return result;
    const prior = byUrl.get(result.url);
    let state: "pending" | "persistent" | "immediate", reason: string;
    if (!audit.coverage.complete || audit.coverage.limited) {
      state = "immediate";
      reason = "The current audit is incomplete; it cannot establish or defer a consecutive-run finding.";
    } else if (result.manualReview) {
      state = "immediate";
      reason = "The manual confirmation expired or a substantive finding changed; review is required now.";
    } else if (effective.state === "unavailable") {
      state = "immediate";
      reason = "Prior-run evidence is unavailable or unusable; review is required rather than silently deferring the warning.";
    } else if (prior && (destinationChanged(result, prior, result.url) || result.fragmentStatus !== prior.fragmentStatus)) {
      state = "immediate";
      reason = "A new destination or fragment finding was observed; review is required now.";
    } else if (prior && isWarning(prior) && !isAccessFailure(prior)) {
      state = "immediate";
      reason = "The previous audit found a missing target or content issue; an access failure does not clear that finding.";
    } else if (prior && isAccessFailure(prior)) {
      state = "persistent";
      reason = "An access failure occurred in two consecutive complete audits; manual review is now required.";
    } else {
      state = "pending";
      reason = "First observed access failure; awaiting recurrence in the next complete audit before requesting manual review.";
    }
    result.accessCheck = { state, reason, previousAuditGeneratedAt: previous?.generatedAt ?? null };
    return result;
  });
  const accessReviewSummary: AccessReviewSummary = {
    previousAudit: { state: effective.state, reason: effective.reason, runId: effective.runId, generatedAt: previous?.generatedAt ?? null },
    awaitingConfirmation: results.filter(isAwaitingConfirmation).length,
    persistentWarnings: results.filter((result) => result.accessCheck?.state === "persistent").length,
    immediateWarnings: results.filter((result) => result.accessCheck?.state === "immediate").length,
  };
  return { results, accessReviewSummary };
}

export type AuditWorkflowRun = { id: number; head_branch: string; status: string; created_at: string };
export type AuditArtifact = { name: string; expired: boolean };
export type HistoryReader = {
  listRuns: () => Promise<AuditWorkflowRun[]>;
  listArtifacts: (runId: number) => Promise<AuditArtifact[]>;
  readReport: (runId: number, artifactName: string) => Promise<unknown>;
};

export async function recoverAuditHistory(reader: HistoryReader, current: AuditWorkflowRun): Promise<AuditHistory> {
  try {
    const createdAt = Date.parse(current.created_at);
    if (!Number.isSafeInteger(current.id) || !Number.isFinite(createdAt)) throw new Error("Invalid current workflow identity.");
    const runs = await reader.listRuns();
    const previous = runs.filter((run) => run.id !== current.id && run.head_branch === current.head_branch &&
      run.status === "completed" && Date.parse(run.created_at) < createdAt)
      .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at) || right.id - left.id)[0];
    if (!previous) {
      if (runs.length >= 100) return { state: "unavailable", reason: "No prior completed audit was found within the latest 100 runs; history remains unresolved." };
      return { state: "none", reason: "No earlier completed audit run exists; new access failures await a second complete audit." };
    }
    const expected = `source-link-report-${previous.id}`;
    const artifact = (await reader.listArtifacts(previous.id)).find((item) => item.name === expected && !item.expired);
    if (!artifact) return { state: "unavailable", runId: previous.id,
      reason: "The immediately preceding audit has no retained report; older runs are not substituted." };
    return { state: "available", runId: previous.id, reason: "Recovered the immediately preceding completed audit report.",
      report: await reader.readReport(previous.id, artifact.name) };
  } catch (error) {
    return { state: "unavailable", reason: `Audit history recovery failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}
