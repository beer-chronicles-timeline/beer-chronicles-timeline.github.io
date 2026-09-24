// Keep selection independent of GitHub/network access for offline negative tests.
export async function recoverPerformanceHistory(api, current) {
  const candidates = [], notes = [];
  const runs = (await api.listRuns()).filter((run) =>
    run.id !== current.id && run.head_sha !== current.commit &&
    run.conclusion === "success" && run.status === "completed" &&
    run.head_branch === "main" && Date.parse(run.created_at) < Date.parse(current.createdAt)
  ).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  for (const run of runs) {
    if (candidates.length === 10) break;
    try {
      const prefix = `performance-${run.head_sha}-`;
      // A deploy-only rerun can succeed using the preceding build attempt.
      const artifacts = (await api.listArtifacts(run.id)).filter((item) => item.name.startsWith(prefix) && /^\d+$/.test(item.name.slice(prefix.length)) && Number(item.name.slice(prefix.length)) <= run.run_attempt)
        .sort((a, b) => Number(b.name.slice(prefix.length)) - Number(a.name.slice(prefix.length)));
      const artifact = artifacts[0];
      if (!artifact || artifact.expired) { notes.push(`Run ${run.id} (${run.created_at}): report missing or expired`); continue; }
      const report = await api.readReport(run.id, artifact.name);
      if (report.commit !== run.head_sha || report.publicationMode !== "live" || report.workingTreeDirty || !Array.isArray(report.errors) || report.errors.length) {
        notes.push(`Run ${run.id}: report is not a clean successful live measurement`); continue;
      }
      candidates.push({ report, runId: run.id, runUrl: run.html_url, createdAt: run.created_at });
    } catch (error) { notes.push(`Run ${run.id}: report unavailable (${error.message})`); }
  }
  if (!runs.length) notes.push("No earlier successful deployment of a different commit found");
  return { candidates, notes };
}

export function selectPerformanceBaseline(current, history, now = Date.now()) {
  const rejected = [];
  for (const candidate of history.candidates ?? []) {
    const previous = candidate.report;
    if (previous.commit === current.commit) { rejected.push(`Run ${candidate.runId}: same commit`); continue; }
    if (previous.schemaVersion !== current.schemaVersion || previous.profileKey !== current.profileKey || previous.publicationMode !== current.publicationMode) {
      rejected.push(`Run ${candidate.runId}: incompatible schema, host/browser/profile or publication mode`); continue;
    }
    if (previous.errors?.length || !Array.isArray(previous.routes) || !current.routes.every((route) => {
      const old = previous.routes.find((item) => item.name === route.name);
      return old && Object.keys(route.metrics).every((key) => Number.isFinite(old.metrics?.[key]));
    })) { rejected.push(`Run ${candidate.runId}: incomplete measurements`); continue; }
    const ageDays = Math.max(0, (now - Date.parse(candidate.createdAt)) / 86_400_000);
    return { baseline: previous, source: { runId: candidate.runId, runUrl: candidate.runUrl, createdAt: candidate.createdAt, ageDays }, reason: `Recovered successful release ${previous.commit} from run ${candidate.runId} (${ageDays.toFixed(1)} days old)`, notes: [...(history.notes ?? []), ...rejected] };
  }
  return { baseline: null, source: null, reason: "Performance history gap: no compatible earlier successful release report is available", notes: [...(history.notes ?? []), ...rejected] };
}
