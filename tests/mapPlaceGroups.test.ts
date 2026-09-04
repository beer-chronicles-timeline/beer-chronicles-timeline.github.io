import assert from "node:assert/strict";
import test from "node:test";
import { buildMapPlaceGroups } from "../src/lib/mapPlaceGroups.ts";
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
