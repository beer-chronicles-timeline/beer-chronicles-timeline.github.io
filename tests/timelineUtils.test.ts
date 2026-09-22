import assert from "node:assert/strict";
import test from "node:test";
import {
  compareEventsChronologicallyAscending,
  compareEventsChronologicallyDescending,
  formatEventDate,
  getEventChronologicalSortValue,
  getEventTimelineYear,
  getRelatedEvents,
} from "../src/components/timelineUtils.ts";
import type {
  DatePrecision,
  TimelineEvent,
} from "../src/lib/types.ts";

function createEvent({
  id,
  eventDate = null,
  historicalYear = null,
  datePrecision = "year",
  category = null,
  tags = [],
}: {
  id: string;
  eventDate?: string | null;
  historicalYear?: number | null;
  datePrecision?: DatePrecision | null;
  category?: string | null;
  tags?: TimelineEvent["tags"];
}): TimelineEvent {
  return {
    id,
    title: id,
    description: null,
    event_date: eventDate,
    historical_year: historicalYear,
    image_url: null,
    created_at: null,
    category,
    date_precision: datePrecision,
    sources: null,
    tags,
  };
}

test("formats an ordinary CE exact date unchanged", () => {
  const event = createEvent({
    id: "ordinary-ce-date",
    eventDate: "2026-07-31",
    datePrecision: "date",
  });

  assert.equal(formatEventDate(event), "July 31, 2026");
});

test("formats an existing PostgreSQL BCE exact date unchanged", () => {
  const event = createEvent({
    id: "existing-bce-date",
    eventDate: "0449-01-01 BC",
    datePrecision: "date",
  });

  assert.equal(formatEventDate(event), "January 1, 450 BC");
  assert.equal(getEventTimelineYear(event), -450);
});

test("formats prehistoric integer years", () => {
  const event = createEvent({
    id: "prehistoric-year",
    historicalYear: -11000,
    datePrecision: "year",
  });

  assert.equal(formatEventDate(event), "11,000 BCE");
  assert.equal(getEventTimelineYear(event), -11000);
});

test("formats prehistoric decades", () => {
  const event = createEvent({
    id: "prehistoric-decade",
    historicalYear: -450,
    datePrecision: "decade",
  });

  assert.equal(formatEventDate(event), "450s BCE");
});

test("formats historical-year decade boundaries without year zero", () => {
  const cases = [
    [-11, "20s BCE"],
    [-10, "10s BCE"],
    [-9, "10s BCE"],
    [-1, "10s BCE"],
    [1, "10s"],
    [9, "10s"],
    [10, "10s"],
    [11, "20s"],
  ] as const;

  cases.forEach(([historicalYear, expected]) => {
    const event = createEvent({
      id: `decade-${historicalYear}`,
      historicalYear,
      datePrecision: "decade",
    });

    assert.equal(
      formatEventDate(event),
      expected,
      `Unexpected decade for ${historicalYear}`
    );
  });
});

test("formats historical-year century boundaries", () => {
  const cases = [
    [-11000, "c. 11,000 BCE"],
    [-10901, "c. 11,000 BCE"],
    [-10900, "c. 10,900 BCE"],
    [-9900, "99th century BCE"],
    [-100, "1st century BCE"],
    [-1, "1st century BCE"],
    [1, "1st century"],
    [100, "1st century"],
    [101, "2nd century"],
    [1700, "17th century"],
    [1701, "18th century"],
  ] as const;

  cases.forEach(([historicalYear, expected]) => {
    const event = createEvent({
      id: `century-${historicalYear}`,
      historicalYear,
      datePrecision: "century",
    });

    assert.equal(
      formatEventDate(event),
      expected,
      `Unexpected century for ${historicalYear}`
    );
  });
});

test("formats date-backed very ancient centuries as approximate years", () => {
  const event = createEvent({
    id: "date-backed-very-ancient-century",
    eventDate: "10999-01-01 BC",
    datePrecision: "century",
  });

  assert.equal(formatEventDate(event), "c. 11,000 BCE");
});

test("safely handles historical years with date or month precision", () => {
  const exactDatePrecision = createEvent({
    id: "historical-exact",
    historicalYear: -11000,
    datePrecision: "date",
  });

  const monthPrecision = createEvent({
    id: "historical-month",
    historicalYear: -11000,
    datePrecision: "month",
  });

  assert.equal(formatEventDate(exactDatePrecision), "11,000 BCE");
  assert.equal(formatEventDate(monthPrecision), "11,000 BCE");
});

