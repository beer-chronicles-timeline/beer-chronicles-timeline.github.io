"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useCallback, useMemo, useState } from "react";
import type { MapLocation } from "@/lib/mapLocations";
import { buildMapPlaceGroups } from "@/lib/mapPlaceGroups";
import styles from "./MapExplorer.module.css";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading} role="status">
      Loading interactive map…
    </div>
  ),
});

type MapExplorerProps = {
  locations: readonly MapLocation[];
};

type PeriodFilter = "all" | "before-1800" | "1800-1945" | "after-1945";

function isInsidePeriod(
  location: MapLocation,
  period: PeriodFilter
): boolean {
  if (period === "all") return true;
  if (location.historicalYear === null) return false;
  if (period === "before-1800") return location.historicalYear < 1800;
  if (period === "1800-1945") {
    return location.historicalYear >= 1800 && location.historicalYear <= 1945;
  }
  return location.historicalYear > 1945;
}

export default function MapExplorer({ locations }: MapExplorerProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState("all");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSearchMessage, setPlaceSearchMessage] = useState("");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          locations
            .map((location) => location.category)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((first, second) => first.localeCompare(second)),
    [locations]
  );

  const visibleLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          isInsidePeriod(location, period) &&
          (category === "all" || location.category === category)
      ),
    [category, locations, period]
  );
  const allGroups = useMemo(() => buildMapPlaceGroups(locations), [locations]);
  const visibleGroups = useMemo(
    () => buildMapPlaceGroups(visibleLocations),
    [visibleLocations]
  );
  const selectedGroup = visibleGroups.find(
    (group) => group.placeId === selectedPlaceId
  );
  const visibleUniqueEntryCount = new Set(
    visibleLocations.map((location) => location.eventId)
  ).size;

  const handleSelectPlace = useCallback(
    (placeId: string) => {
      const group = allGroups.find(
        (candidate) => candidate.placeId === placeId
      );
      setSelectedPlaceId(placeId);
      setPlaceSearchMessage(
        group
          ? `${group.placeName} selected. ${group.locations.length} ${
              group.locations.length === 1 ? "entry" : "entries"
            } shown.`
          : "Reviewed place selected."
      );
    },
    [allGroups]
  );

  function handlePlaceSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = placeQuery.trim().toLocaleLowerCase();
    const group = allGroups.find(
      (candidate) =>
        candidate.placeName.toLocaleLowerCase() === normalizedQuery
    );

    if (!group) {
      setPlaceSearchMessage("Choose a reviewed place from the suggestions.");
      return;
    }

    setPeriod("all");
    setCategory("all");
    setSelectedPlaceId(group.placeId);
    setPlaceSearchMessage(
      `${group.placeName} selected. ${group.locations.length} ${
        group.locations.length === 1 ? "entry" : "entries"
      } shown.`
    );
  }

  return (
    <section aria-labelledby="map-explorer-heading" className="mt-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2
              id="map-explorer-heading"
              className="font-serif text-2xl font-semibold text-stone-900"
            >
              Map explorer
            </h2>
            <p className="mt-1 text-sm text-stone-600" aria-live="polite">
              {visibleUniqueEntryCount} mapped{" "}
              {visibleUniqueEntryCount === 1 ? "entry" : "entries"}
              {" · "}
              {visibleLocations.length} geographic{" "}
              {visibleLocations.length === 1 ? "connection" : "connections"}
              {" · "}
              {visibleGroups.length} reviewed{" "}
              {visibleGroups.length === 1 ? "place" : "places"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" aria-label="Map filters">
            <label className="grid gap-1 text-sm font-medium text-stone-700">
              Period
              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value as PeriodFilter)
                }
                disabled={locations.length === 0}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
              >
                <option value="all">All periods</option>
                <option value="before-1800">Before 1800</option>
                <option value="1800-1945">1800–1945</option>
                <option value="after-1945">After 1945</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium text-stone-700">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={locations.length === 0}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
              >
                <option value="all">All categories</option>
                {categories.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <form
          className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:items-end"
          onSubmit={handlePlaceSearch}
          role="search"
        >
          <label className="grid min-w-0 flex-1 gap-1 text-sm font-medium text-stone-700">
            Find a reviewed place
            <input
              type="search"
              list="beer-map-places"
              value={placeQuery}
              onChange={(event) => setPlaceQuery(event.target.value)}
              placeholder="Start typing a city, region, or country"
              autoComplete="off"
              className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
            <datalist id="beer-map-places">
              {allGroups.map((group) => (
                <option key={group.placeId} value={group.placeName} />
              ))}
            </datalist>
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
          >
            Show place
          </button>
          <p className="sr-only" role="status" aria-live="polite">
            {placeSearchMessage}
          </p>
        </form>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className={styles.mapFrame}>
            <MapCanvas
              groups={visibleGroups}
              focusedPlaceId={selectedPlaceId}
              onSelectPlace={handleSelectPlace}
            />

            {locations.length === 0 && (
              <div className={styles.emptyState}>
                <div className="rounded-xl border border-stone-200 bg-white/95 p-5 text-center shadow-md backdrop-blur-sm">
                  <h3 className="font-serif text-xl font-semibold text-stone-900">
                    No reviewed locations yet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Entries will appear here after their place, geographic
                    precision, and historical role have been reviewed. You can
                    still drag and zoom the map.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside
            className="rounded-xl border border-stone-200 bg-stone-50 p-5 max-sm:pb-16 max-sm:pr-16"
            aria-label="Selected map entry"
          >
            {selectedGroup ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Selected map location
                </p>
                <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-stone-900">
                  {selectedGroup.placeName}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {selectedGroup.locations.length}{" "}
                  {selectedGroup.locations.length === 1 ? "entry" : "entries"}
                </p>

                <div className="mt-5 max-h-96 overflow-y-auto border-t border-stone-200 pt-4">
                  <p className="text-xs capitalize text-stone-500">
                    {selectedGroup.precision} precision
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {selectedGroup.locationRole}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {selectedGroup.locations.map((location) => (
                      <li key={location.id}>
                        <Link
                          href={location.eventHref}
                          className="font-serif font-semibold leading-snug text-stone-900 underline decoration-stone-300 underline-offset-2 transition hover:decoration-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
                        >
                          {location.eventTitle}
                        </Link>
                        <p className="mt-1 text-xs text-stone-600">
                          {location.eventDateLabel}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  Select a location
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Search for a reviewed place or choose a single-place marker
                  to see its entries, location role, and precision. Markers
                  containing multiple places zoom the map instead of opening a
                  very large result list.
                </p>
                <div className="mt-6 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-600">
                  Approximate regional locations use a dashed marker so they
                  are not mistaken for exact sites.
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
