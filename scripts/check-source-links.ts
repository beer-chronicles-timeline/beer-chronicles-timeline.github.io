import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { auditPublishedSite } from "./site-link-audit.ts";
import { makeMarkdown, makeSummary } from "./source-link-report.ts";

async function main() {
  const outputDir = process.env.SOURCE_LINK_REPORT_DIR ?? "artifacts/source-link-report";
  const audit = await auditPublishedSite({
    siteUrl: process.env.SOURCE_LINK_SITE_URL ?? "https://beer-chronicles.org",
    dataUrl: process.env.SOURCE_LINK_DATA_URL,
    sitemapUrl: process.env.SOURCE_LINK_SITEMAP_URL,
    concurrency: Number(process.env.SOURCE_LINK_CONCURRENCY ?? 8),
    timeoutMs: Number(process.env.SOURCE_LINK_TIMEOUT_MS ?? 15_000),
    retries: Number(process.env.SOURCE_LINK_RETRIES ?? 2),
    minHostIntervalMs: Number(process.env.SOURCE_LINK_HOST_INTERVAL_MS ?? 250),
    maxUrls: Number(process.env.SOURCE_LINK_MAX_URLS ?? 0),
    maxPages: Number(process.env.SOURCE_LINK_MAX_PAGES ?? 0),
    deadlineMs: Number(process.env.SOURCE_LINK_DEADLINE_MS ?? 22 * 60_000),
    maxBodyBytes: Number(process.env.SOURCE_LINK_MAX_BODY_BYTES ?? 512 * 1024),
    maxPageBytes: Number(process.env.SOURCE_LINK_MAX_PAGE_BYTES ?? 4 * 1024 * 1024),
    onProgress: console.log,
  });
  const summary = makeSummary(audit.results);
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, "source-link-report.md"), makeMarkdown(audit)),
    writeFile(join(outputDir, "source-link-report.json"), JSON.stringify({
      ...audit, checkedUrls: audit.coverage.checkedUrls, discoveredUrls: audit.coverage.discoveredUrls,
      limited: audit.coverage.limited, summary,
      sourceSummary: makeSummary(audit.results.filter((result) => result.references.length)),
      pageSummary: makeSummary(audit.results.filter((result) => result.pageReferences?.length)),
    }, null, 2) + "\n"),
  ]);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, makeMarkdown(audit, true));
  console.log(`Coverage: ${audit.coverage.complete ? "complete" : "INCOMPLETE"}; checked ${audit.coverage.checkedUrls}/${audit.coverage.discoveredUrls} URLs.`);
  console.log(JSON.stringify(summary));
  console.log(`Read-only reports written to ${outputDir}. No existing content or records were changed.`);
  // Broken external links remain advisory. Incomplete collection/validation is
  // an audit failure, with partial findings still uploaded for inspection.
  if (!audit.coverage.complete) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
