import Link from "next/link";
import type { MapLocation } from "@/lib/mapLocations";
import { buildMapPlaceGroups } from "@/lib/mapPlaceGroups";

export default function MapPlaceIndex({
  locations,
}: {
  locations: readonly MapLocation[];
}) {
  const groups = buildMapPlaceGroups(locations);

  return (
    <section
      aria-labelledby="map-place-index-heading"
      className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2
        id="map-place-index-heading"
        className="font-serif text-2xl font-semibold text-stone-900"
      >
        Browse reviewed places
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
        This server-rendered index keeps the map’s reviewed places and event
        pages available when the interactive map cannot load. Each place links
        to its most recent mapped entry.
      </p>

      <details className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <summary className="cursor-pointer font-medium text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2">
          Show all {groups.length} reviewed places
        </summary>
        <ul className="mt-4 grid gap-x-8 gap-y-3 border-t border-stone-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const representativeEntry = group.locations[0];
            return (
              <li key={group.placeId} className="min-w-0 text-sm">
                <Link
                  href={representativeEntry.eventHref}
                  className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 transition hover:decoration-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
                >
                  {group.placeName}
                </Link>
                <span className="ml-2 text-stone-500">
                  {group.locations.length}{" "}
                  {group.locations.length === 1 ? "entry" : "entries"}
                </span>
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
