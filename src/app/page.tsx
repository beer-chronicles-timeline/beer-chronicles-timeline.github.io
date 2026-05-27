// app/page.tsx
import Timeline from "@/components/Timeline";
import HeaderMenu from "@/components/HeaderMenu";
import { supabase } from "@/lib/supabaseClient";
import type { EventRow, TimelineEvent, Tag } from "@/lib/types";

type EventTagRow = {
  event_id: string;
  tag_id: string;
};

export default async function Home() {
  // 1) Fetch events (no short_description column needed)
  const { data: eventData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (eventsError) {
    return (
      <main className="min-h-screen bg-stone-50 p-4 md:p-10">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="w-full md:w-1/3 order-1 md:order-1" />
          <div className="w-full md:w-1/3 text-left md:text-center order-2 md:order-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
              BEER CHRONICLES
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
              An Interactive Beer History Timeline
            </h2>
          </div>
          <div className="w-full md:w-1/3 flex justify-end order-3 md:order-3">
            <HeaderMenu />
          </div>
        </header>

        <div className="text-center text-red-600">
          Error loading events: {eventsError.message}
        </div>
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
    <main className="min-h-screen bg-stone-50 p-4 md:p-10">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="w-full md:w-1/3 order-1 md:order-1" />
        <div className="w-full md:w-1/3 text-left md:text-center order-2 md:order-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            BEER CHRONICLES
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </h2>
        </div>
        <div className="w-full md:w-1/3 flex justify-end order-3 md:order-3">
          <HeaderMenu />
        </div>
      </header>

      <Timeline events={events} allTags={tags} />
    </main>
  );
}
