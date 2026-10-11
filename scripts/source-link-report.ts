import type { LinkResult, LinkStatus } from "./source-link-audit.ts";
import type { PublishedAudit } from "./site-link-audit.ts";
import { isAcknowledged, requiresReview } from "./source-link-review.ts";

export const statusOrder: LinkStatus[] = [
  "missing", "missing-fragment", "needs-review", "blocked", "rate-limited",
  "transient-error", "network-error", "redirected", "working",
];

export function makeSummary(results: LinkResult[]): Record<LinkStatus, number> {
  return Object.fromEntries(statusOrder.map((status) => [status, results.filter((result) => result.status === status).length])) as Record<LinkStatus, number>;
}

function cell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/[\r\n]/g, " ").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function referencedBy(result: LinkResult, limit: number): string {
  const references = [
    ...result.references.map((reference) => `Entry: ${reference.eventTitle}`),
    ...(result.pageReferences ?? []).map((reference) => `Page: ${reference.pageUrl}`),
  ];
  return references.slice(0, limit).join("; ") + (references.length > limit ? `; +${references.length - limit} more (see JSON)` : "");
}

function resultRow(result: LinkResult, brief: boolean): string {
  const url = result.finalUrl ? `${result.url} → ${result.finalUrl}` : result.url;
  const review = result.manualReview;
  const evidence = [result.detail, review && review.state !== "not-needed" ? `${review.reason} Reviewed ${review.reviewedOn}; review again ${review.reviewAfter}.` : null].filter(Boolean).join(" ") || "—";
  return `| ${cell(brief ? url.slice(0, 2000) : url)} | ${result.httpStatus ?? "—"} | ${result.attempts} | ${cell(evidence)} | ${cell(referencedBy(result, brief ? 2 : 20))} |`;
}

