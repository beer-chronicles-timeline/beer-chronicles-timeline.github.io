import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MapPlaceIndex from "../src/components/MapPlaceIndex.tsx";
import { buildMapPlaceGroups, findMapPlaceGroups } from "../src/lib/mapPlaceGroups.ts";
import {
  buildMapLocations,
  type MapLocation,
} from "../src/lib/mapLocations.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

const locations: MapLocation[] = [
  {
    id: "older-place",
    eventId: "older",
    eventTitle: "Older event",
    eventHref: "/events/older/older-event",
    eventDateLabel: "1900",
    category: "Events",
    historicalYear: 1900,
    chronology: { event_date: null, historical_year: 1900 },
    latitude: 1,
    longitude: 2,
    placeId: "place",
    placeName: "Example Place",
    locationRole: "Reviewed place",
    precision: "city",
  },
  {
    id: "newer-place",
    eventId: "newer",
    eventTitle: "Newer event",
    eventHref: "/events/newer/newer-event",
    eventDateLabel: "2000",
    category: "Events",
    historicalYear: 2000,
    chronology: { event_date: null, historical_year: 2000 },
    latitude: 1,
    longitude: 2,
    placeId: "place",
    placeName: "Example Place",
    locationRole: "Reviewed place",
    precision: "city",
  },
  {
    id: "alpha-alpha",
    eventId: "alpha",
    eventTitle: "Alpha event",
    eventHref: "/events/alpha/alpha-event",
    eventDateLabel: "1950",
    category: "Events",
    historicalYear: 1950,
    chronology: { event_date: null, historical_year: 1950 },
    latitude: 3,
    longitude: 4,
    placeId: "alpha",
    placeName: "Alpha Place",
    locationRole: "Reviewed place",
    precision: "region",
  },
];

test("groups reviewed map locations by place and sorts places alphabetically", () => {
  const groups = buildMapPlaceGroups(locations);

  assert.deepEqual(
    groups.map((group) => group.placeName),
    ["Alpha Place", "Example Place"]
  );
  assert.deepEqual(
    groups[1].locations.map((location) => location.eventId),
    ["newer", "older"]
  );
});

test("does not mutate the input location order", () => {
  buildMapPlaceGroups(locations);

  assert.deepEqual(
    locations.map((location) => location.eventId),
    ["older", "newer", "alpha"]
  );
});

test("map groups and the fallback index use full event dates within a year", () => {
  // Synthetic date fixtures using two existing Bremen map assignment IDs.
  const events: TimelineEvent[] = [
    { id: "f0ecf113-8d04-4020-8776-a0013a6d531f", title: "May fixture", event_date: "2015-05-01" },
    { id: "416e2437-3334-453f-8e11-77b3000572a2", title: "December fixture", event_date: "2015-12-01" },
  ].map((event) => ({
    ...event,
    description: null,
    historical_year: null,
    date_precision: "month",
    image_url: null,
    created_at: null,
  }));
  const mapped = buildMapLocations(events);
  const before = structuredClone(mapped);
  const [group] = buildMapPlaceGroups(mapped);

  assert.deepEqual(group.locations.map((location) => location.eventId), [events[1].id, events[0].id]);
  assert.deepEqual(buildMapPlaceGroups([...mapped].reverse())[0].locations, group.locations);
  assert.deepEqual(mapped, before);

  const html = renderToStaticMarkup(createElement(MapPlaceIndex, { locations: mapped }));
  assert.ok(html.includes(`href="${group.locations[0].eventHref}"`));
  assert.ok(!html.includes(`href="${group.locations[1].eventHref}"`));
});