test("does not produce a year zero", () => {
  const oneBce = createEvent({
    id: "one-bce",
    historicalYear: -1,
    datePrecision: "year",
  });

  const oneCe = createEvent({
    id: "one-ce",
    historicalYear: 1,
    datePrecision: "year",
  });

  assert.equal(formatEventDate(oneBce), "1 BCE");
  assert.equal(formatEventDate(oneCe), "1");
  assert.notEqual(formatEventDate(oneBce), "0");
  assert.notEqual(formatEventDate(oneCe), "0");
  assert.ok(
    getEventChronologicalSortValue(oneBce) <
      getEventChronologicalSortValue(oneCe)
  );
});

test("handles missing chronology safely", () => {
  const event = createEvent({
    id: "missing-date",
    eventDate: null,
    historicalYear: null,
  });

  assert.equal(formatEventDate(event), "");
  assert.equal(getEventTimelineYear(event), null);
  assert.equal(
    getEventChronologicalSortValue(event),
    Number.NEGATIVE_INFINITY
  );
});

test("sorts seamlessly across prehistoric BCE and CE years", () => {
  const events = [
    createEvent({
      id: "2026-ce",
      historicalYear: 2026,
    }),
    createEvent({
      id: "1-bce",
      historicalYear: -1,
    }),
    createEvent({
      id: "8000-bce",
      historicalYear: -8000,
    }),
    createEvent({
      id: "500-ce",
      historicalYear: 500,
    }),
    createEvent({
      id: "11000-bce",
      historicalYear: -11000,
    }),
    createEvent({
      id: "1-ce",
      historicalYear: 1,
    }),
  ];

  const ascendingIds = [...events]
    .sort(compareEventsChronologicallyAscending)
    .map((event) => event.id);

  assert.deepEqual(ascendingIds, [
    "11000-bce",
    "8000-bce",
    "1-bce",
    "1-ce",
    "500-ce",
    "2026-ce",
  ]);
});

test("supports oldest and newest ordering", () => {
  const events = [
    createEvent({
      id: "modern",
      eventDate: "2026-01-01",
    }),
    createEvent({
      id: "ancient",
      eventDate: "0000-01-01 BC",
    }),
    createEvent({
      id: "prehistoric",
      historicalYear: -11000,
    }),
  ];

  const oldestFirst = [...events]
    .sort(compareEventsChronologicallyAscending)
    .map((event) => event.id);

  const newestFirst = [...events]
    .sort(compareEventsChronologicallyDescending)
    .map((event) => event.id);

  assert.deepEqual(oldestFirst, [
    "prehistoric",
    "ancient",
    "modern",
  ]);

  assert.deepEqual(newestFirst, [
    "modern",
    "ancient",
    "prehistoric",
  ]);
});

test("shared specific tags rank ahead of same-category fallback entries", () => {
  const earlyHistoryTag = { id: "early", name: "Early Beer History" };
  const scienceTag = { id: "science", name: "Science" };
  const current = createEvent({
    id: "prehistoric",
    historicalYear: -11000,
    category: "Science",
    tags: [earlyHistoryTag, scienceTag],
  });
  const relatedAncient = createEvent({
    id: "related-ancient",
    historicalYear: -8000,
    category: "Events",
    tags: [earlyHistoryTag],
  });
  const unrelatedModernScience = createEvent({
    id: "modern-science",
    historicalYear: 2018,
    category: "Science",
    tags: [scienceTag],
  });

  assert.deepEqual(
    getRelatedEvents(current, [
      current,
      unrelatedModernScience,
      relatedAncient,
    ]).map((event) => event.id),
    ["related-ancient", "modern-science"]
  );
});

test("generic tags alone do not match entries in different categories", () => {
  const scienceTag = { id: "science", name: "Science" };
  const current = createEvent({
    id: "current",
    historicalYear: 1900,
    category: "Science",
    tags: [scienceTag],
  });
  const candidate = createEvent({
    id: "candidate",
    historicalYear: 1901,
    category: "Events",
    tags: [scienceTag],
  });

  assert.deepEqual(getRelatedEvents(current, [current, candidate]), []);
});

