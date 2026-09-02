// components/EventStructuredData.tsx

import type { TimelineEvent } from "@/lib/types";
import { getEventUrl } from "@/lib/eventUrls";
import { getEventPublicationDates } from "@/lib/eventMetadata";
import { truncate } from "./timelineUtils";

type EventStructuredDataProps = {
  event: TimelineEvent;
  socialImageUrl: string;
};

export default function EventStructuredData({
  event,
  socialImageUrl,
}: EventStructuredDataProps) {
  const canonicalUrl = getEventUrl(event.id, event.title);

  const description =
    truncate(event.description, 160) ??
    `Explore ${event.title} in the Beer Chronicles interactive beer-history timeline.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: event.title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "en",
    image: [socialImageUrl],
    author: {
      "@type": "Person",
      name: "Martin Schmidt",
    },
    publisher: {
      "@type": "Organization",
      name: "Beer Chronicles",
      url: "https://beer-chronicles.org",
    },
    keywords: (event.tags ?? []).map((tag) => tag.name),
    ...getEventPublicationDates(event),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(
          /</g,
          "\\u003c"
        ),
      }}
    />
  );
}
