import { appendFile, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const TIMELINE_PATH = new URL("../out/timeline-data.json", import.meta.url);
// These ceilings leave room for normal editorial growth while catching a
// material, accidental jump before the static artifact is deployed.
const MAX_RAW_BYTES = 1_150 * 1024;
const MAX_GZIP_BYTES = 384 * 1024;

const payload = await readFile(TIMELINE_PATH);
const timelineData = JSON.parse(payload);

if (!Array.isArray(timelineData.events)) {
  throw new Error("Timeline payload does not contain an events array.");
}

const rawBytes = payload.byteLength;
const gzipBytes = gzipSync(payload).byteLength;
const eventCount = timelineData.events.length;
const gzipBytesPerEvent = eventCount === 0 ? 0 : gzipBytes / eventCount;

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

console.log("Timeline payload:");
console.log(`  Events: ${eventCount}`);
console.log(`  Raw: ${formatKiB(rawBytes)} / ${formatKiB(MAX_RAW_BYTES)}`);
console.log(`  Gzip: ${formatKiB(gzipBytes)} / ${formatKiB(MAX_GZIP_BYTES)}`);
console.log(`  Gzip per event: ${gzipBytesPerEvent.toFixed(0)} bytes`);

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
      "",
    ].join("\n")
  );
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

if (exceededBudgets.length > 0) {
  throw new Error(`Timeline payload budget exceeded: ${exceededBudgets.join("; ")}`);
}
