import assert from "node:assert/strict";
import test from "node:test";
import {
  compareEventsChronologicallyAscending,
  compareEventsChronologicallyDescending,
  formatEventDate,
  getEventChronologicalSortValue,
  getEventTimelineYear,
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
}: {
  id: string;
  eventDate?: string | null;
  historicalYear?: number | null;
  datePrecision?: DatePrecision | null;
}): TimelineEvent {
  return {
    id,
    title: id,
    description: null,
    event_date: eventDate,
    historical_year: historicalYear,
    image_url: null,
    created_at: null,
    category: null,
    date_precision: datePrecision,
    sources: null,
    tags: [],
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

test("formats historical-year century boundaries", () => {
  const cases = [
    [-11000, "110th century BCE"],
    [-10901, "110th century BCE"],
    [-10900, "109th century BCE"],
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