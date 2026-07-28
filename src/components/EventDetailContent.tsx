// components/EventDetailContent.tsx

import Link from "next/link";
import type { TimelineEvent } from "@/lib/types";
import { getEventPath } from "@/lib/eventUrls";
import { getStorylinesForEvent } from "@/lib/eventStorylines";
import { getStorylineHref } from "@/lib/storylines";
import {
  formatEventDate,
  normalizeUrl,
  urlRegex,
} from "./timelineUtils";

type EventDetailContentProps = {
  event: TimelineEvent;
  showPermanentLink?: boolean;
  titleAs?: "h1" | "h2";
};

export default function EventDetailContent({
  event,
  showPermanentLink = false,
  titleAs = "h1",
}: EventDetailContentProps) {
  const rawSourceLines = (event.sources ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const storylines = getStorylinesForEvent(event);
  const Title = titleAs;

  return (
    <div>
      <div>
        <p className="mb-2 text-sm text-gray-500">
          {formatEventDate(event)}
        </p>

        <Title className="font-serif text-2xl font-semibold leading-tight text-stone-900">
          {event.title}
        </Title>

        {event.category && (
          <div className="mt-3">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-sans text-xs text-gray-700">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="mt-5 whitespace-pre-line font-sans leading-6 text-gray-700">
          {event.description}
        </p>
      )}

      {storylines.length > 0 && (
        <section
          aria-labelledby={`event-storylines-${event.id}`}
          className="mt-6 border-t border-stone-200 pt-5"
        >
          <h3
            id={`event-storylines-${event.id}`}
            className="text-sm font-semibold text-stone-800"
          >
            Explore the Storylines
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {storylines.map((storyline) => (
              <Link
                key={storyline.slug}
                href={getStorylineHref(storyline)}
                className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
              >
                {storyline.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {(event.tags ?? []).length > 0 && (
        <section
          aria-labelledby={`event-tags-${event.id}`}
          className="mt-6 border-t border-stone-200 pt-5"
        >
          <h3
            id={`event-tags-${event.id}`}
            className="text-sm font-semibold text-stone-800"
          >
            Tags
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {(event.tags ?? []).map((tag) => (
              <Link
                key={tag.id}
                href={`/?tags=${encodeURIComponent(tag.name)}`}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {rawSourceLines.length > 0 && (
        <section
          aria-labelledby={`event-sources-${event.id}`}
          className="mt-6 border-t border-stone-200 pt-5"
        >
          <h3
            id={`event-sources-${event.id}`}
            className="text-sm font-semibold text-stone-800"
          >
            Sources
          </h3>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            These sources support the dating and historical claims in
            this entry.
          </p>

          <ul className="mt-3 list-disc space-y-1.5 break-words pl-5 text-sm leading-6 text-stone-700">
            {rawSourceLines.map((line, index) => {
              const match = line.match(urlRegex);

              if (!match) {
                return <li key={`${line}-${index}`}>{line}</li>;
              }

              const firstUrl = match[0];
              const href = normalizeUrl(firstUrl);

              return (
                <li key={`${line}-${index}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-stone-300 underline-offset-2 transition hover:decoration-stone-700"
                  >
                    {firstUrl}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showPermanentLink && (
        <div className="mt-6 border-t border-stone-200 pt-5">
          <Link
            href={getEventPath(event.id, event.title)}
            className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          >
            Open full entry
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}