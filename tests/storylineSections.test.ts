import assert from "node:assert/strict";
import test from "node:test";
import { getStorylineDateSections } from "../src/lib/storylineSections.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

function milestone(year: number, index: number): TimelineEvent {
  return {
    id: `milestone-${index}`,
    title: `Existing milestone ${index}`,
    description: "Existing content",
    historical_year: year,
    event_date: null,
    image_url: null,
    created_at: null,
  };
}

test("small Storylines stay flat; larger sections preserve every event and its order", () => {
  const events = Object.freeze(Array.from({ length: 82 }, (_, i) => Object.freeze(milestone(1900 + i, i))));
  assert.deepEqual(getStorylineDateSections(events.slice(0, 39)), []);
  const sections = getStorylineDateSections(events);
  assert.deepEqual(sections.map((section) => section.events.length), [25, 25, 32]);
  assert.deepEqual(sections.map((section) => section.startIndex), [0, 25, 50]);
  assert.deepEqual(sections.map((section) => section.label), ["1900–1924", "1925–1949", "1950–1981"]);
  sections.flatMap((section) => section.events).forEach((event, i) => assert.equal(event, events[i]));
});

test("a year is never split across date ranges", () => {
  const years = [
    ...Array.from({ length: 20 }, (_, i) => 1900 + i),
    ...Array<number>(12).fill(1920),
    ...Array.from({ length: 20 }, (_, i) => 1921 + i),
  ];
  const sections = getStorylineDateSections(years.map(milestone));
  assert.deepEqual(sections.map((section) => section.events.length), [32, 20]);
  assert.deepEqual(sections.map((section) => section.label), ["1900–1920", "1921–1940"]);
});

test("BCE and crossing-era ranges use the established chronology including BC date storage", () => {
  const years = [...Array.from({ length: 30 }, (_, i) => i - 30), ...Array.from({ length: 10 }, (_, i) => i + 1)];
  const events = years.map((year, i) => ({
    ...milestone(year, i),
    historical_year: null,
    event_date: year < 0
      ? `${String(-year - 1).padStart(4, "0")}-01-01 BC`
      : `${String(year).padStart(4, "0")}-01-01`,
  }));
  const sections = getStorylineDateSections(events);
  assert.deepEqual(sections.map((section) => section.label), ["30–6 BCE", "5 BCE–10 CE"]);
  assert.deepEqual(sections.map((section) => section.id), ["milestones-bce-30", "milestones-bce-5"]);
});

test("single-year groups have simple labels and one-year-only Storylines stay flat", () => {
  const events = Array.from({ length: 40 }, (_, i) => milestone(i < 25 ? 1900 : 1901, i));
  assert.deepEqual(getStorylineDateSections(events).map((section) => section.label), ["1900", "1901"]);
  assert.deepEqual(getStorylineDateSections(events.map((event) => ({ ...event, historical_year: -100 }))), []);
});

test("an undated milestone retains the original flat list", () => {
  const events = Array.from({ length: 50 }, (_, i) => milestone(1900 + i, i));
  events[30].historical_year = null;
  assert.deepEqual(getStorylineDateSections(events), []);
});

test("appending a later milestone leaves existing date anchors stable", () => {
  const events = Array.from({ length: 70 }, (_, i) => milestone(1900 + i, i));
  const anchors = getStorylineDateSections(events).map((section) => section.id);
  assert.deepEqual(getStorylineDateSections([...events, milestone(1970, 70)]).map((section) => section.id), anchors);
});