export function makeMarkdown(audit: PublishedAudit, brief = false): string {
  const { coverage, results } = audit;
  const summary = makeSummary(results);
  const sourceSummary = makeSummary(results.filter((result) => result.references.length > 0));
  const pageSummary = makeSummary(results.filter((result) => result.pageReferences?.length));
  const attentionSummary = makeSummary(results.filter(requiresReview));
  const acknowledgedSummary = makeSummary(results.filter(isAcknowledged));
  const acknowledged = results.filter(isAcknowledged);
  const lines = [
    "# Beer Chronicles source and site link audit", "", `Generated: ${audit.generatedAt}`, "",
    `**Coverage: ${coverage.complete ? "COMPLETE" : "INCOMPLETE — this is not an all-clear"}.**`, "",
    "This audit is read-only. It reads public published files and produces reports; it never repairs links, changes editorial data, accesses Supabase, or edits GitHub issues.", "",
    "Findings are advisory. Access blocks and temporary failures do not prove a link is broken. Successful HTTP/content checks do not establish that a source supports a historical claim.", "",
    `**Warnings requiring review: ${results.filter(requiresReview).length}. Previously manually verified matching warnings: ${acknowledged.length}.**`, "",
    "Every URL is still checked. The human-maintained review register is read-only input; this workflow never writes or renews it. Matching manual verifications expire within 180 days. The missing and missing-fragment categories, changed responses or destinations, changed warning reasons, and expired reviews stay in the review queue. Manual confirmations are user-confirmed current state, not independently verified by the checker.", "",
    "## Coverage", "",
    `- Publication: ${coverage.publication ? `${coverage.publication.commit}, generated ${coverage.publication.generatedAt}` : "not verified"}`,
    `- Timeline: ${coverage.eventCount} published entries; ${coverage.eventsWithSourceUrls} have detected source URLs.`,
    `- Sources: ${coverage.sourceUrls} unique URLs and ${coverage.sourceReferences} entry–URL references.`,
    `- Pages: ${coverage.sitemapPages} sitemap pages; ${coverage.crawledPages}/${coverage.discoveredPages} discovered pages crawled; ${coverage.failedPages.length} could not be fully crawled.`,
    `- Links: ${coverage.checkedUrls}/${coverage.discoveredUrls} discovered URLs checked; ${coverage.checkedDocuments} distinct HTTP documents; ${coverage.httpRequests} HTTP requests including retries and redirects.`,
    `- Limits applied: ${coverage.limited ? "yes — incomplete audit" : "no"}.`,
    `- Invalid links: ${coverage.inventoryFindings.length}. Non-HTTP schemes skipped: ${JSON.stringify(coverage.skippedSchemes)}.`, "",
    "Scope: source fields plus a/area hyperlinks in the public HTML, seeded from the sitemap and followed through internal pages. HTTP documents are deduplicated; source and page references are retained. Internal query variants share the static document check. Cloudflare-protected email links are recognized as mailto links when the published HTML includes its decoder. JavaScript-only links, interactive query behavior, form submissions, and non-HTTP schemes are not executed. PDF/text fragments and truncated external HTML may require manual review.", "",
    "## Results", "", "| Status | Requires review | Manually verified | All URLs | Citation URLs | Page/sitemap URLs |", "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...statusOrder.map((status) => `| ${status} | ${attentionSummary[status]} | ${acknowledgedSummary[status]} | ${summary[status]} | ${sourceSummary[status]} | ${pageSummary[status]} |`), "",
    "Citation and page columns can overlap when the same URL appears in both. “Working” means no issue was detected by these checks; it is not a content endorsement.", "",
  ];
  if (coverage.errors.length) {
    lines.push("## Coverage errors", "", ...coverage.errors.slice(0, brief ? 20 : Infinity).map((error) => `- ${cell(error)}`), "");
    if (brief && coverage.errors.length > 20) lines.push(`Additional ${coverage.errors.length - 20} errors are in the complete report.`, "");
  }
  if (coverage.inventoryFindings.length) {
    lines.push("## Invalid hyperlinks requiring review", "", "| URL | Referenced by | Reason |", "| --- | --- | --- |");
    for (const finding of coverage.inventoryFindings.slice(0, brief ? 10 : Infinity)) lines.push(`| ${cell(finding.url)} | ${cell(finding.referencedBy)} | ${cell(finding.detail)} |`);
    lines.push("");
  }
  const sections: [string, LinkStatus[]][] = [
    ["Missing URLs and static HTML fragment targets", ["missing", "missing-fragment"]],
    ["Content, destination, and other findings requiring review", ["needs-review"]],
    ["Unresolved access and temporary failures", ["blocked", "rate-limited", "transient-error", "network-error"]],
    ["Redirects for planned maintenance", ["redirected"]],
  ];
  for (const [heading, statuses] of sections) {
    const matches = results.filter((result) => statuses.includes(result.status) && !isAcknowledged(result));
    lines.push(`## ${heading}`, "", `${matches.length} URL(s).`, "");
    for (const status of statuses) {
      const group = matches.filter((result) => result.status === status);
      if (!group.length) continue;
      lines.push(`### ${status}: ${group.length}`, "", "| URL / destination | HTTP | Attempts | Evidence / uncertainty | Referenced by |", "| --- | ---: | ---: | --- | --- |");
      lines.push(...group.slice(0, brief ? 10 : Infinity).map((result) => resultRow(result, brief)), "");
      if (brief && group.length > 10) lines.push(`Showing 10 of ${group.length}; download the complete report for every URL and reference.`, "");
    }
  }
  lines.push("## Previously manually verified matching warnings", "", `${acknowledged.length} URL(s). These retain their observed status in the counts and JSON, but do not recur in the action lists while their review remains valid.`, "");
  if (!brief && acknowledged.length) {
    lines.push("<details>", "<summary>Show manually verified warnings</summary>", "",
      "| URL / destination | HTTP | Attempts | Evidence / uncertainty | Referenced by |", "| --- | ---: | ---: | --- | --- |");
    lines.push(...acknowledged.map((result) => resultRow(result, false)), "", "</details>", "");
  }
  lines.push("The uploaded JSON contains all results and all referencing pages/entries. The Markdown report lists every non-working or redirected URL.", "");
  return lines.join("\n");
}
