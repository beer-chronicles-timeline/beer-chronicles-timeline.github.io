import test from "node:test";
import assert from "node:assert/strict";
import { automaticHistogramBinSize, buildHistogram, yearCoordinate } from "../src/lib/histogram";

test("automatic sizing keeps modern detail and makes all history readable", () => {
  assert.equal(automaticHistogramBinSize(1800, 2026), 10);
  assert.equal(buildHistogram([], 1800, 2026, automaticHistogramBinSize(1800, 2026)).length, 23);
  assert.equal(automaticHistogramBinSize(-11000, 2026), 1000);
  assert.equal(buildHistogram([], -11000, 2026, automaticHistogramBinSize(-11000, 2026)).length, 14);
});

test("automatic sizing refines short ranges down to single years", () => {
  for (const [from, to] of [[1900, 1900], [1900, 1919], [-1, 1], [-20, -1]]) {
    assert.equal(automaticHistogramBinSize(from, to), 1);
    const bins = buildHistogram([from, to, 0], from, to, 1);
    assert.equal(bins.length, yearCoordinate(to) - yearCoordinate(from) + 1);
    assert.equal(bins.reduce((total, bin) => total + bin.count, 0), 2);
  }
});

test("automatic bins keep counts and full range coverage across historical eras", () => {
  for (const [from, to] of [[-11000, -1], [-11000, 2026], [-153, 192], [1853, 2026], [1, 2026]]) {
    const size = automaticHistogramBinSize(from, to);
    const bins = buildHistogram([from - 1, from, to, to + 1, 0], from, to, size);
    assert.ok(bins.length >= 10 && bins.length <= 30);
    assert.equal(bins[0].from, from);
    assert.equal(bins.at(-1)!.to, to);
    assert.equal(bins.reduce((total, bin) => total + bin.count, 0), 2);
    assert.equal(bins.reduce((total, bin) => total + yearCoordinate(bin.to) - yearCoordinate(bin.from) + 1, 0), yearCoordinate(to) - yearCoordinate(from) + 1);
  }
});

test("automatic sizing rejects invalid historical ranges", () => {
  for (const [from, to] of [[0, 2026], [-20, 0], [2000, 1900], [1.5, 2026], [NaN, 2026], [1, Infinity]]) {
    assert.throws(() => automaticHistogramBinSize(from, to), RangeError);
  }
});

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
