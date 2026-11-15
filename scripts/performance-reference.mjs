import { createHash } from "node:crypto";

const commitPattern = /^[a-f0-9]{40}$/;
const hashPattern = /^[a-f0-9]{64}$/;

export function snapshotFingerprint(snapshot) {
  if (![snapshot.events, snapshot.tags, snapshot.eventTags].every(Array.isArray)) {
    throw new Error("Performance comparison requires a complete publication snapshot");
  }
  return createHash("sha256").update(JSON.stringify({
    events: snapshot.events, tags: snapshot.tags, eventTags: snapshot.eventTags,
  })).digest("hex");
}

export function createComparisonContext(snapshot, currentCommit, referenceCommit, runId) {
  if (!commitPattern.test(currentCommit) || !commitPattern.test(referenceCommit) || currentCommit === referenceCommit || !runId) {
    throw new Error("Performance comparison requires two distinct commits and a run identity");
  }
  return { kind: "same-run-code", runId, currentCommit, referenceCommit, snapshotHash: snapshotFingerprint(snapshot) };
}

export function assertMeasurementContext(context, snapshot, publication, commit) {
  const expected = context.role === "current" ? context.currentCommit : context.role === "reference" ? context.referenceCommit : null;
  if (context.kind !== "same-run-code" || !expected || !commitPattern.test(expected) ||
      context.currentCommit === context.referenceCommit || !context.runId ||
      commit !== expected || publication.commit !== expected || snapshot.commit !== expected ||
      !hashPattern.test(context.snapshotHash) || snapshotFingerprint(snapshot) !== context.snapshotHash ||
      publication.eventCount !== snapshot.events.length ||
      (context.role === "reference" && (snapshot.mode !== "fixture" || publication.mode !== "fixture"))) {
    throw new Error("Performance measurement does not match its controlled comparison context");
  }
}

export function isControlledPerformancePair(current, reference) {
  const a = current.comparisonContext, b = reference.comparisonContext;
  const complete = Array.isArray(current.routes) && current.routes.length > 0 &&
    Array.isArray(reference.routes) && reference.routes.length === current.routes.length &&
    new Set(current.routes.map((route) => route.name)).size === current.routes.length &&
    current.routes.every((route) => {
      const previous = reference.routes.find((item) => item.name === route.name);
      return previous && Object.keys(route.metrics).length > 0 && Object.entries(route.metrics).every(
        ([key, value]) => Number.isFinite(value) && Number.isFinite(previous.metrics[key])
      );
    });
  return Boolean(a && b && a.kind === "same-run-code" && b.kind === a.kind &&
    a.role === "current" && b.role === "reference" && a.runId && a.runId === b.runId &&
    commitPattern.test(a.currentCommit) && commitPattern.test(a.referenceCommit) &&
    a.currentCommit !== a.referenceCommit && current.commit === a.currentCommit && reference.commit === a.referenceCommit &&
    a.currentCommit === b.currentCommit && a.referenceCommit === b.referenceCommit &&
    hashPattern.test(a.snapshotHash) && a.snapshotHash === b.snapshotHash &&
    current.eventCount === reference.eventCount && reference.publicationMode === "fixture" &&
    ["live", "fixture"].includes(current.publicationMode) &&
    complete && Array.isArray(current.errors) && !current.errors.length && Array.isArray(reference.errors) && !reference.errors.length);
}
