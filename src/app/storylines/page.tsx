// app/storylines/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  compareEventsChronologicallyAscending,
  formatEventDate,
  getEventTimelineYear,
} from "@/components/timelineUtils";
import { supabase } from "@/lib/supabaseClient";
import type { TimelineEvent } from "@/lib/types";
import {
  STORYLINES,
  STORYLINE_SECTIONS,
  getStorylineHref,
  getStorylinesForSection,
  type Storyline,
} from "@/lib/storylines";

export const metadata: Metadata = {
  title: "Beer History Storylines | Beer Chronicles",
  description:
    "Explore connected beer-history storylines covering ingredients, styles, breweries, science, technology, laws, culture, and modern craft beer.",
  alternates: {
    canonical: "/storylines",
  },
  openGraph: {
    title: "Beer History Storylines | Beer Chronicles",
    description:
      "Explore connected stories across thousands of years of beer history.",
    url: "/storylines",
    type: "website",
  },
};

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

type TagRow = {
  id: string;
  name: string;
};

type StorylineView = {
  storyline: Storyline;
  entryCount: number;
  featuredEvent: TimelineEvent | null;
};

const EVENT_TAG_PAGE_SIZE = 1000;

function isEventInsideStorylineDateRange(
  event: TimelineEvent,
  storyline: Storyline
): boolean {
  const eventYear = getEventTimelineYear(event);

  if (eventYear === null) {
    return false;
  }

  if (
    storyline.fromYear !== undefined &&
    eventYear < storyline.fromYear
  ) {
    return false;
  }

  if (
    storyline.toYear !== undefined &&
    eventYear > storyline.toYear
  ) {
    return false;
  }

  return true;
}

function sortStorylinesAlphabetically(
  storylines: Storyline[]
): Storyline[] {
  return [...storylines].sort((firstStoryline, secondStoryline) =>
    firstStoryline.title.localeCompare(
      secondStoryline.title,
      "en",
      {
        sensitivity: "base",
      }
    )
  );
}

async function fetchAllEventTags(): Promise<{
  data: EventTagRow[];
  errorMessage: string | null;
}> {
  const allRows: EventTagRow[] = [];
  let from = 0;

  while (true) {
    const to = from + EVENT_TAG_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("event_tags")
      .select("event_id, tag_id")
      .order("event_id", { ascending: true })
      .order("tag_id", { ascending: true })
      .range(from, to);

    if (error) {
      return {
        data: [],
        errorMessage: error.message,
      };
    }

    const rows = (data ?? []) as EventTagRow[];
    allRows.push(...rows);

    if (rows.length < EVENT_TAG_PAGE_SIZE) {
      break;
    }

    from += EVENT_TAG_PAGE_SIZE;
  }

  return {
    data: allRows,
    errorMessage: null,
  };
}

function buildStorylineViews({
  events,
  tags,
  eventTags,
}: {
  events: TimelineEvent[];
  tags: TagRow[];
  eventTags: EventTagRow[];
}): StorylineView[] {
  const eventById = new Map<string, TimelineEvent>();
  const tagIdByName = new Map<string, string>();
  const tagIdsByEventId = new Map<string, Set<string>>();

  events.forEach((event) => {
    eventById.set(event.id, event);
  });

  tags.forEach((tag) => {
    tagIdByName.set(tag.name, tag.id);
  });

  eventTags.forEach(({ event_id, tag_id }) => {
    if (!eventById.has(event_id)) {
      return;
    }

    const tagIds =
      tagIdsByEventId.get(event_id) ?? new Set<string>();

    tagIds.add(tag_id);
    tagIdsByEventId.set(event_id, tagIds);
  });

  return STORYLINES.map((storyline) => {
    const storylineTagIds = storyline.tagNames
      .map((tagName) => tagIdByName.get(tagName))
      .filter((tagId): tagId is string => tagId !== undefined);

    const matchingEvents = events
      .filter((event) => {
        if (!isEventInsideStorylineDateRange(event, storyline)) {
          return false;
        }

        if (storylineTagIds.length === 0) {
          return false;
        }

        const eventTagIds =
          tagIdsByEventId.get(event.id) ?? new Set<string>();

        if (storyline.tagMode === "any") {
          return storylineTagIds.some((tagId) =>
            eventTagIds.has(tagId)
          );
        }

        return storylineTagIds.every((tagId) =>
          eventTagIds.has(tagId)
        );
      })
      .sort(compareEventsChronologicallyAscending);

    const configuredFeaturedEvent = eventById.get(
      storyline.featuredEventId
    );

    const configuredFeaturedEventMatches =
      configuredFeaturedEvent !== undefined &&
      matchingEvents.some(
        (event) => event.id === configuredFeaturedEvent.id
      );

    const featuredEvent = configuredFeaturedEventMatches
      ? configuredFeaturedEvent
      : matchingEvents[0] ?? null;

    return {
      storyline,
      entryCount: matchingEvents.length,
      featuredEvent,
    };
  });
}

