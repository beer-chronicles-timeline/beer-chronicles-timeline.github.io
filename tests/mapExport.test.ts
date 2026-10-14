import assert from "node:assert/strict";
import test from "node:test";
import { verifyMapExport } from "../scripts/check-publication-export";
import type { MapLocation } from "../src/lib/mapLocations";

const location: MapLocation = {
  id: "event-city", eventId: "event", eventTitle: "Name & \"quoted\" <place>",
  eventHref: "/events/event/title", eventDateLabel: "March 7, 2008",
  category: "Events", historicalYear: 2008,
  chronology: { event_date: "2008-03-07", historical_year: null },
  latitude: 39.9527237, longitude: -75.1635262, placeId: "city",
  placeName: "City", locationRole: "Host city", precision: "city",
};

function htmlFor(locations: MapLocation[]) {
  const data = `1:["$","Map",null,${JSON.stringify({ locations })}]\n`;
  return `<script>self.__next_f.push([1,${JSON.stringify(data).replaceAll("&", "\\u0026").replaceAll("<", "\\u003c").replaceAll(">", "\\u003e")}])</script>`;
}

test("map export verification handles escaped content without executing scripts", () => {
  assert.doesNotThrow(() => verifyMapExport(htmlFor([location]), [location]));
});

test("missing markers or wrong coordinates, precision, date, role, or URL block publication", () => {
  assert.throws(() => verifyMapExport(htmlFor([]), [location]), /Map export differs/);
  for (const change of [
    { latitude: 40 }, { longitude: -76 }, { precision: "exact" as const },
    { eventDateLabel: "2008" }, { locationRole: "Different role" }, { eventHref: "/wrong" },
  ]) assert.throws(() => verifyMapExport(htmlFor([{ ...location, ...change }]), [location]), /Map export differs/);
});
