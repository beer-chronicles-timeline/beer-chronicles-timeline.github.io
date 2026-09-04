import type { MapLocation } from "@/lib/mapLocations";
import { buildMapPlaceGroups } from "@/lib/mapPlaceGroups";

const MAP_URL = "https://beer-chronicles.org/map";

export default function MapStructuredData({
  locations,
}: {
  locations: readonly MapLocation[];
}) {
  const groups = buildMapPlaceGroups(locations);
  const uniqueEntryCount = new Set(
    locations.map((location) => location.eventId)
  ).size;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${MAP_URL}#collection-page`,
    name: "Beer Map",
    description:
      "Explore source-supported Beer Chronicles entries by their reviewed historical locations.",
    url: MAP_URL,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Beer Chronicles",
      url: "https://beer-chronicles.org/",
    },
    about: {
      "@type": "Thing",
      name: "Beer history",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Reviewed beer-history places",
      numberOfItems: groups.length,
      itemListElement: groups.slice(0, 24).map((group, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: group.placeName,
        url: new URL(group.locations[0].eventHref, MAP_URL).toString(),
      })),
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Mapped entries",
        value: uniqueEntryCount,
      },
      {
        "@type": "PropertyValue",
        name: "Reviewed map locations",
        value: locations.length,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
