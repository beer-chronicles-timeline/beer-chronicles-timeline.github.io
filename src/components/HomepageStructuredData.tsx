import type { TimelineEvent } from "@/lib/types";
import { getHomepageStructuredData } from "@/lib/homepageStructuredData";

export default function HomepageStructuredData({
  previewEvents,
}: {
  previewEvents: TimelineEvent[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          getHomepageStructuredData(previewEvents)
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
