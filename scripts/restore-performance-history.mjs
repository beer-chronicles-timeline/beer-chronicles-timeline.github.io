import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recoverPerformanceHistory } from "./performance-history.mjs";

const run = promisify(execFile);
const repository = process.env.GITHUB_REPOSITORY;
const api = async (path) => {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  return response.json();
};
let history;
try {
  if (!repository || !process.env.GH_TOKEN || !process.env.GITHUB_RUN_ID) throw new Error("Missing GitHub workflow context");
  const current = await api(`/actions/runs/${process.env.GITHUB_RUN_ID}`);
  history = await recoverPerformanceHistory({
    listRuns: async () => {
      const runs = [];
      // Bounded discovery: newest 300 successful runs, at most ten retained reports.
      for (let page = 1; page <= 3; page++) {
        const result = await api(`/actions/workflows/deploy.yml/runs?branch=main&status=success&per_page=100&page=${page}`);
        runs.push(...result.workflow_runs);
        if (result.workflow_runs.length < 100) break;
      }
      return runs;
    },
    listArtifacts: async (id) => (await api(`/actions/runs/${id}/artifacts?per_page=100`)).artifacts,
    readReport: async (id, name) => {
      const directory = await mkdtemp(join(tmpdir(), "bc-performance-history-"));
      try {
        await run("gh", ["run", "download", String(id), "--repo", repository, "--name", name, "--dir", directory], { timeout: 30_000 });
        return JSON.parse(await readFile(join(directory, "performance.json"), "utf8"));
      } finally { await rm(directory, { recursive: true, force: true }); }
    },
  }, { id: current.id, commit: process.env.GITHUB_SHA, createdAt: current.created_at });
} catch (error) {
  history = { candidates: [], notes: [`History recovery failed: ${error.message}`] };
}
await mkdir(".cache", { recursive: true });
await writeFile(".cache/performance-history.json", JSON.stringify(history, null, 2) + "\n");
console.log(`Recovered ${history.candidates.length} earlier successful release reports (90-day artifact retention; newest 300 successful runs searched).`);
for (const note of history.notes) console.warn(note);
