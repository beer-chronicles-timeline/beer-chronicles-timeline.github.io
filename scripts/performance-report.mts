export type MetricSet = Record<string, number>;
export type PerformanceReport = {
  schemaVersion: number;
  profileKey: string;
  commit: string;
  publicationMode: string;
  routes: { name: string; metrics: MetricSet }[];
};

export function median(values: number[]): number {
  if (!values.length || values.some((value) => !Number.isFinite(value))) throw new Error("Cannot summarize missing/nonfinite measurements");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function calculateCls(shifts: { time: number; value: number }[]): number {
  let maximum = 0, value = 0;
  let first = -Infinity, previous = -Infinity;
  for (const shift of shifts) {
    if (shift.time - previous < 1000 && shift.time - first < 5000) value += shift.value;
    else { value = shift.value; first = shift.time; }
    previous = shift.time;
    maximum = Math.max(maximum, value);
  }
  return maximum;
}

// Advisory thresholds, separate from the existing hard payload ceilings.
const thresholds: Record<string, { relative: number; absolute: number }> = {
  lcpMs: { relative: 0.2, absolute: 300 },
  readyMs: { relative: 0.2, absolute: 300 },
  interactionMaxMs: { relative: 0.2, absolute: 32 },
  jsEncodedBytes: { relative: 0.1, absolute: 16 * 1024 },
  jsDecodedBytes: { relative: 0.1, absolute: 64 * 1024 },
  requestCount: { relative: 0.15, absolute: 3 },
  cls: { relative: 0, absolute: 0.02 },
  approximateBlockingMs: { relative: 0.2, absolute: 50 },
};

export function comparePerformance(current: PerformanceReport, baseline: PerformanceReport | null) {
  if (!baseline) return { comparable: false, reason: "No previous baseline", changes: [] };
  if (current.commit === baseline.commit) return { comparable: false, reason: "Same commit; refusing a self-comparison", changes: [] };
  if (current.schemaVersion !== baseline.schemaVersion || current.profileKey !== baseline.profileKey || current.publicationMode !== baseline.publicationMode) {
    return { comparable: false, reason: "Different schema, browser/host/profile or publication mode", changes: [] };
  }
  const changes = current.routes.flatMap((route) => {
    const previous = baseline.routes.find((item) => item.name === route.name);
    if (!previous) return [];
    return Object.entries(thresholds).flatMap(([metric, threshold]) => {
      const before = previous.metrics[metric], after = route.metrics[metric];
      if (!Number.isFinite(before) || !Number.isFinite(after)) return [];
      const delta = after - before;
      return [{ route: route.name, metric, before, after, delta, warning: delta > Math.max(threshold.absolute, before * threshold.relative) }];
    });
  });
  return { comparable: true, reason: `Compared with ${baseline.commit}`, changes };
}

export function capacityForecast(eventCount: number, rawBytes: number, gzipBytes: number, rawLimit: number, gzipLimit: number) {
  if (eventCount <= 0 || rawBytes <= 0 || gzipBytes <= 0) throw new Error("Capacity requires a nonempty payload");
  return {
    estimatedAdditionalEvents: Math.floor(Math.min((rawLimit - rawBytes) / (rawBytes / eventCount), (gzipLimit - gzipBytes) / (gzipBytes / eventCount))),
    projections: [750, 1000, 1500].map((count) => ({
      events: count,
      rawBytes: Math.round(rawBytes * count / eventCount),
      gzipBytes: Math.round(gzipBytes * count / eventCount),
      exceedsCurrentBudget: rawBytes * count / eventCount > rawLimit || gzipBytes * count / eventCount > gzipLimit,
    })),
  };
}
