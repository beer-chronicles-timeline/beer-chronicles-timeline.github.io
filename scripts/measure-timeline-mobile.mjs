import { appendFile, access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { spawn, execFileSync } from "node:child_process";
import { cpus } from "node:os";
import { chromium } from "@playwright/test";
import { median, calculateCls, comparePerformance } from "./performance-report.mts";

const count = Number(process.env.TIMELINE_PERFORMANCE_RUNS ?? 3);
if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error("TIMELINE_PERFORMANCE_RUNS must be 1-10");
const network = { latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 };
const directory = process.env.PERFORMANCE_OUTPUT_DIR ?? "artifacts/performance";
await access("out/timeline-data.json");
await mkdir(directory, { recursive: true });
const publication = JSON.parse(await readFile("out/publication-status.json", "utf8"));
const cases = [
  { name: "timeline", path: "/" },
  { name: "map", path: "/map" },
  { name: "histogram", path: "/histogram" },
  { name: "event", path: "/events/fc252325-4204-4381-b718-234fa91110dc/the-bavarian-beer-regulation-of-1516-is-issued" },
];
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close((error) => error ? reject(error) : resolve(port));
  });
});
const baseURL = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve-export.mjs", String(port)], { stdio: "ignore", env: { ...process.env, PERFORMANCE_GZIP: "1" } });
let browser;
const report = {
  schemaVersion: 1, generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  workingTreeDirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
  publicationMode: publication.mode, eventCount: publication.eventCount,
  profile: { runsPerRoute: count, observationWindowMs: 2000, nodeVersion: process.version, cpuModel: cpus()[0]?.model, logicalCpus: cpus().length, viewport: "390x844", dpr: 2, network, cpuSlowdown: 4, compression: "gzip", basemap: "synthetic background; no remote tiles", externalRequests: "blocked", platform: process.platform, arch: process.arch },
  profileKey: "", routes: [], errors: [],
  notes: "Diagnostic lab medians, not field CWV/INP. Interaction maximum covers only sampled events >=16ms; zero means none recorded above that threshold. Map excludes remote tile cost. Blocking time is an approximation over the observed load window.",
};
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(baseURL)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Static performance server did not start");
  browser = await chromium.launch({ headless: true });
  report.profile.browser = browser.version();
  report.profileKey = JSON.stringify(report.profile);
  for (const scenario of cases) {
    const runs = [];
    const result = { ...scenario, runs, metrics: {} };
    report.routes.push(result);
    try {
    for (let i = 0; i < count; i++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: "block" });
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      const errors = [];
      const failures = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
      await context.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.href === "https://tiles.openfreemap.org/styles/positron") return route.fulfill({ headers: { "Access-Control-Allow-Origin": "*" }, json: { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f5f4" } }] } });
        if (url.origin !== baseURL) return route.abort();
        return route.continue();
      });
      const session = await context.newCDPSession(page);
      await session.send("Network.enable");
      await session.send("Network.setCacheDisabled", { cacheDisabled: true });
      await session.send("Network.emulateNetworkConditions", { offline: false, ...network });
      await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.addInitScript(() => {
        window.__bcMetrics = { lcp: 0, shifts: [], tasks: [], events: [], unsupported: [] };
        for (const type of ["largest-contentful-paint", "layout-shift", "longtask", "event"]) {
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const data = window.__bcMetrics;
                if (type === "largest-contentful-paint") data.lcp = entry.startTime;
                else if (type === "layout-shift" && !entry.hadRecentInput) data.shifts.push({ time: entry.startTime, value: entry.value });
                else if (type === "longtask") data.tasks.push(entry.duration);
                else if (type === "event" && entry.interactionId) data.events.push({ id: entry.interactionId, duration: entry.duration });
              }
            }).observe({ type, buffered: true, ...(type === "event" ? { durationThreshold: 16 } : {}) });
          } catch { window.__bcMetrics.unsupported.push(type); }
        }
      });
      const started = Date.now();
      const details = scenario.name === "timeline" ? page.waitForResponse((r) => new URL(r.url()).pathname === "/timeline-data.json") : null;
      await page.goto(baseURL + scenario.path, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      if (scenario.name === "timeline") await page.locator("[data-timeline-ready=true]").waitFor();
      if (scenario.name === "map") await page.waitForFunction(() => document.querySelector('.maplibregl-canvas') || document.body.textContent.includes("Interactive map unavailable"));
      if (scenario.name === "map") await page.locator(".maplibregl-marker").first().waitFor();
      const readyMs = Date.now() - started;
      if (details) {
        const response = await details;
        if (!response.ok()) throw new Error("Timeline details failed to load");
        await response.finished();
      }
      // Fixed observation window: enough for fonts, hydration and initial map work.
      await page.waitForTimeout(2000);
      const load = await page.evaluate(() => {
        const data = window.__bcMetrics;
        const navigation = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        const scripts = resources.filter((r) => /\.m?js(?:\?|$)/.test(r.name));
        return {
          lcpMs: data.lcp,
          fcpMs: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
          documentEncodedBytes: navigation.encodedBodySize,
          jsEncodedBytes: scripts.reduce((sum, r) => sum + r.encodedBodySize, 0),
          jsDecodedBytes: scripts.reduce((sum, r) => sum + r.decodedBodySize, 0),
          requestCount: resources.length + 1,
          approximateBlockingMs: data.tasks.reduce((sum, value) => sum + Math.max(0, value - 50), 0),
          longestTaskMs: Math.max(0, ...data.tasks),
          timelineRequestMs: resources.find((r) => r.name.includes("/timeline-data.json"))?.duration ?? 0,
          timelineEncodedBytes: resources.find((r) => r.name.includes("/timeline-data.json"))?.encodedBodySize ?? 0,
          scripts: scripts.map((r) => ({ path: new URL(r.name).pathname, encodedBytes: r.encodedBodySize, decodedBytes: r.decodedBodySize })),
          mapRenderer: document.querySelector('.maplibregl-canvas') ? "canvas" : "unavailable-or-not-applicable",
        };
      });
      await page.evaluate(() => { window.__bcMetrics.events = []; });
      if (scenario.name === "timeline") {
        await page.getByRole("textbox", { name: "Search timeline" }).pressSequentially("fermentation", { delay: 80 });
      } else if (scenario.name === "histogram") {
        await page.getByRole("button", { name: "All history", exact: true }).click();
      } else if (scenario.name === "map") {
        await page.getByLabel("Find a reviewed place").fill("Zatec");
        await page.getByRole("button", { name: "Show place", exact: true }).click();
        await page.getByRole("complementary", { name: "Selected map entry" }).waitFor();
        const zoom = page.getByRole("button", { name: "Zoom in", exact: true });
        if (await zoom.count()) await zoom.click();
      } else {
        await page.getByRole("button", { name: "Open navigation menu" }).click();
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(1000);
      const interaction = await page.evaluate(() => {
        const data = window.__bcMetrics;
        return { shifts: data.shifts, interactionMaxMs: Math.max(0, ...data.events.map((e) => e.duration)), observedInteractions: new Set(data.events.map((e) => e.id)).size, unsupported: data.unsupported };
      });
      const { scripts, mapRenderer, ...metrics } = load;
      const { unsupported, shifts, ...interactionMetrics } = interaction;
      const cls = calculateCls(shifts);
      runs.push({ metrics: { ...metrics, ...interactionMetrics, cls, readyMs }, scripts, mapRenderer, unsupported, errors, failures });
      await context.close();
      if (unsupported.length || errors.length || failures.length || load.lcpMs <= 0 || (scenario.name === "map" && mapRenderer !== "canvas")) throw new Error(`${scenario.name}: incomplete measurement; inspect recorded diagnostics`);
      console.log(`${scenario.name} ${i + 1}/${count}: LCP ${Math.round(load.lcpMs)}ms, CLS ${cls.toFixed(3)}, JS ${(load.jsEncodedBytes / 1024).toFixed(1)}KiB, sampled event max ${interaction.interactionMaxMs}ms`);
    }
    result.metrics = Object.fromEntries(Object.keys(runs[0].metrics).map((key) => [key, median(runs.map((r) => r.metrics[key]))]));
    } catch (error) {
      report.errors.push(`${scenario.name}: ${error.message}`);
      process.exitCode = 1;
      for (const context of browser.contexts()) await context.close();
    }
  }
} catch (error) {
  report.errors.push(error.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
let baseline = null;
const baselinePath = process.env.PERFORMANCE_BASELINE_PATH;
if (baselinePath) {
  try { baseline = JSON.parse(await readFile(baselinePath, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") { report.errors.push(`Baseline could not be read: ${error.message}`); process.exitCode = 1; } }
}
report.comparison = comparePerformance(report, baseline);
const warnings = report.comparison.changes.filter((change) => change.warning);
const lines = [
  "# Mobile performance diagnostics", "", report.notes, "",
  `Commit: ${report.commit}${report.workingTreeDirty ? " (working tree changes)" : ""}; ${report.eventCount} events; ${report.publicationMode} publication; ${count} runs per route.`,
  "", "| Route | LCP ms | CLS | JS gzip KiB | Ready ms | Sampled event max ms | Requests |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...report.routes.filter((r) => Object.keys(r.metrics).length).map(({ name, metrics: m }) => `| ${name} | ${Math.round(m.lcpMs)} | ${m.cls.toFixed(3)} | ${(m.jsEncodedBytes / 1024).toFixed(1)} | ${Math.round(m.readyMs)} | ${m.interactionMaxMs} | ${m.requestCount} |`),
  "", report.comparison.reason, "", ...warnings.map((w) => `- Review ${w.route} ${w.metric}: ${w.before.toFixed(2)} -> ${w.after.toFixed(2)}`),
  ...report.errors.map((error) => `- Measurement error: ${error}`), "",
];
await writeFile(`${directory}/performance.json`, JSON.stringify(report, null, 2) + "\n");
await writeFile(`${directory}/performance.md`, lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
console.log(report.comparison.reason);
for (const warning of warnings) console.warn(`Review ${warning.route} ${warning.metric}: ${warning.before} -> ${warning.after}`);
if (report.errors.length) console.error(report.errors.join("\n"));
