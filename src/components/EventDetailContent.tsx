// components/EventDetailContent.tsx

import Link from "next/link";
import EventShareButton from "@/components/EventShareButton";
import type { TimelineEvent } from "@/lib/types";
import {
  getCorrectionSubmissionPath,
  getEventPath,
  getEventUrl,
} from "@/lib/eventUrls";
import { getStorylinesForEvent } from "@/lib/eventStorylines";
import { getStorylineHref } from "@/lib/storylines";
import {
  getSourceLinkLabel,
  normalizeSourceUrl,
  parseSourceCitations,
} from "@/lib/sourceCitations";
import { formatEventDate } from "./timelineUtils";

type EventDetailContentProps = {
  event: TimelineEvent;
  showPermanentLink?: boolean;
  titleAs?: "h1" | "h2";
  titleId?: string;
};

export default function EventDetailContent({
  event,
  showPermanentLink = false,
  titleAs = "h1",
  titleId,
}: EventDetailContentProps) {
  const sourceCitations = parseSourceCitations(event.sources);

  const storylines = getStorylinesForEvent(event);
  const Title = titleAs;
  const isPermanentPage = titleAs === "h1";
  const SectionHeading = isPermanentPage ? "h2" : "h3";

  return (
    <div>
      <div>
        <p className="mb-2 text-sm text-gray-500">
          {formatEventDate(event)}
        </p>

        <Title
          id={titleId}
          className={`font-serif text-2xl font-semibold leading-tight text-stone-900 ${
            isPermanentPage ? "break-words md:text-3xl" : ""
          }`}
        >
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
        <p
          className={`mt-5 whitespace-pre-line font-sans leading-6 text-gray-700 ${
            isPermanentPage ? "md:leading-7" : ""
          }`}
        >
          {event.description}
        </p>
      )}

      {(storylines.length > 0 || (event.tags ?? []).length > 0) && (
        <div
          className={
            isPermanentPage
              ? "mt-6 border-t border-stone-200 pt-5"
              : "contents"
          }
        >
          {storylines.length > 0 && (
            <section
              aria-labelledby={`event-storylines-${event.id}`}
              className={
                isPermanentPage
                  ? ""
                  : "mt-6 border-t border-stone-200 pt-5"
              }
            >
              <SectionHeading
                id={`event-storylines-${event.id}`}
                className="text-sm font-semibold text-stone-800"
              >
                Explore the Storylines
              </SectionHeading>

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
              className={
                isPermanentPage
                  ? storylines.length > 0
                    ? "mt-5"
                    : ""
                  : "mt-6 border-t border-stone-200 pt-5"
              }
            >
              <SectionHeading
                id={`event-tags-${event.id}`}
                className="text-sm font-semibold text-stone-800"
              >
                Tags
              </SectionHeading>

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
        </div>
      )}

      <div
        className={
          isPermanentPage
            ? "mt-7 border-t border-stone-300 pt-5"
            : "contents"
        }
      >
        {sourceCitations.length > 0 && (
          <section
            aria-labelledby={`event-sources-${event.id}`}
            className={
              isPermanentPage
                ? ""
                : "mt-6 border-t border-stone-200 pt-5"
            }
          >
            <SectionHeading
              id={`event-sources-${event.id}`}
              className="text-sm font-semibold text-stone-800"
            >
              Sources
            </SectionHeading>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              These sources support the dating and historical claims in
              this entry.
            </p>

            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-stone-700">
              {sourceCitations.map((citation, index) => (
                <li
                  key={`${citation.text.join("-")}-${citation.urls.join("-")}-${index}`}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3"
                >
                  {citation.text.length > 0 && (
                    <p>{citation.text.join(" ")}</p>
                  )}

                  {citation.urls.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {citation.urls.map((url, urlIndex) => (
                        <a
                          key={`${url}-${urlIndex}`}
                          href={normalizeSourceUrl(url)}
                          title={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all rounded-sm text-xs font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900 hover:decoration-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                        >
                          {getSourceLinkLabel(url)}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div
          className={
            isPermanentPage
              ? sourceCitations.length > 0
                ? "mt-4"
                : ""
              : "mt-6 border-t border-stone-200 pt-5"
          }
        >
          {showPermanentLink && (
            <div>
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

          <div className={showPermanentLink ? "mt-3" : ""}>
            <Link
              href={getCorrectionSubmissionPath(
                event.id,
                event.title
              )}
              className={`inline-block text-sm text-stone-500 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-700 hover:decoration-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 ${
                isPermanentPage ? "py-2" : "py-1"
              }`}
            >
              Suggest a correction or additional source
            </Link>
          </div>

          {isPermanentPage && (
            <div className="mt-3">
              <EventShareButton
                title={event.title}
                canonicalUrl={getEventUrl(event.id, event.title)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
