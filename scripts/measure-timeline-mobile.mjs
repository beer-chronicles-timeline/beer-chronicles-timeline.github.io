import { appendFile, access } from "node:fs/promises";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const TIMELINE_PATH = new URL("../out/timeline-data.json", import.meta.url);
const RUN_COUNT = Number.parseInt(
  process.env.TIMELINE_PERFORMANCE_RUNS ?? "3",
  10
);
const NETWORK_PROFILE = {
  latency: 150,
  downloadThroughput: 1_600_000 / 8,
  uploadThroughput: 750_000 / 8,
};
const CPU_SLOWDOWN_RATE = 4;
const PERFORMANCE_URL = process.env.TIMELINE_PERFORMANCE_URL;

if (!Number.isInteger(RUN_COUNT) || RUN_COUNT < 1 || RUN_COUNT > 10) {
  throw new Error(
    "TIMELINE_PERFORMANCE_RUNS must be an integer between 1 and 10."
  );
}

await access(TIMELINE_PATH);

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a local performance-test port."));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // The static server may still be starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("The local static server did not become ready in time.");
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function formatMilliseconds(value) {
  return `${Math.round(value)} ms`;
}

function formatKiB(value) {
  return `${(value / 1024).toFixed(1)} KiB`;
}

const port = PERFORMANCE_URL ? null : await getAvailablePort();
const baseUrl = PERFORMANCE_URL ?? `http://127.0.0.1:${port}`;
const staticServer = PERFORMANCE_URL
  ? null
  : spawn(
      "python3",
      ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", "out"],
      { stdio: "ignore" }
    );
let browser;

try {
  await waitForServer(baseUrl);
  browser = await chromium.launch({ headless: true });
  const runs = [];

  for (let run = 1; run <= RUN_COUNT; run += 1) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);

    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      ...NETWORK_PROFILE,
    });
    await session.send("Emulation.setCPUThrottlingRate", {
      rate: CPU_SLOWDOWN_RATE,
    });
    await page.addInitScript(() => {
      window.__beerChroniclesLongTasks = [];
      window.__beerChroniclesLargestContentfulPaint = 0;

      new PerformanceObserver((list) => {
        window.__beerChroniclesLongTasks.push(
          ...list.getEntries().map((entry) => ({
            startTime: entry.startTime,
            duration: entry.duration,
          }))
        );
      }).observe({ type: "longtask", buffered: true });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const latestEntry = entries.at(-1);
        if (latestEntry) {
          window.__beerChroniclesLargestContentfulPaint = latestEntry.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    const navigationStartedAt = Date.now();
    const timelineResponsePromise = page
      .waitForResponse((response) => response.url().includes("/timeline-data.json"), {
        timeout: 30_000,
      })
      .catch(() => null);
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page
      .locator('[aria-label="Timeline exploration controls"][data-timeline-ready="true"]')
      .waitFor({ state: "visible", timeout: 30_000 });
    const timelineReadyMilliseconds = Date.now() - navigationStartedAt;
    await timelineResponsePromise;

    const browserMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const firstContentfulPaint = performance.getEntriesByName(
        "first-contentful-paint"
      )[0];
      const timelineResource = performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/timeline-data.json"));
      const longTasks = window.__beerChroniclesLongTasks ?? [];
      const totalBlockingTime = longTasks.reduce(
        (total, task) => total + Math.max(0, task.duration - 50),
        0
      );

      return {
        domContentLoadedMilliseconds:
          navigation?.domContentLoadedEventEnd ?? 0,
        firstContentfulPaintMilliseconds:
          firstContentfulPaint?.startTime ?? 0,
        largestContentfulPaintMilliseconds:
          window.__beerChroniclesLargestContentfulPaint ?? 0,
        documentTransferBytes: navigation?.transferSize ?? 0,
        documentDecodedBytes: navigation?.decodedBodySize ?? 0,
        timelineRequestMilliseconds: timelineResource?.duration ?? 0,
        timelineTransferBytes: timelineResource?.transferSize ?? 0,
        timelineDecodedBytes: timelineResource?.decodedBodySize ?? 0,
        longTaskCount: longTasks.length,
        totalLongTaskMilliseconds: longTasks.reduce(
          (total, task) => total + task.duration,
          0
        ),
        totalBlockingTimeMilliseconds: totalBlockingTime,
      };
    });

    runs.push({
      timelineReadyMilliseconds,
      ...browserMetrics,
    });
    await context.close();
  }

  const metrics = Object.fromEntries(
    Object.keys(runs[0]).map((key) => [
      key,
      median(runs.map((run) => run[key])),
    ])
  );
  const rows = [
    ["Runs", String(RUN_COUNT)],
    ["Viewport", "390 × 844 CSS px"],
    ["Network", "1.6 Mbps down, 750 Kbps up, 150 ms latency"],
    ["CPU slowdown", `${CPU_SLOWDOWN_RATE}×`],
    ["First contentful paint", formatMilliseconds(metrics.firstContentfulPaintMilliseconds)],
    ["Largest contentful paint", formatMilliseconds(metrics.largestContentfulPaintMilliseconds)],
    ["Timeline controls ready", formatMilliseconds(metrics.timelineReadyMilliseconds)],
    ["Document transfer", formatKiB(metrics.documentTransferBytes)],
    ["Document decoded body", formatKiB(metrics.documentDecodedBytes)],
    ["Timeline request", formatMilliseconds(metrics.timelineRequestMilliseconds)],
    ["Timeline transfer", formatKiB(metrics.timelineTransferBytes)],
    ["Timeline decoded body", formatKiB(metrics.timelineDecodedBytes)],
    ["Long tasks", String(Math.round(metrics.longTaskCount))],
    ["Total long-task time", formatMilliseconds(metrics.totalLongTaskMilliseconds)],
    ["Approximate TBT", formatMilliseconds(metrics.totalBlockingTimeMilliseconds)],
  ];

  console.log("Mobile timeline performance (median):");
  console.table(Object.fromEntries(rows));

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      [
        "## Mobile timeline performance",
        "",
        "Diagnostic only; no deployment thresholds are applied.",
        "",
        "| Metric | Median |",
        "| --- | ---: |",
        ...rows.map(([label, value]) => `| ${label} | ${value} |`),
        "",
      ].join("\n")
    );
  }
} finally {
  await browser?.close();
  staticServer?.kill("SIGTERM");
}
