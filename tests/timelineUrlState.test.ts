import assert from "node:assert/strict";
import test from "node:test";
import {
  parseTimelineUrlState,
  serializeTimelineUrlState,
} from "../src/components/timelineUrlState.ts";

const options = {
  minYear: -3000,
  maxYear: 2026,
  urlTags: [
    { id: "tag-porter", name: "Porter" },
    { id: "tag-hidden", name: "Hidden Tag" },
  ],
};

test("timeline URL parser returns the server-rendered default state", () => {
  assert.deepEqual(parseTimelineUrlState("", options), {
    activeCategory: null,
    startYear: -3000,
    endYear: 2026,
    selectedTagIds: [],
    tagFilterMode: "all",
    searchQuery: "",
    isOldestFirst: false,
  });
});

test("timeline URL parser restores every supported parameter", () => {
  assert.deepEqual(
    parseTimelineUrlState(
      "?category=Styles&from=1700&to=1900&tags=Porter%2CHidden+Tag&tagMode=any&string=dark+beer&order=oldest",
      options
    ),
    {
      activeCategory: "Styles",
      startYear: 1700,
      endYear: 1900,
      selectedTagIds: ["tag-porter", "tag-hidden"],
      tagFilterMode: "any",
      searchQuery: "dark beer",
      isOldestFirst: true,
    }
  );
});

test("timeline URL parser clamps and orders years and ignores unknown tags", () => {
  const state = parseTimelineUrlState(
    "?from=9999&to=-9999&tags=Unknown&tagMode=any",
    options
  );

  assert.equal(state.startYear, -3000);
  assert.equal(state.endYear, 2026);
  assert.deepEqual(state.selectedTagIds, []);
  assert.equal(state.tagFilterMode, "all");
});

test("timeline URL serializer preserves unrelated parameters and normalizes state", () => {
  const query = serializeTimelineUrlState(
    {
      activeCategory: "Styles",
      startYear: 1700,
      endYear: 2026,
      selectedTagIds: ["tag-hidden", "missing"],
      tagFilterMode: "any",
      searchQuery: "  dark beer  ",
      isOldestFirst: true,
    },
    "?ref=storyline&category=People&to=1900",
    options
  );
  const params = new URLSearchParams(query);

  assert.equal(params.get("ref"), "storyline");
  assert.equal(params.get("category"), "Styles");
  assert.equal(params.get("from"), "1700");
  assert.equal(params.has("to"), false);
  assert.equal(params.get("tags"), "Hidden Tag");
  assert.equal(params.get("tagMode"), "any");
  assert.equal(params.get("string"), "dark beer");
  assert.equal(params.get("order"), "oldest");
});
