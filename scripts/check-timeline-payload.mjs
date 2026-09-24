import { appendFile, readFile, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { capacityForecast } from "./performance-report.mts";

const TIMELINE_PATH = new URL("../out/timeline-data.json", import.meta.url);
const HOMEPAGE_PATH = new URL("../out/index.html", import.meta.url);
// Compact transport measured on the 590-entry September 2026 snapshot:
// ~893 KiB raw / ~317 KiB gzip, retaining full descriptions and sources.
// Keep the existing ceilings: approximately 125 similarly sized entries
// of headroom; report a growth forecast so this can be revisited in time.
const MAX_RAW_BYTES = 1_150 * 1024;
const MAX_GZIP_BYTES = 384 * 1024;
const MAX_HOMEPAGE_GZIP_BYTES = 320 * 1024;

const payload = await readFile(TIMELINE_PATH);
const homepage = await readFile(HOMEPAGE_PATH);
const timelineData = JSON.parse(payload);

if (!Array.isArray(timelineData.events)) {
  throw new Error("Timeline payload does not contain an events array.");
}

const rawBytes = payload.byteLength;
const gzipBytes = gzipSync(payload).byteLength;
const eventCount = timelineData.events.length;
const gzipBytesPerEvent = eventCount === 0 ? 0 : gzipBytes / eventCount;
const homepageGzipBytes = gzipSync(homepage).byteLength;
const forecast = capacityForecast(eventCount, rawBytes, gzipBytes, MAX_RAW_BYTES, MAX_GZIP_BYTES);
const { estimatedAdditionalEvents } = forecast;
await mkdir("artifacts/performance", { recursive: true });
await writeFile("artifacts/performance/capacity.json", JSON.stringify({
  generatedAt: new Date().toISOString(), eventCount, rawBytes, gzipBytes,
  homepageGzipBytes, limits: { rawBytes: MAX_RAW_BYTES, gzipBytes: MAX_GZIP_BYTES, homepageGzipBytes: MAX_HOMEPAGE_GZIP_BYTES },
  ...forecast,
  method: "Linear projection from current average event bytes; not compressed synthetic datasets or a fixed event limit.",
}, null, 2) + "\n");

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

console.log("Timeline payload:");
console.log(`  Events: ${eventCount}`);
console.log(`  Raw: ${formatKiB(rawBytes)} / ${formatKiB(MAX_RAW_BYTES)}`);
console.log(`  Gzip: ${formatKiB(gzipBytes)} / ${formatKiB(MAX_GZIP_BYTES)}`);
console.log(`  Estimated growth headroom: ${estimatedAdditionalEvents} similarly sized events`);
console.log(`  Gzip per event: ${gzipBytesPerEvent.toFixed(0)} bytes`);
console.log(`  Homepage raw: ${formatKiB(homepage.byteLength)}`);
console.log(
  `  Homepage gzip: ${formatKiB(homepageGzipBytes)} / ${formatKiB(MAX_HOMEPAGE_GZIP_BYTES)}`
);

const homepageHtml = homepage.toString("utf8");
const renderedEventCount = homepageHtml.match(/aria-label="Open event:/g)?.length ?? 0;

if (!homepageHtml.includes('aria-label="Timeline exploration controls"')) {
  throw new Error("Homepage HTML does not contain the timeline controls.");
}

if (!homepageHtml.includes('aria-label="Beer history timeline"')) {
  throw new Error("Homepage HTML does not contain timeline list semantics.");
}

if (renderedEventCount !== 60) {
  throw new Error(
    `Homepage HTML contains ${renderedEventCount} event cards instead of 60.`
  );
}

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Timeline payload",
      "",
      "| Metric | Current | Budget |",
      "| --- | ---: | ---: |",
      `| Events | ${eventCount} | — |`,
      `| Raw size | ${formatKiB(rawBytes)} | ${formatKiB(MAX_RAW_BYTES)} |`,
      `| Gzip-equivalent size | ${formatKiB(gzipBytes)} | ${formatKiB(MAX_GZIP_BYTES)} |`,
      `| Gzip bytes per event | ${gzipBytesPerEvent.toFixed(0)} | — |`,
      `| Estimated additional events | ${estimatedAdditionalEvents} | Review below 100 |`,
      "", "### Capacity forecast (linear estimate)", "",
      "| Events | Raw KiB | Gzip KiB | Exceeds current budget |",
      "| ---: | ---: | ---: | --- |",
      ...forecast.projections.map((p) => `| ${p.events} | ${(p.rawBytes / 1024).toFixed(1)} | ${(p.gzipBytes / 1024).toFixed(1)} | ${p.exceedsCurrentBudget ? "Yes" : "No"} |`),
      "",
    ].join("\n")
  );
}

if (estimatedAdditionalEvents < 100) {
  console.warn("Timeline growth headroom is below 100 similarly sized entries; review payload capacity.");
}

const exceededBudgets = [];

if (rawBytes > MAX_RAW_BYTES) {
  exceededBudgets.push(
    `raw payload is ${formatKiB(rawBytes)} (limit: ${formatKiB(MAX_RAW_BYTES)})`
  );
}

if (gzipBytes > MAX_GZIP_BYTES) {
  exceededBudgets.push(
    `gzip payload is ${formatKiB(gzipBytes)} (limit: ${formatKiB(MAX_GZIP_BYTES)})`
  );
}

if (homepageGzipBytes > MAX_HOMEPAGE_GZIP_BYTES) {
  exceededBudgets.push(
    `homepage gzip is ${formatKiB(homepageGzipBytes)} (limit: ${formatKiB(MAX_HOMEPAGE_GZIP_BYTES)})`
  );
}

if (exceededBudgets.length > 0) {
  throw new Error(`Timeline payload budget exceeded: ${exceededBudgets.join("; ")}`);
}
