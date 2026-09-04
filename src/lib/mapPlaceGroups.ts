import type { MapLocation } from "@/lib/mapLocations";

export type MapPlaceGroup = {
  placeId: string;
  placeName: string;
  latitude: number;
  longitude: number;
  precision: MapLocation["precision"];
  locationRole: string;
  locations: MapLocation[];
};

export function buildMapPlaceGroups(
  locations: readonly MapLocation[]
): MapPlaceGroup[] {
  const groupByPlaceId = new Map<string, MapPlaceGroup>();

  locations.forEach((location) => {
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

  return Array.from(groupByPlaceId.values())
    .map((group) => ({
      ...group,
      locations: group.locations.sort(
        (first, second) =>
          (second.historicalYear ?? Number.NEGATIVE_INFINITY) -
          (first.historicalYear ?? Number.NEGATIVE_INFINITY)
      ),
    }))
    .sort((first, second) =>
      first.placeName.localeCompare(second.placeName)
    );
}
