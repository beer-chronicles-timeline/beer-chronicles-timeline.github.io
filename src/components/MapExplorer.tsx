"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  type Map as MapLibreMap,
  type Marker,
} from "maplibre-gl";
import type { MapLocation } from "@/lib/mapLocations";
import styles from "./MapExplorer.module.css";

type MapExplorerProps = {
  locations: readonly MapLocation[];
};

type MapLocationGroup = {
  placeId: string;
  placeName: string;
  latitude: number;
  longitude: number;
  precision: MapLocation["precision"];
  locationRole: string;
  locations: MapLocation[];
};

type MapMarkerGroup = {
  latitude: number;
  longitude: number;
  placeGroups: MapLocationGroup[];
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

function clusterVisibleGroups(
  groups: MapLocationGroup[],
  map: MapLibreMap
): MapMarkerGroup[] {
  const clusters: MapMarkerGroup[] = [];

  groups.forEach((group) => {
    const point = map.project([group.longitude, group.latitude]);
    const nearbyCluster = clusters.find((cluster) => {
      const clusterPoint = map.project([
        cluster.longitude,
        cluster.latitude,
      ]);
      return Math.hypot(point.x - clusterPoint.x, point.y - clusterPoint.y) < 48;
    });

    if (!nearbyCluster) {
      clusters.push({
        latitude: group.latitude,
        longitude: group.longitude,
        placeGroups: [group],
      });
      return;
    }

    nearbyCluster.placeGroups.push(group);
    nearbyCluster.latitude =
      nearbyCluster.placeGroups.reduce(
        (sum, placeGroup) => sum + placeGroup.latitude,
        0
      ) / nearbyCluster.placeGroups.length;
    nearbyCluster.longitude =
      nearbyCluster.placeGroups.reduce(
        (sum, placeGroup) => sum + placeGroup.longitude,
        0
      ) / nearbyCluster.placeGroups.length;
  });

  return clusters;
}

export default function MapExplorer({ locations }: MapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState("all");

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
  const visibleGroups = useMemo(() => {
    const groupByPlaceId = new Map<string, MapLocationGroup>();

    visibleLocations.forEach((location) => {
      const existingGroup = groupByPlaceId.get(location.placeId);
      if (existingGroup) {
        existingGroup.locations.push(location);
        return;
      }

      groupByPlaceId.set(location.placeId, {
        placeId: location.placeId,
        placeName: location.placeName,
        latitude: location.latitude,
        longitude: location.longitude,
        precision: location.precision,
        locationRole: location.locationRole,
        locations: [location],
      });
    });

    return Array.from(groupByPlaceId.values()).map((group) => ({
      ...group,
      locations: group.locations.sort((first, second) =>
        (second.historicalYear ?? Number.NEGATIVE_INFINITY) -
        (first.historicalYear ?? Number.NEGATIVE_INFINITY)
      ),
    }));
  }, [visibleLocations]);

  const selectedGroups = visibleGroups.filter((group) =>
    selectedPlaceIds.includes(group.placeId)
  );
  const selectedEntryCount = selectedGroups.reduce(
    (sum, group) => sum + group.locations.length,
    0
  );
  const visibleUniqueEntryCount = new Set(
    visibleLocations.map((location) => location.eventId)
  ).size;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: [8, 28],
      zoom: 1.15,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
      style: "https://tiles.openfreemap.org/styles/positron",
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    mapRef.current = map;
    setMapReady(true);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const renderMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = clusterVisibleGroups(visibleGroups, map).map(
        (markerGroup) => {
          const entryCount = markerGroup.placeGroups.reduce(
            (sum, group) => sum + group.locations.length,
            0
          );
          const placeNames = markerGroup.placeGroups
            .map((group) => group.placeName)
            .join(", ");
          const markerLabel =
            markerGroup.placeGroups.length > 3
              ? `${markerGroup.placeGroups.length} nearby places: ${entryCount} entries`
              : `${placeNames}: ${entryCount} ${
                  entryCount === 1 ? "entry" : "entries"
                }`;
          const button = document.createElement("button");
          button.type = "button";
          button.className = styles.marker;
          button.dataset.precision =
            markerGroup.placeGroups.length > 1
              ? "cluster"
              : markerGroup.placeGroups[0].precision;
          button.textContent = String(entryCount);
          button.setAttribute("aria-label", markerLabel);
          button.addEventListener("click", () => {
            setSelectedPlaceIds(
              markerGroup.placeGroups.map((group) => group.placeId)
            );

            if (markerGroup.placeGroups.length > 1) {
              map.easeTo({
                center: [markerGroup.longitude, markerGroup.latitude],
                zoom: Math.min(map.getZoom() + 2, 7),
                duration: 500,
              });
            }
          });

          return new maplibregl.Marker({ element: button })
            .setLngLat([markerGroup.longitude, markerGroup.latitude])
            .addTo(map);
        }
      );
    };

    renderMarkers();
    map.on("moveend", renderMarkers);

    return () => {
      map.off("moveend", renderMarkers);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [mapReady, visibleGroups]);

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
              {visibleLocations.length !== visibleUniqueEntryCount && (
                <> · {visibleLocations.length} map locations</>
              )}
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

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className={styles.mapFrame}>
            <div
              ref={mapContainerRef}
              className={styles.mapCanvas}
              aria-label="World map of Beer Chronicles entries"
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
            className="rounded-xl border border-stone-200 bg-stone-50 p-5"
            aria-label="Selected map entry"
            aria-live="polite"
          >
            {selectedGroups.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Selected map location
                </p>
                <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-stone-900">
                  {selectedGroups.length === 1
                    ? selectedGroups[0].placeName
                    : `${selectedGroups.length} nearby places`}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {selectedEntryCount} {selectedEntryCount === 1 ? "entry" : "entries"}
                </p>

                <div className="mt-5 max-h-96 space-y-6 overflow-y-auto border-t border-stone-200 pt-4">
                  {selectedGroups.map((group) => (
                    <section key={group.placeId} aria-labelledby={`map-place-${group.placeId}`}>
                      <h4
                        id={`map-place-${group.placeId}`}
                        className="font-semibold text-stone-900"
                      >
                        {group.placeName}
                      </h4>
                      <p className="mt-1 text-xs capitalize text-stone-500">
                        {group.precision} precision
                      </p>
                      <ul className="mt-3 space-y-4">
                        {group.locations.map((location) => (
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
                    </section>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  Select a location
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Choose a reviewed point on the map to see its entry, date,
                  location role, and precision.
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