test("shared tag count outranks Storyline membership, rarity, category, and date", () => {
  const paleAle = { id: "pale", name: "Pale Ale" };
  const local = { id: "local", name: "Local topic" };
  const technique = { id: "technique", name: "Technique" };
  const current = createEvent({ id: "current", historicalYear: 2000, category: "Breweries", tags: [paleAle, local, technique] });
  const storylineMatch = createEvent({ id: "storyline", historicalYear: 2000, category: "Breweries", tags: [paleAle] });
  const twoTags = createEvent({ id: "two-tags", historicalYear: 1800, category: "Science", tags: [local, technique] });
  const commonTags = [1, 2, 3].map((n) => createEvent({ id: `common-${n}`, historicalYear: 1700, tags: [local] }));

  assert.deepEqual(
    getRelatedEvents(current, [storylineMatch, twoTags, ...commonTags]).map((event) => event.id),
    ["two-tags", "storyline", "common-1"]
  );
});

test("equal tag counts favor rarer shared tags before closer dates", () => {
  const common = { id: "common", name: "Common topic" };
  const rare = { id: "rare", name: "Rare topic" };
  const current = createEvent({ id: "current", historicalYear: 2000, tags: [common, rare] });
  const rareMatch = createEvent({ id: "rare-match", historicalYear: 1800, tags: [rare] });
  const nearMatch = createEvent({ id: "near", historicalYear: 2001, tags: [common] });
  const farMatch = createEvent({ id: "far", historicalYear: 1950, tags: [common] });

  assert.deepEqual(
    getRelatedEvents(current, [farMatch, nearMatch, rareMatch]).map((event) => event.id),
    ["rare-match", "near", "far"]
  );
});

test("fallback fills remaining places by category and date, with unknown dates last", () => {
  const specific = { id: "specific", name: "Specific topic" };
  const current = createEvent({ id: "current", historicalYear: 2000, category: "Events", tags: [specific] });
  const match = createEvent({ id: "match", historicalYear: 1000, category: "Science", tags: [specific] });
  const near = createEvent({ id: "near", eventDate: "2001-01-01", category: "Events" });
  const far = createEvent({ id: "far", historicalYear: 1950, category: "Events" });
  const undated = createEvent({ id: "undated", category: "Events" });
  const other = createEvent({ id: "other", historicalYear: 2000, category: "Science" });

  assert.deepEqual(
    getRelatedEvents(current, [undated, far, other, near, match]).map((event) => event.id),
    ["match", "near", "far"]
  );
  assert.deepEqual(
    getRelatedEvents(current, [undated, other, near]).map((event) => event.id),
    ["near", "undated"]
  );
  assert.deepEqual(getRelatedEvents({ ...current, category: null }, [other, near]), []);
});

test("three specific matches leave no slot for a same-category fallback", () => {
  const topic = { id: "topic", name: "Specific topic" };
  const current = createEvent({ id: "current", historicalYear: 2000, category: "Events", tags: [topic] });
  const matches = [1800, 1850, 1900].map((year) => createEvent({ id: String(year), historicalYear: year, tags: [topic] }));
  const fallback = createEvent({ id: "fallback", historicalYear: 2000, category: "Events" });

  assert.deepEqual(
    getRelatedEvents(current, [fallback, ...matches]).map((event) => event.id),
    ["1900", "1850", "1800"]
  );
});

test("ranking deduplicates tags and entries and stays stable without mutating inputs", () => {
  const first = { id: "first", name: "First topic" };
  const second = { id: "second", name: "Second topic" };
  const current = createEvent({ id: "current", historicalYear: 2000, tags: [first, second] });
  const repeatedTag = createEvent({ id: "repeated", historicalYear: 2000, tags: [first, first, first] });
  const a = createEvent({ id: "a", tags: [first, second] });
  const b = createEvent({ id: "b", tags: [second, first] });
  const events = [current, repeatedTag, b, a, b];
  const before = structuredClone(events);
  const expected = ["a", "b", "repeated"];

  assert.deepEqual(getRelatedEvents(current, events).map((event) => event.id), expected);
  assert.deepEqual(getRelatedEvents(current, [...events].reverse()).map((event) => event.id), expected);
  assert.deepEqual(events, before);
  assert.deepEqual(getRelatedEvents(current, []), []);
});

test("date proximity crosses BCE and CE without introducing year zero", () => {
  const current = createEvent({ id: "current", historicalYear: 1, category: "Events" });
  const before = createEvent({ id: "before", historicalYear: -1, category: "Events" });
  const after = createEvent({ id: "after", historicalYear: 2, category: "Events" });

  assert.deepEqual(
    getRelatedEvents(current, [after, before]).map((event) => event.id),
    ["before", "after"]
  );
});
