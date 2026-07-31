// app/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { supabase } from "@/lib/supabaseClient";
import type { EventRow, TimelineEvent, Tag } from "@/lib/types";

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

const EVENT_TAG_PAGE_SIZE = 1000;
const MIN_VISIBLE_TAG_EVENT_COUNT = 3;

function isBceDate(eventDate: string): boolean {
  return /\sBC$/i.test(eventDate.trim());
}

function getTimelineYear(eventDate: string): number | null {
  const trimmedDate = eventDate.trim();
  const yearMatch = trimmedDate.match(/^(\d+)-/);

  if (!yearMatch) {
    return null;
  }

  const storedYear = Number.parseInt(yearMatch[1], 10);

  if (Number.isNaN(storedYear)) {
    return null;
  }

  if (isBceDate(trimmedDate)) {
    return -(storedYear + 1);
  }

  return storedYear;
}

function getTimelineSortValue(eventDate: string): number {
  const trimmedDate = eventDate.trim();
  const dateMatch = trimmedDate.match(
    /^(\d+)-(\d{2})-(\d{2})(?:\s+BC)?$/i
  );

  if (!dateMatch) {
    return Number.NEGATIVE_INFINITY;
  }

  const storedYear = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10);
  const day = Number.parseInt(dateMatch[3], 10);

  if (
    Number.isNaN(storedYear) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const timelineYear = isBceDate(trimmedDate)
    ? -(storedYear + 1)
    : storedYear;

  return timelineYear * 10_000 + month * 100 + day;
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

export default async function Home() {
  // 1) Fetch events - only those NOT soft-deleted
  const { data: eventData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .is("deleted_at", null)
    .order("event_date", { ascending: false });

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
  // PostgreSQL returns BCE dates using astronomical year numbering.
  // For example, 3600 BC is returned as 3599-01-01 BC.
  const events: TimelineEvent[] = eventRows
    .map((row) => ({
      ...row,
      tags: tagsForEvent.get(row.id) ?? [],
    }))
    .sort(
      (firstEvent, secondEvent) =>
        getTimelineSortValue(secondEvent.event_date) -
        getTimelineSortValue(firstEvent.event_date)
    );

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
    .map((event) => getTimelineYear(event.event_date))
    .filter((year): year is number => year !== null);

  const minYear = years.length > 0 ? Math.min(...years) : 1000;
  const maxYear = years.length > 0 ? Math.max(...years) : 2026;

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
            Follow beer’s connected histories across styles, science,
            industry, and culture.
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