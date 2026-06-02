// app/page.tsx
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
              BEER
            </h1>
            <HeaderMenu />
          </div>

          {/* Desktop layout: centered title with menu on right */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
            <div className="w-1/3" />
            <div className="w-1/3 text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
                BEER CHRONICLES
              </h1>
              <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
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
              CHRONICLES
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
  tags.forEach((tag) => tagById.set(tag.id, tag));

  // 5) Build a lookup: event_id -> Tag[]
  const tagsForEvent = new Map<string, Tag[]>();
  eventTagRows.forEach(({ event_id, tag_id }) => {
    const tag = tagById.get(tag_id);
    if (!tag) return;
    const existing = tagsForEvent.get(event_id) ?? [];
    existing.push(tag);
    tagsForEvent.set(event_id, existing);
  });

  // 6) Combine events with their tags into TimelineEvent[]
  const events: TimelineEvent[] = eventRows.map((row) => ({
    ...row,
    tags: tagsForEvent.get(row.id) ?? [],
  }));

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            BEER
          </h1>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-1/3" />
          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              BEER CHRONICLES
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
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
            CHRONICLES
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </h2>
        </div>
      </header>

      <Timeline events={events} allTags={tags} />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
