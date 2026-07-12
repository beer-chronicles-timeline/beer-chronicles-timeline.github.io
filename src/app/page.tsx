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
        <header className="mb-8">
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

  // 3) Fetch event_tags relations
  const { data: eventTagData, error: eventTagsError } = await supabase
    .from("event_tags")
    .select("event_id, tag_id");

  const eventTagRows: EventTagRow[] = eventTagsError
    ? []
    : ((eventTagData ?? []) as EventTagRow[]);

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

  // 6) Combine events with their tags into TimelineEvent[]
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

  // 7) Calculate min and max historical years, including BCE years
  const years = events
    .map((event) => getTimelineYear(event.event_date))
    .filter((year): year is number => year !== null);

  const minYear = years.length > 0 ? Math.min(...years) : 1000;
  const maxYear = years.length > 0 ? Math.max(...years) : 2026;

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
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

      <Suspense fallback={<div className="h-20" />}>
        <Timeline
          events={events}
          allTags={tags}
          minYear={minYear}
          maxYear={maxYear}
        />
      </Suspense>

      <Footer />
      <ScrollToTop />
    </main>
  );
}