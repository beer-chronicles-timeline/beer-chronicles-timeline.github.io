import { appendFile, mkdir, writeFile } from "node:fs/promises";

export async function savePerformanceReport(report, directory, summaryPath = process.env.GITHUB_STEP_SUMMARY) {
  const warnings = report.comparison.changes.filter((change) => change.warning);
  const lines = [
    "# Mobile performance diagnostics", "", report.notes, "",
    `Commit: ${report.commit}${report.workingTreeDirty ? " (working tree changes)" : ""}; ${report.eventCount} events; ${report.publicationMode} publication; ${report.profile.runsPerRoute} runs per route.`,
    "", "| Route | LCP ms | CLS | JS gzip KiB | Ready ms | All entries ms | Sampled event max ms | Requests |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...report.routes.filter((r) => Object.keys(r.metrics).length).map(({ name, metrics: m }) => `| ${name} | ${Math.round(m.lcpMs)} | ${m.cls.toFixed(3)} | ${(m.jsEncodedBytes / 1024).toFixed(1)} | ${Math.round(m.readyMs)} | ${name === "timeline" ? Math.round(m.timelineReadyMs) : "—"} | ${m.interactionMaxMs} | ${m.requestCount} |`),
    "", report.comparison.reason, "",
    ...(report.baselineHistory?.notes ?? []).map((note) => `- History: ${note}`),
    ...warnings.map((w) => `- Review ${w.route} ${w.metric}: ${w.before.toFixed(2)} -> ${w.after.toFixed(2)}`),
    ...report.errors.map((error) => `- Measurement error: ${error}`), "",
  ];
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/performance.json`, JSON.stringify(report, null, 2) + "\n");
  await writeFile(`${directory}/performance.md`, lines.join("\n"));
  if (summaryPath) await appendFile(summaryPath, lines.join("\n"));
  console.log(report.comparison.reason);
  for (const warning of warnings) console.warn(`Review ${warning.route} ${warning.metric}: ${warning.before} -> ${warning.after}`);
  if (report.errors.length) console.error(report.errors.join("\n"));
}