function StorylineCard({
  view,
}: {
  view: StorylineView;
}) {
  const { storyline, entryCount, featuredEvent } = view;
  const href = getStorylineHref(storyline);

  return (
    <article
      id={`storyline-${storyline.slug}`}
      className="scroll-mt-6 flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-xl font-semibold text-stone-900">
          {storyline.title}
        </h3>

        <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          {entryCount} {entryCount === 1 ? "entry" : "entries"}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
        {storyline.description}
      </p>

      <div className="mt-5 border-t border-stone-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Featured entry
        </p>

        {featuredEvent ? (
          <p className="mt-1 text-sm leading-5 text-stone-700">
            <span className="font-medium text-stone-900">
              {featuredEvent.title}
            </span>

            <span className="text-stone-400">
              {" "}
              · {formatEventDate(featuredEvent)}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-stone-500">
            No matching entry is currently available.
          </p>
        )}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-between rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
      >
        <span>Explore storyline</span>
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function StorylinesError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-serif text-2xl font-semibold text-red-900">
        Storylines could not be loaded
      </h2>

      <p className="mt-2 text-sm leading-6 text-red-700">
        {message}
      </p>
    </div>
  );
}

export default async function StorylinesPage() {
  const [
    { data: eventData, error: eventsError },
    { data: tagData, error: tagsError },
    eventTagResult,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .is("deleted_at", null),
    supabase
      .from("tags")
      .select("id, name")
      .order("name", { ascending: true }),
    fetchAllEventTags(),
  ]);

  const errorMessage =
    eventsError?.message ??
    tagsError?.message ??
    eventTagResult.errorMessage;

  const events = (eventData ?? []) as TimelineEvent[];
  const tags = (tagData ?? []) as TagRow[];

  const storylineViews = errorMessage
    ? []
    : buildStorylineViews({
        events,
        tags,
        eventTags: eventTagResult.data,
      });

  const viewBySlug = new Map(
    storylineViews.map((view) => [
      view.storyline.slug,
      view,
    ])
  );

  const totalStorylines = STORYLINES.length;

  return (
    <main
      id="storylines-top"
      className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col"
    >
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </h1>

          <HeaderMenu />
        </div>

        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-1/3" />

          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </h1>

            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </h2>
          </div>

          <div className="w-1/3 flex justify-end">
            <HeaderMenu />
          </div>
        </div>

        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>

          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Beer History Storylines
          </h2>
        </div>
      </header>

      <section className="max-w-4xl mx-auto w-full">
        <div aria-labelledby="storylines-heading">
          <h2
            id="storylines-heading"
            className="text-2xl font-semibold font-serif text-stone-900 mb-2"
          >
            Explore Beer Through Its Storylines
          </h2>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mb-4">
            {totalStorylines} connected histories
          </p>

          <p className="text-gray-700 mb-4 leading-relaxed">
            Beer Chronicles is not a collection of isolated dates.
            Its entries form an evolving network of connected
            histories—linking ingredients, styles, breweries,
            technology, law, science, and culture across thousands
            of years.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Every storyline continues to grow as new,
            source-supported connections emerge.
          </p>
        </div>

        {!errorMessage && (
          <nav
            aria-labelledby="section-navigation-heading"
            className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <h2
              id="section-navigation-heading"
              className="font-serif text-xl font-semibold text-stone-900"
            >
              Browse by section
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {STORYLINE_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>
        )}

        {errorMessage ? (
          <div className="mt-10">
            <StorylinesError message={errorMessage} />
          </div>
        ) : (
          <div className="mt-14 space-y-20">
            {STORYLINE_SECTIONS.map((section) => {
              const sectionStorylines =
                sortStorylinesAlphabetically(
                  getStorylinesForSection(section.id)
                );

              const sectionViews = sectionStorylines
                .map((storyline) =>
                  viewBySlug.get(storyline.slug)
                )
                .filter(
                  (view): view is StorylineView =>
                    view !== undefined
                );

              return (
                <section
                  id={section.id}
                  key={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-6"
                >
                  <div>
                    <h2
                      id={`${section.id}-heading`}
                      className="font-serif text-3xl font-semibold tracking-tight text-stone-900"
                    >
                      {section.title}
                    </h2>

                    <p className="mt-3 text-base leading-7 text-stone-600">
                      {section.description}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {sectionViews.map((view) => (
                      <StorylineCard
                        key={view.storyline.slug}
                        view={view}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <a
                      href="#storylines-top"
                      className="text-sm font-medium text-stone-500 transition hover:text-stone-900 focus:outline-none focus:text-stone-900"
                    >
                      Back to top ↑
                    </a>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}