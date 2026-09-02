import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  checkSourceLinks,
  collectSourceLinks,
  type LinkResult,
  type LinkStatus,
} from "./source-link-audit.ts";

const DATA_URL =
  process.env.SOURCE_LINK_DATA_URL ??
  "https://beer-chronicles.org/timeline-data.json";
const OUTPUT_DIR =
  process.env.SOURCE_LINK_REPORT_DIR ?? "artifacts/source-link-report";
const CONCURRENCY = Number(process.env.SOURCE_LINK_CONCURRENCY ?? 8);
const TIMEOUT_MS = Number(process.env.SOURCE_LINK_TIMEOUT_MS ?? 15_000);
const MAX_URLS = Number(process.env.SOURCE_LINK_MAX_URLS ?? 0);

const statusOrder: LinkStatus[] = [
  "missing",
  "blocked",
  "rate-limited",
  "transient-error",
  "network-error",
  "needs-review",
  "redirected",
  "working",
];

function escapeTableCell(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function makeSummary(results: LinkResult[]) {
  return Object.fromEntries(
    statusOrder.map((status) => [
      status,
      results.filter((result) => result.status === status).length,
    ])
  ) as Record<LinkStatus, number>;
}

function makeMarkdown(
  results: LinkResult[],
  generatedAt: string,
  dataUrl: string
) {
  const summary = makeSummary(results);
  const rows = results
    .filter((result) => result.status !== "working")
    .sort(
      (left, right) =>
        statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status) ||
        left.url.localeCompare(right.url)
    )
    .map((result) => {
      const events = result.references
        .map((reference) => reference.eventTitle)
        .join("; ");
      const destination = result.finalUrl
        ? `${result.url} → ${result.finalUrl}`
        : result.url;
      return `| ${result.status} | ${result.httpStatus ?? "—"} | ${escapeTableCell(destination)} | ${escapeTableCell(events)} |`;
    });

  return [
    "# Beer Chronicles source-link report",
    "",
    `Generated: ${generatedAt}`,
    "",
    `Data source: ${dataUrl}`,
    "",
    "This report is advisory. Automated blocking, rate limiting, and transient network failures are not evidence that a source is unavailable to readers.",
    "",
    "## Summary",
    "",
    "| Status | Count |",
    "| --- | ---: |",
    ...statusOrder.map((status) => `| ${status} | ${summary[status]} |`),
    `| **Total unique URLs** | **${results.length}** |`,
    "",
    "## URLs requiring attention or recording a redirect",
    "",
    ...(rows.length > 0
      ? [
          "| Status | HTTP | URL | Referenced by |",
          "| --- | ---: | --- | --- |",
          ...rows,
        ]
      : ["No non-working or redirected URLs were recorded."]),
    "",
  ].join("\n");
}

async function main() {
  const response = await fetch(DATA_URL, {
    headers: {
      "Cache-Control": "no-cache",
      "User-Agent":
        "BeerChronicles-SourceLinkAudit/1.0 (+https://beer-chronicles.org/)",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load timeline data: HTTP ${response.status}`);
  }

  const timelineData: unknown = await response.json();
  if (
    !timelineData ||
    typeof timelineData !== "object" ||
    !("events" in timelineData) ||
    !Array.isArray(timelineData.events)
  ) {
    throw new Error("Timeline payload does not contain an events array.");
  }

  const allLinks = collectSourceLinks(timelineData.events);
  const links = MAX_URLS > 0 ? allLinks.slice(0, MAX_URLS) : allLinks;
  const results = await checkSourceLinks(links, {
    concurrency: CONCURRENCY,
    timeoutMs: TIMEOUT_MS,
  });
  const generatedAt = new Date().toISOString();
  const markdown = makeMarkdown(results, generatedAt, DATA_URL);
  const summary = makeSummary(results);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(join(OUTPUT_DIR, "source-link-report.md"), markdown),
    writeFile(
      join(OUTPUT_DIR, "source-link-report.json"),
      `${JSON.stringify(
        {
          generatedAt,
          dataUrl: DATA_URL,
          checkedUrls: results.length,
          discoveredUrls: allLinks.length,
          limited: links.length !== allLinks.length,
          summary,
          results,
        },
        null,
        2
      )}\n`
    ),
  ]);

  console.log(`Checked ${results.length} unique source URLs.`);
  for (const status of statusOrder) {
    console.log(`  ${status}: ${summary[status]}`);
  }
  console.log(`Reports written to ${OUTPUT_DIR}.`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const attention = results.filter(
      (result) => result.status !== "working" && result.status !== "redirected"
    );
    const workflowSummary = [
      "## Source-link audit",
      "",
      `Checked **${results.length}** unique source URLs from **${timelineData.events.length}** events.`,
      "",
      "| Status | Count |",
      "| --- | ---: |",
      ...statusOrder.map((status) => `| ${status} | ${summary[status]} |`),
      "",
      attention.length > 0
        ? `Review the uploaded report for ${attention.length} URL(s) requiring attention. Automated blocking and transient errors are not proof of a broken source.`
        : "No URLs require attention. Redirects, if any, are recorded in the uploaded report.",
      "",
    ].join("\n");
    await appendFile(process.env.GITHUB_STEP_SUMMARY, workflowSummary);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
