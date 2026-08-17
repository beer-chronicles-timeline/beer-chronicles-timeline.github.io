// app/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  compareEventsChronologicallyDescending,
  getEventTimelineYear,
} from "@/components/timelineUtils";
import { supabase } from "@/lib/supabaseClient";
import type { EventRow, TimelineEvent, Tag } from "@/lib/types";

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

const EVENT_TAG_PAGE_SIZE = 1000;
const MIN_VISIBLE_TAG_EVENT_COUNT = 3;

export const metadata: Metadata = {
  alternates: {
    canonical: "https://beer-chronicles.org/",
  },
};

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

export default async function Home() {
  // 1) Fetch events - only those NOT soft-deleted
  const { data: eventData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .is("deleted_at", null);

  if (eventsError) {
    return (
      <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
        <header className="mb-6">
          {/* Mobile layout: menu and BEER on same line */}
          <div className="flex items-start justify-between gap-2 md:hidden">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
              <Link href="/" className="hover:no-underline">
                BEER
              </Link>
            </h1>

            <HeaderMenu />
          </div>

          {/* Desktop layout: centered title with menu on right */}
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

          {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
          <div className="block md:hidden mt-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
              <Link href="/" className="hover:no-underline">
                CHRONICLES
              </Link>
            </h1>

            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
              An Interactive Beer History Timeline
            </h2>
          </div>
        </header>

        <div className="text-center text-red-600">
          Error loading events: {eventsError.message}
        </div>

        <Footer />
        <ScrollToTop />
      </main>
    );
  }

  const eventRows: EventRow[] = (eventData ?? []) as EventRow[];

  // 2) Fetch all tags
  const { data: tagData, error: tagsError } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  const tags: Tag[] = tagsError ? [] : ((tagData ?? []) as Tag[]);

  // 3) Fetch all event_tags relations in pages
  const {
    data: eventTagRows,
    errorMessage: eventTagsErrorMessage,
  } = await fetchAllEventTags();

  if (eventTagsErrorMessage) {
    console.error(
      "Error loading event_tags relations:",
      eventTagsErrorMessage
    );
  }

  // 4) Build a lookup: tag_id -> Tag
  const tagById = new Map<string, Tag>();

  tags.forEach((tag) => {
    tagById.set(tag.id, tag);
  });

  // 5) Build a lookup: event_id -> Tag[]
  const tagsForEvent = new Map<string, Tag[]>();

  eventTagRows.forEach(({ event_id, tag_id }) => {
    const tag = tagById.get(tag_id);

    if (!tag) {
      return;
    }

    const existing = tagsForEvent.get(event_id) ?? [];
    existing.push(tag);
    tagsForEvent.set(event_id, existing);
  });

  // 6) Combine events with all of their tags into TimelineEvent[]
  // Existing PostgreSQL BCE dates use astronomical year numbering.
  // Events older than PostgreSQL's DATE range use historical_year.
  const events: TimelineEvent[] = eventRows
    .map((row) => ({
      ...row,
      tags: tagsForEvent.get(row.id) ?? [],
    }))
    .sort(compareEventsChronologicallyDescending);

  // 7) Count distinct active events for each tag
  const activeEventIds = new Set(eventRows.map((event) => event.id));
  const activeEventIdsByTag = new Map<string, Set<string>>();

  eventTagRows.forEach(({ event_id, tag_id }) => {
    if (!activeEventIds.has(event_id)) {
      return;
    }

    const eventIds =
      activeEventIdsByTag.get(tag_id) ?? new Set<string>();

    eventIds.add(event_id);
    activeEventIdsByTag.set(tag_id, eventIds);
  });

  // 8) Only expose tags used by at least three active events
  const visibleTags = tags.filter(
    (tag) =>
      (activeEventIdsByTag.get(tag.id)?.size ?? 0) >=
      MIN_VISIBLE_TAG_EVENT_COUNT
  );

  // 9) Calculate min and max historical years, including BCE years
  const years = events
    .map((event) => getEventTimelineYear(event))
    .filter((year): year is number => year !== null);

  const fallbackYear = new Date().getFullYear();
  const minYear =
    years.length > 0 ? Math.min(...years) : fallbackYear;
  const maxYear =
    years.length > 0 ? Math.max(...years) : fallbackYear;

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-6">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </h1>

          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
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

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>

          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </h2>
        </div>
      </header>

      <section
        aria-labelledby="storylines-promo-heading"
        className="mx-auto mb-8 flex w-full max-w-4xl flex-col gap-3 rounded-xl border border-stone-200 bg-white px-5 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:gap-6"
      >
        <div className="flex min-w-0 flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-3 lg:whitespace-nowrap">
          <h2
            id="storylines-promo-heading"
            className="shrink-0 font-serif text-lg font-semibold text-stone-900"
          >
            Beer Storylines
          </h2>

          <p className="text-sm text-stone-600">
            Explore beer’s connected history across time, styles, science, and culture.
          </p>
        </div>

        <Link
          href="/storylines"
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 lg:self-auto"
        >
          Explore
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      </section>

      <Suspense fallback={<div className="h-20" />}>
        <Timeline
          events={events}
          allTags={visibleTags}
          urlTags={tags}
          minYear={minYear}
          maxYear={maxYear}
        />
      </Suspense>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
