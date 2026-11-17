import test from "node:test";
import assert from "node:assert/strict";
import { BJCP_2021_CATEGORIES, BJCP_2021_STYLES, buildBjcpCoverage, filterBjcpCoverage, getBjcpCoverageTotals } from "../src/lib/bjcpCoverage";
import type { TimelineEvent } from "../src/lib/types";

function event(id: string, tags: string[], fields: Partial<TimelineEvent> = {}): TimelineEvent {
  return { id, title: id, description: null, event_date: "2000-01-01", historical_year: null, date_precision: "year", image_url: null, created_at: null, tags: tags.map(name => ({ id: name, name })), ...fields };
}
const row = (events: TimelineEvent[], id: string) => buildBjcpCoverage(events).flatMap(category => category.styles).find(style => style.id === id)!;

test("the 2021 catalog includes every main category, named variants, and Appendix B", () => {
  assert.deepEqual(BJCP_2021_CATEGORIES.slice(0, 34).map(category => category.id), Array.from({ length: 34 }, (_, i) => String(i + 1)));
  assert.equal(BJCP_2021_STYLES.length, 128);
  assert.equal(new Set(BJCP_2021_STYLES.map(style => style.id)).size, 128);
  assert.equal(BJCP_2021_STYLES.filter(style => style.categoryId === "appendix-b").length, 5);
  assert.equal(BJCP_2021_STYLES.filter(style => style.categoryId === "27").length, 9);
  assert.equal(BJCP_2021_STYLES.filter(style => style.code === "21B").length, 8);
  assert.ok(BJCP_2021_STYLES.every(style => style.url.startsWith("https://www.bjcp.org/") && style.tagNames.length > 0 && BJCP_2021_CATEGORIES.some(category => category.id === style.categoryId)));
});

test("counts distinct entries once despite multiple equivalent style tags", () => {
  const entry = event("imperial", ["Imperial Stout", "Russian Imperial Stout"]);
  assert.equal(row([entry, entry], "imperial-stout").entries.length, 1);
  assert.deepEqual(row([event("hazy", ["New England IPA"])], "hazy-ipa").entries.map(entry => entry.id), ["hazy"]);
  assert.equal(row([event("traditional", ["Grodziskie"])], "historical-beer-piwo-grodziskie").entries.length, 1);
});

test("broad family tags, brewery names, geography and descriptive mentions cannot assign styles", () => {
  const broad = event("broad", ["IPA", "Lager", "Pils", "Pale Ale", "Porter", "Stout", "Wheat Beer", "Bock", "Barley Wine", "Rye Beer", "Smoked Beer", "USA", "Germany", "Guinness", "Duvel"], { title: "Munich Helles", description: "American IPA, German Pils and Weizenbock." });
  assert.equal(getBjcpCoverageTotals(buildBjcpCoverage([broad])).entries, 0);
});

test("equivalent tags tolerate accents and case without substring matching", () => {
  assert.equal(row([event("cologne", ["  KOLSCH "])], "kolsch").entries.length, 1);
  assert.equal(row([event("false", ["Altbier festival organizers"])], "altbier").entries.length, 0);
});

test("the Specialty IPA entry category rolls up its named variants without duplicates", () => {
  const entries = [event("black", ["Black IPA", "Specialty IPA"]), event("red", ["Red IPA"]), event("plain", ["IPA"])];
  assert.deepEqual(row(entries, "specialty-ipa").entries.map(entry => entry.id).sort(), ["black", "red"]);
  assert.equal(row(entries, "specialty-ipa-black-ipa").entries.length, 1);
  assert.equal(row(entries, "specialty-ipa-brown-ipa").entries.length, 0);
});

test("an entry may contribute to related profiles while totals stay distinct", () => {
  const coverage = buildBjcpCoverage([event("italian", ["Italian Grape Ale"]), event("other", ["Sahti"])]);
  const totals = getBjcpCoverageTotals(coverage);
  assert.equal(totals.covered, 3);
  assert.equal(totals.entries, 2);
});

test("zero-count styles remain visible and filtering can expose the gaps", () => {
  const coverage = buildBjcpCoverage([event("coopers", ["Australian Sparkling Ale"])]);
  assert.equal(getBjcpCoverageTotals(coverage).profiles, 128);
  assert.deepEqual(filterBjcpCoverage(coverage, "12B", "all").flatMap(category => category.styles).map(style => style.name), ["Australian Sparkling Ale"]);
  assert.equal(filterBjcpCoverage(coverage, "", "covered").flatMap(category => category.styles).length, 1);
  assert.equal(filterBjcpCoverage(coverage, "", "uncovered").flatMap(category => category.styles).length, 127);
  assert.equal(filterBjcpCoverage(coverage, "not a beer style", "all").length, 0);
  assert.equal(filterBjcpCoverage(coverage, "kolsch", "all")[0].styles[0].name, "Kölsch");
});

test("entry lists preserve exact canonical links and historical date labels in newest-first order", () => {
  const entries = [event("old", ["Sahti"], { event_date: "1780-04-05", date_precision: "date" }), event("new", ["Sahti"], { title: "A New Release", event_date: "2023-12-13", date_precision: "date" })];
  const listed = row(entries, "historical-beer-sahti").entries;
  assert.deepEqual(listed.map(entry => entry.id), ["new", "old"]);
  assert.equal(listed[0].href, "/events/new/a-new-release");
  assert.equal(listed[0].dateLabel, "December 13, 2023");
  assert.equal(listed[1].dateLabel, "April 5, 1780");
});
