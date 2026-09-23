"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  NavigationControl,
  AttributionControl,
  Marker,
  setWorkerUrl,
  type Map as MapLibreMap,
} from "maplibre-gl";
import { version as mapLibreVersion } from "maplibre-gl/package.json";
import type { MapPlaceGroup } from "@/lib/mapPlaceGroups";
import styles from "./MapExplorer.module.css";

type MapMarkerGroup = {
  latitude: number;
  longitude: number;
  placeGroups: MapPlaceGroup[];
};

type MapCanvasProps = {
  groups: MapPlaceGroup[];
  focusedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
};

function clusterVisibleGroups(
  groups: MapPlaceGroup[],
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

export default function MapCanvas({
  groups,
  focusedPlaceId,
  onSelectPlace,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnavailable, setMapUnavailable] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // v6 uses a separate module worker with a shared module dependency.
    // Both are copied from the locked package before dev/build for static hosting.
    setWorkerUrl(`/maplibre/${mapLibreVersion}/maplibre-gl-worker.mjs`);
    let map: MapLibreMap;
    try {
      map = new Map({
        container: mapContainerRef.current,
        center: [8, 28],
        zoom: 1.15,
        minZoom: 1,
        maxZoom: 12,
        attributionControl: false,
        style: "https://tiles.openfreemap.org/styles/positron",
      });
    } catch {
      // v6 requires WebGL2. Keep search and the server-rendered place index
      // available when the browser cannot initialize the map renderer.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reflect the result of initializing an external renderer; this cannot run during render.
      setMapUnavailable(true);
      return;
    }

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-right"
    );
    mapRef.current = map;
    setMapReady(true);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const renderMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = clusterVisibleGroups(groups, map).map(
        (markerGroup) => {
          const entryCount = markerGroup.placeGroups.reduce(
            (sum, group) => sum + group.locations.length,
            0
          );
          const placeNames = markerGroup.placeGroups
            .map((group) => group.placeName)
            .join(", ");
          const isCluster = markerGroup.placeGroups.length > 1;
          const markerLabel = isCluster
            ? `Zoom to ${markerGroup.placeGroups.length} nearby places with ${entryCount} entries`
            : `${placeNames}: ${entryCount} ${
                entryCount === 1 ? "entry" : "entries"
              }`;
          const button = document.createElement("button");
          button.type = "button";
          button.className = styles.marker;
          button.dataset.precision = isCluster
            ? "cluster"
            : markerGroup.placeGroups[0].precision;
          button.textContent = String(entryCount);
          button.setAttribute("aria-label", markerLabel);
          button.addEventListener("click", () => {
            if (isCluster) {
              map.easeTo({
                center: [markerGroup.longitude, markerGroup.latitude],
                zoom: Math.min(map.getZoom() + 2, 9),
                duration: 500,
              });
              return;
            }

            onSelectPlace(markerGroup.placeGroups[0].placeId);
          });

          return new Marker({ element: button })
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
  }, [groups, mapReady, onSelectPlace]);

  useEffect(() => {
    const map = mapRef.current;
    const group = groups.find((candidate) => candidate.placeId === focusedPlaceId);
    if (!map || !mapReady || !group) return;

    map.easeTo({
      center: [group.longitude, group.latitude],
      zoom: Math.max(map.getZoom(), 7),
      duration: 500,
    });
  }, [focusedPlaceId, groups, mapReady]);

  return (
    <>
      <div
        ref={mapContainerRef}
        className={styles.mapCanvas}
        aria-label="World map of Beer Chronicles entries"
      />
      {mapUnavailable && (
        <p className={`${styles.mapLoading} px-6 text-center`} role="status">
          Interactive map unavailable. Use place search or browse the reviewed
          places below.
        </p>
      )}
    </>
  );
}
