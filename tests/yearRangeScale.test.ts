import assert from "node:assert/strict";
import test from "node:test";
import { createYearRangeScale } from "../src/lib/yearRangeScale";

test("full historical range reserves half the track for years after 1800", () => {
  const scale = createYearRangeScale(-13000, 2026);
  for (const [year, fraction] of [[-13000, 0], [1500, 0.25], [1800, 0.5], [1913, 0.75], [2026, 1]]) {
    assert.equal(scale.yearToFraction(year), fraction);
    assert.equal(scale.fractionToYear(fraction), year);
  }
  assert.deepEqual(scale.markers, [-13000, 1500, 1800, 2026]);
  assert.equal(scale.fractionToYear(-1), -13000);
  assert.equal(scale.fractionToYear(2), 2026);
});

test("every selectable year round-trips monotonically, including BCE/CE and breakpoints", () => {
  const scale = createYearRangeScale(-13000, 2026);
  let previous = -1;
  for (let year = -13000; year <= 2026; year++) {
    if (year === 0) continue;
    const fraction = scale.yearToFraction(year);
    assert.ok(fraction > previous, String(year));
    assert.equal(scale.fractionToYear(fraction), year);
    previous = fraction;
  }
  for (let i = 0; i <= 10000; i++) {
    const year = scale.fractionToYear(i / 10000);
    assert.ok(Number.isInteger(year) && year !== 0 && year >= -13000 && year <= 2026);
  }
});

test("shorter available ranges omit absent periods and retain usable endpoints", () => {
  for (const [from, to] of [[-100, -1], [-1, 1], [1500, 2026], [1600, 1900], [1800, 2026], [1900, 2000], [1500, 1800]]) {
    const scale = createYearRangeScale(from, to);
    assert.equal(scale.yearToFraction(from), 0);
    assert.equal(scale.yearToFraction(to), 1);
    assert.equal(scale.fractionToYear(0), from);
    assert.equal(scale.fractionToYear(1), to);
    assert.ok(scale.markers.every((year) => year >= from && year <= to));
  }
  const single = createYearRangeScale(1800, 1800);
  assert.deepEqual(single.markers, [1800]);
  assert.equal(single.yearToFraction(1800), 0);
  assert.equal(single.fractionToYear(0.5), 1800);
});
