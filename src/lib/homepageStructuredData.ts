import type { TimelineEvent } from "@/lib/types";
import { getEventUrl } from "@/lib/eventUrls";

const BASE_URL = "https://beer-chronicles.org";
const HOMEPAGE_URL = `${BASE_URL}/`;

export function getHomepageStructuredData(
  previewEvents: TimelineEvent[]
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${HOMEPAGE_URL}#website`,
        name: "Beer Chronicles",
        url: HOMEPAGE_URL,
        description:
          "An interactive timeline of beer history from prehistoric brewing to the present day.",
        inLanguage: "en",
      },
      {
        "@type": "CollectionPage",
        "@id": `${HOMEPAGE_URL}#collection-page`,
        name: "Beer Chronicles: An Interactive Beer History Timeline",
        description:
          "Explore beer history from prehistoric brewing to the present through a curated interactive timeline and connected storylines.",
        url: HOMEPAGE_URL,
        inLanguage: "en",
        isPartOf: {
          "@id": `${HOMEPAGE_URL}#website`,
        },
        mainEntity: {
          "@id": `${HOMEPAGE_URL}#timeline-preview`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${HOMEPAGE_URL}#timeline-preview`,
        name: "Beer history timeline preview",
        numberOfItems: previewEvents.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: previewEvents.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: event.title,
          url: getEventUrl(event.id, event.title),
        })),
      },
    ],
  };
}
