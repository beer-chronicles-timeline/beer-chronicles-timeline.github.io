import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { comparePerformance } from "./performance-report.mts";
import { createComparisonContext, snapshotFingerprint } from "./performance-reference.mjs";
import { savePerformanceReport } from "./performance-output.mjs";

const root = process.cwd();
const directory = resolve(process.env.PERFORMANCE_OUTPUT_DIR ?? "artifacts/performance");
const harness = fileURLToPath(new URL("./measure-timeline-mobile.mjs", import.meta.url));
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

function run(command, args, cwd, extraEnv = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", env: { ...process.env, ...extraEnv } });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0 ? resolveRun() : reject(new Error(`${command} ${args[0]} failed (${code ?? signal})`)));
  });
}

async function referenceCommit(currentCommit) {
  let commit = process.env.PERFORMANCE_REFERENCE_COMMIT;
  if (!commit) {
    const response = await fetch(`https://beer-chronicles.org/publication-status.json?performance=${currentCommit}`, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Published reference HTTP ${response.status}`);
    const publication = await response.json();
    if (publication.mode !== "live") throw new Error("Published reference is not a live publication");
    commit = publication.commit;
    if (commit === currentCommit && process.env.PERFORMANCE_HISTORY_PATH) {
      const history = JSON.parse(await readFile(process.env.PERFORMANCE_HISTORY_PATH, "utf8"));
      commit = history.candidates?.find((candidate) => candidate.report.commit !== currentCommit)?.report.commit;
    }
  }
  if (!/^[a-f0-9]{40}$/.test(commit ?? "") || commit === currentCommit) throw new Error("No distinct published reference commit is available");
  git(["merge-base", "--is-ancestor", commit, currentCommit]);
  return commit;
}

async function main() {
  await mkdir(directory, { recursive: true });
  const snapshot = JSON.parse(await readFile(".cache/publication.json", "utf8"));
  const currentCommit = git(["rev-parse", "HEAD"]);
  let context, referenceError;
  try {
    context = createComparisonContext(snapshot, currentCommit, await referenceCommit(currentCommit), process.env.GITHUB_RUN_ID ?? randomUUID());
    await writeFile(join(directory, "comparison-current.json"), JSON.stringify({ ...context, role: "current" }));
  } catch (error) { referenceError = error.message; }

  // Recover a compatible historical report first. The same-run build is needed
  // only when no retained measurement matches this runner's exact profile.
  let report;
  try {
    await run(process.execPath, [harness], root, {
      PERFORMANCE_OUTPUT_DIR: directory, PERFORMANCE_SKIP_SUMMARY: "1",
      PERFORMANCE_COMPARISON_CONTEXT_PATH: context ? join(directory, "comparison-current.json") : "",
    });
    report = JSON.parse(await readFile(join(directory, "performance.json"), "utf8"));
    if (report.comparison.comparable) {
      await savePerformanceReport(report, directory);
      return;
    }
    if (!context) throw new Error(referenceError ?? "No controlled reference is available");

    const temporary = await mkdtemp(join(tmpdir(), "bc-performance-reference-"));
    const worktree = join(temporary, "source");
    let added = false;
    try {
      await run("git", ["worktree", "add", "--detach", worktree, context.referenceCommit], root);
      added = true;
      await run("npm", ["ci"], worktree);
      await mkdir(join(worktree, ".cache"), { recursive: true });
      // A fixture in an isolated worktree: never query Supabase, replace the
      // candidate export or pass this reference through the publication gate.
      const referenceSnapshot = { ...snapshot, commit: context.referenceCommit, mode: "fixture" };
      if (snapshotFingerprint(referenceSnapshot) !== context.snapshotHash) throw new Error("Reference dataset changed");
      await writeFile(join(worktree, ".cache/publication.json"), JSON.stringify(referenceSnapshot));
      await run(process.execPath, ["scripts/prepare-maplibre.mjs"], worktree);
      const bundler = process.env.PERFORMANCE_BUNDLER ?? "turbopack";
      if (!["webpack", "turbopack"].includes(bundler)) throw new Error("Unknown performance build tool");
      await run(process.execPath, ["node_modules/next/dist/bin/next", "build", `--${bundler}`], worktree);
      await run(process.execPath, ["--import", "tsx", "scripts/check-publication-export.ts"], worktree);
      const referenceDirectory = join(directory, "reference");
      const referenceContext = join(directory, "comparison-reference.json");
      await writeFile(referenceContext, JSON.stringify({ ...context, role: "reference" }));
      await run(process.execPath, [harness], root, {
        PERFORMANCE_OUTPUT_DIR: referenceDirectory, PERFORMANCE_SOURCE_DIR: worktree,
        PERFORMANCE_EXPORT_DIR: join(worktree, "out"), PERFORMANCE_SKIP_SUMMARY: "1",
        PERFORMANCE_COMPARISON_CONTEXT_PATH: referenceContext,
        PERFORMANCE_BASELINE_PATH: "", PERFORMANCE_HISTORY_PATH: "",
      });
      const baseline = JSON.parse(await readFile(join(referenceDirectory, "performance.json"), "utf8"));
      report.comparison = comparePerformance(report, baseline);
      if (!report.comparison.comparable) throw new Error(`Controlled baseline rejected: ${report.comparison.reason}`);
      report.baselineHistory = {
        source: { kind: "same-run-code", commit: context.referenceCommit, runId: context.runId, snapshotHash: context.snapshotHash },
        reason: report.comparison.reason,
        notes: ["No compatible historical timing report was available; the previous code was rebuilt with the candidate dataset and measured on this runner.", ...(report.baselineHistory?.notes ?? [])],
      };
    } finally {
      if (added) await run("git", ["worktree", "remove", "--force", worktree], root);
      await rm(temporary, { recursive: true, force: true });
    }
    await savePerformanceReport(report, directory);
  } catch (error) {
    report ??= JSON.parse(await readFile(join(directory, "performance.json"), "utf8"));
    report.errors.push(`Release comparison failed: ${error.message}`);
    report.comparison = { comparable: false, reason: `Release comparison unavailable: ${error.message}`, changes: [] };
    await savePerformanceReport(report, directory);
    throw error;
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
