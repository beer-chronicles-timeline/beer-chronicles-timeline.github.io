// Continuous coordinates omit year zero, including when rounding a drag.
export function historicalYearToSliderValue(year: number): number {
  return year < 0 ? year : year - 1;
}

export function sliderValueToHistoricalYear(value: number): number {
  return value < 0 ? value : value + 1;
}

// Allocate 25% before 1500, 25% to 1500–1800, and 50% after 1800.
// Only the full available range determines the scale, never the selection.
// If a period is absent, redistribute its space among the remaining periods.
export function createYearRangeScale(minYear: number, maxYear: number) {
  const minimum = historicalYearToSliderValue(minYear);
  const maximum = historicalYearToSliderValue(maxYear);
  const years = [...new Set([
    minYear,
    ...[1500, 1800].filter((year) => year > minYear && year < maxYear),
    maxYear,
  ])];
  const segments = years.slice(1).map((year, index) => ({
    from: historicalYearToSliderValue(years[index]),
    to: historicalYearToSliderValue(year),
    weight: years[index] >= 1800 ? 0.5 : 0.25,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.weight, 0);

  function yearToFraction(year: number): number {
    const value = Math.max(minimum, Math.min(maximum, historicalYearToSliderValue(year)));
    let offset = 0;
    for (const segment of segments) {
      if (value <= segment.to) {
        return (offset + segment.weight * (value - segment.from) / (segment.to - segment.from)) / total;
      }
      offset += segment.weight;
    }
    return 0;
  }

  function fractionToYear(fraction: number): number {
    const position = Math.max(0, Math.min(1, fraction)) * total;
    let offset = 0;
    for (const segment of segments) {
      if (position <= offset + segment.weight) {
        return sliderValueToHistoricalYear(Math.round(segment.from +
          (position - offset) / segment.weight * (segment.to - segment.from)));
      }
      offset += segment.weight;
    }
    return maxYear;
  }

  return { yearToFraction, fractionToYear, markers: years };
}
