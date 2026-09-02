import Link from "next/link";
import { getEventPath } from "@/lib/eventUrls";
import type { TimelineEvent } from "@/lib/types";
import { formatEventDate, truncate } from "./timelineUtils";

type TimelinePreviewProps = {
  events: TimelineEvent[];
};

export default function TimelinePreview({ events }: TimelinePreviewProps) {
  return (
    <section
      aria-labelledby="timeline-preview-heading"
      className="mx-auto w-full max-w-4xl"
    >
      <div className="mb-5 text-center">
        <h2
          id="timeline-preview-heading"
          className="font-serif text-2xl font-semibold text-stone-900"
        >
          Explore beer history
        </h2>

        <p className="mt-1 text-sm text-stone-600">
          A glimpse of published entries from across the timeline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-stone-500">
              {formatEventDate(event)}
            </p>

            <h3 className="mt-1 font-serif text-lg font-semibold leading-tight text-stone-900">
              <Link
                href={getEventPath(event.id, event.title)}
                className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
              >
                {event.title}
              </Link>
            </h3>

            {event.description && (
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {truncate(event.description, 150)}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
