import assert from "node:assert/strict";
import test from "node:test";
import { filterTimelineEvents } from "../src/components/timelineFiltering.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

const events: TimelineEvent[] = ["Laško", "Žalec", "Schüttinger"].map((title) => ({
  id: title,
  title,
  description: "Search fixture with café in the description",
  event_date: null,
  historical_year: 2000,
  image_url: null,
  created_at: null,
  category: "Events",
  tags: [{ id: "tag", name: "Example" }],
}));

const options = {
  events,
  activeCategory: null,
  startYear: 1800,
  endYear: 2026,
  selectedTagIds: [],
  isOldestFirst: true,
  searchQuery: "",
};

test("timeline matching ignores accents and case without changing displayed text", () => {
  for (const [query, title] of [["Lasko", "Laško"], ["ZALEC", "Žalec"], ["Schuttinger", "Schüttinger"], ["Laško", "Laško"]]) {
    const result = filterTimelineEvents({ ...options, searchQuery: query });
    assert.deepEqual(result.map((event) => event.title), [title]);
    assert.equal(result[0], events.find((event) => event.title === title));
  }
});

test("accent-insensitive search retains all-token matching and other filters", () => {
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "  lasko CAFE  " }).length, 1);
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "lasko missing" }).length, 0);
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "lasko", endYear: 1900 }).length, 0);
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "lasko", activeCategory: "Other" }).length, 0);
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "lasko", selectedTagIds: ["missing"] }).length, 0);
  assert.equal(filterTimelineEvents({ ...options, searchQuery: "  " }).length, events.length);
});
