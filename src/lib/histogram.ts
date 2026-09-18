export type HistogramBin = {
  from: number;
  to: number;
  count: number;
};

// Historical chronology has no year zero. These coordinates give every year
// the same width, including the transition from 1 BC to AD 1.
export function yearCoordinate(year: number): number {
  return year < 0 ? year : year - 1;
}

export function histogramYearLabel(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

export function histogramRangeLabel(from: number, to: number): string {
  return from === to
    ? histogramYearLabel(from)
    : `${histogramYearLabel(from)}–${histogramYearLabel(to)}`;
}

export function buildHistogram(
  years: readonly number[],
  from: number,
  to: number,
  binSize: number
): HistogramBin[] {
  if (
    !Number.isSafeInteger(binSize) || binSize < 1 ||
    !Number.isSafeInteger(from) || !Number.isSafeInteger(to) ||
    from === 0 || to === 0 || from > to
  ) {
    throw new RangeError("Use valid historical years and a positive integer bin size.");
  }

  const counts = new Map<number, number>();
  for (const year of years) {
    if (!Number.isSafeInteger(year) || year === 0 || year < from || year > to) continue;
    const key = Math.floor(year / binSize);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const bins: HistogramBin[] = [];
  for (let key = Math.floor(from / binSize); key <= Math.floor(to / binSize); key++) {
    // Zero belongs to neither era. For example, ten-year bins around the
    // transition are 10–1 BC, AD 1–9, AD 10–19.
    const start = Math.max(from, key === 0 ? 1 : key * binSize);
    const end = Math.min(to, (key + 1) * binSize - 1);
    if (start <= end) bins.push({ from: start, to: end, count: counts.get(key) ?? 0 });
  }
  return bins;
}
