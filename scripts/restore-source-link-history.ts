import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { recoverAuditHistory, type AuditHistory, type AuditWorkflowRun } from "./source-link-history.ts";

const run = promisify(execFile);
const repository = process.env.GITHUB_REPOSITORY;
const api = async (path: string) => {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  return response.json();
};
let history: AuditHistory;
try {
  if (!repository || !process.env.GH_TOKEN || !process.env.GITHUB_RUN_ID) throw new Error("Missing GitHub workflow context");
  const current: AuditWorkflowRun = await api(`/actions/runs/${process.env.GITHUB_RUN_ID}`);
  history = await recoverAuditHistory({
    listRuns: async () => (await api(`/actions/workflows/source-link-audit.yml/runs?branch=${encodeURIComponent(current.head_branch)}&per_page=100`)).workflow_runs,
    listArtifacts: async (id) => (await api(`/actions/runs/${id}/artifacts?per_page=100`)).artifacts,
    readReport: async (id, name) => {
      const directory = await mkdtemp(join(tmpdir(), "bc-source-link-history-"));
      try {
        await run("gh", ["run", "download", String(id), "--repo", repository, "--name", name, "--dir", directory], { timeout: 30_000 });
        return JSON.parse(await readFile(join(directory, "source-link-report.json"), "utf8"));
      } finally { await rm(directory, { recursive: true, force: true }); }
    },
  }, current);
} catch (error) {
  history = { state: "unavailable", reason: `Audit history recovery failed: ${error instanceof Error ? error.message : String(error)}` };
}
const output = process.env.SOURCE_LINK_HISTORY_FILE ?? ".cache/source-link-history.json";
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(history, null, 2) + "\n");
console.log(`Previous audit history: ${history.state}${history.runId ? ` (run ${history.runId})` : ""}. ${history.reason}`);
