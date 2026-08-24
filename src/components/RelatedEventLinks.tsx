// components/RelatedEventLinks.tsx

import Link from "next/link";
import type { TimelineEvent } from "@/lib/types";
import { getEventPath } from "@/lib/eventUrls";
import { formatEventDate, truncate } from "./timelineUtils";

type RelatedEventLinksProps = {
  relatedEvents: TimelineEvent[];
};

export default function RelatedEventLinks({
  relatedEvents,
}: RelatedEventLinksProps) {
  if (relatedEvents.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-events-heading"
      className="mt-8 border-t border-stone-300 pt-6"
    >
      <h2
        id="related-events-heading"
        className="font-serif text-xl font-semibold text-stone-900"
      >
        Continue Exploring
      </h2>

      <p className="mt-1 text-sm text-stone-500">
        Related entries based on shared topics.
      </p>

      <div className="mt-4 space-y-3">
        {relatedEvents.map((relatedEvent) => (
          <Link
            key={relatedEvent.id}
            href={getEventPath(
              relatedEvent.id,
              relatedEvent.title
            )}
            className="block rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
          >
            <div className="text-xs text-stone-500">
              {formatEventDate(relatedEvent)}
            </div>

            <div className="mt-1 font-serif text-base font-semibold text-stone-900">
              {relatedEvent.title}
            </div>

            {relatedEvent.description && (
              <div className="mt-1 text-sm leading-5 text-stone-600">
                {truncate(relatedEvent.description, 140)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
