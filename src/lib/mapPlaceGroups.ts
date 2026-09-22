import type { MapLocation } from "@/lib/mapLocations";
import { compareEventsChronologicallyDescending } from "@/components/timelineUtils";
import { normalizeSearchText } from "@/lib/searchText";

export type MapPlaceGroup = {
  placeId: string;
  placeName: string;
  latitude: number;
  longitude: number;
  precision: MapLocation["precision"];
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
      locations: [location],
    });
  });

  return Array.from(groupByPlaceId.values())
    .map((group) => ({
      ...group,
      locations: group.locations.sort(
        (first, second) =>
          compareEventsChronologicallyDescending(first.chronology, second.chronology)
      ),
    }))
    .sort((first, second) =>
      first.placeName.localeCompare(second.placeName)
    );
}

export function findMapPlaceGroups(
  groups: readonly MapPlaceGroup[],
  query: string
): MapPlaceGroup[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const exactMatches = groups.filter(
    (group) => normalizeSearchText(group.placeName) === normalizedQuery
  );
  if (exactMatches.length > 0) return exactMatches;

  return groups.filter((group) =>
    normalizeSearchText(group.placeName).includes(normalizedQuery)
  );
}
