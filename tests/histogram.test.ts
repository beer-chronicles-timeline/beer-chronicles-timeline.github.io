import test from "node:test";
import assert from "node:assert/strict";
import { buildHistogram, yearCoordinate } from "../src/lib/histogram";

test("round boundaries, inclusive limits, empty bins and clipped ends", () => {
  assert.deepEqual(buildHistogram([1852, 1853, 1859, 1860, 1869, 1882, 1883], 1853, 1882, 10), [
    { from: 1853, to: 1859, count: 2 },
    { from: 1860, to: 1869, count: 2 },
    { from: 1870, to: 1879, count: 0 },
    { from: 1880, to: 1882, count: 1 },
  ]);
});

test("BC to AD bins never introduce year zero", () => {
  const years = [-20, -11, -10, -1, 0, 1, 9, 10];
  assert.deepEqual(buildHistogram(years, -20, 10, 10), [
    { from: -20, to: -11, count: 2 },
    { from: -10, to: -1, count: 2 },
    { from: 1, to: 9, count: 2 },
    { from: 10, to: 10, count: 1 },
  ]);
  assert.deepEqual(buildHistogram(years, -1, 1, 1), [
    { from: -1, to: -1, count: 1 },
    { from: 1, to: 1, count: 1 },
  ]);
  assert.equal(yearCoordinate(1) - yearCoordinate(-1), 1);
});

test("single year and bin larger than range still count each entry once", () => {
  assert.deepEqual(buildHistogram([1900, 1900, 1901], 1900, 1900, 10), [
    { from: 1900, to: 1900, count: 2 },
  ]);
  assert.deepEqual(buildHistogram([], 1800, 1899, 1000), [
    { from: 1800, to: 1899, count: 0 },
  ]);
});

test("counts are conserved for several bin sizes and include no out-of-range years", () => {
  const years = Array.from({ length: 402 }, (_, index) => index - 201).filter((year) => year !== 0);
  for (const size of [1, 5, 10, 17, 100, 1000]) {
    const bins = buildHistogram(years, -153, 192, size);
    assert.equal(bins.reduce((sum, bin) => sum + bin.count, 0), 345);
    assert.equal(bins.reduce((sum, bin) => sum + yearCoordinate(bin.to) - yearCoordinate(bin.from) + 1, 0), 345);
  }
});

test("reject invalid ranges and bin sizes", () => {
  for (const size of [0, -1, 1.5, NaN, Infinity]) {
    assert.throws(() => buildHistogram([], 1800, 1900, size), RangeError);
  }
  assert.throws(() => buildHistogram([], 1900, 1800, 10), RangeError);
  assert.throws(() => buildHistogram([], 0, 1800, 10), RangeError);
});