test("map chronology preserves day precision, historical years, BCE order, and undated entries", () => {
  const fixtures = [
    { id: "undated", event_date: null, historical_year: null },
    { id: "earlier-day", event_date: "2015-12-02", historical_year: null },
    { id: "later-day", event_date: "2015-12-20", historical_year: null },
    { id: "year-only", event_date: null, historical_year: 2015 },
    { id: "bce-date", event_date: "0000-12-01 BC", historical_year: null },
    { id: "ancient", event_date: null, historical_year: -11000 },
    { id: "historical-year-priority", event_date: "2026-01-01", historical_year: -500 },
  ];
  const mapped = fixtures.map(({ id, ...chronology }) => ({
    ...locations[0],
    id,
    chronology,
  }));

  assert.deepEqual(
    buildMapPlaceGroups(mapped)[0].locations.map((location) => location.id),
    ["later-day", "earlier-day", "year-only", "bce-date", "historical-year-priority", "ancient", "undated"]
  );
});

test("keeps distinct historical roles on entries rather than on the place group", () => {
  const roles = ["Home city; production elsewhere", "Place of introduction"];
  const [group] = buildMapPlaceGroups(
    locations.slice(0, 2).map((location, index) => ({
      ...location,
      locationRole: roles[index],
    }))
  );

  assert.equal(group.precision, "city");
  assert.equal("locationRole" in group, false);
  assert.deepEqual(group.locations.map((location) => location.locationRole), roles.toReversed());
});

test("place search accepts partial and accent-insensitive matches without resolving ambiguity", () => {
  const groups = ["Bremen, Germany", "Laško, Slovenia", "Žalec, Slovenia"].map(
    (placeName, index) => ({
      ...buildMapPlaceGroups(locations)[0],
      placeId: String(index),
      placeName,
    })
  );
  assert.deepEqual(findMapPlaceGroups(groups, " bremen "), [groups[0]]);
  assert.deepEqual(findMapPlaceGroups(groups, "LASKO"), [groups[1]]);
  assert.deepEqual(findMapPlaceGroups(groups, "Zalec"), [groups[2]]);
  assert.deepEqual(findMapPlaceGroups(groups, "Slovenia"), groups.slice(1));
  assert.deepEqual(findMapPlaceGroups(groups, ""), []);
  assert.deepEqual(findMapPlaceGroups(groups, "unmatched"), []);
  const longerName = { ...groups[0], placeId: "longer", placeName: "Near Bremen, Germany" };
  assert.deepEqual(findMapPlaceGroups([...groups, longerName], "Bremen, Germany"), [groups[0]]);
});

test("maps the four reviewed location-tag entries with supported precision", () => {
  const events: TimelineEvent[] = [
    ["2f4c9537-d65e-431a-8247-1d139519bf3c", "Thomas Tyrell"],
    ["e2eec07c-37b5-4a69-af4e-314acba829d6", "Sudden Death"],
    ["7f17d369-7120-4614-b6b6-8740a2f4e1cf", "Vienna Lager"],
    ["2adad940-15db-4407-83dd-62383d2b93a5", "ATP label"],
  ].map(([id, title]) => ({
    id,
    title,
    description: "Existing description",
    event_date: "2000-01-01",
    historical_year: null,
    image_url: null,
    created_at: null,
    tags: [],
  }));

  const mapped = buildMapLocations(events);

  assert.deepEqual(
    mapped.map(({ eventId, placeName, precision, locationRole }) => ({
      eventId,
      placeName,
      precision,
      locationRole,
    })),
    [
      {
        eventId: "2f4c9537-d65e-431a-8247-1d139519bf3c",
        placeName: "Gutshof Börnicke, Bernau bei Berlin, Germany",
        precision: "exact",
        locationRole: "First brewing site stated in entry",
      },
      {
        eventId: "e2eec07c-37b5-4a69-af4e-314acba829d6",
        placeName: "Timmendorfer Strand, Germany",
        precision: "city",
        locationRole: "Founding municipality supported by entry sources",
      },
      {
        eventId: "7f17d369-7120-4614-b6b6-8740a2f4e1cf",
        placeName: "United States",
        precision: "country",
        locationRole: "Country of the organization issuing the guidelines",
      },
      {
        eventId: "2adad940-15db-4407-83dd-62383d2b93a5",
        placeName: "Malle, Belgium",
        precision: "city",
        locationRole: "Seat of the International Trappist Association",
      },
    ]
  );
});
