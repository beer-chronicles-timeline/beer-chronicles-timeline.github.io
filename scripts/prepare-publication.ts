import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readAllPublicationRows, validatePublicationData, type PublicationRows } from "../src/lib/publicationData";
import { assertPublishedEventPaths } from "../src/lib/eventAliases";
import { decodeTimelineData } from "../src/lib/timelineTransport";
import { createPublicationFixture } from "../tests/fixtures/publication";

export async function preparePublication(args: string[]) {
  let rows: PublicationRows;
  const fixture = args.includes("--fixture") || args.includes("--public-fixture");
  if (args.includes("--public-fixture")) {
    const path = args[args.indexOf("--public-fixture") + 1];
    const data = decodeTimelineData(JSON.parse(await readFile(path, "utf8")));
    rows = { events: data.events, tags: data.tags, eventTags: data.events.flatMap((event) => (event.tags ?? []).map((tag) => ({ event_id: event.id, tag_id: tag.id }))) };
  } else if (fixture) {
    const value = args[args.indexOf("--fixture") + 1];
    rows = createPublicationFixture(value ? Number(value) : 750);
  } else {
    // Import only on the explicitly approved live path. Offline builds cannot
    // accidentally instantiate or query the backend client.
    const { supabase } = await import("../src/lib/supabaseClient");
    const [events, tags, eventTags] = await Promise.all([
      readAllPublicationRows("events", (from, to) => supabase.from("events").select("*", { count: "exact" }).is("deleted_at", null).order("id").range(from, to)),
      readAllPublicationRows("tags", (from, to) => supabase.from("tags").select("id, name", { count: "exact" }).order("name").order("id").range(from, to)),
      readAllPublicationRows("event_tags", (from, to) => supabase.from("event_tags").select("event_id, tag_id", { count: "exact" }).order("event_id").order("tag_id").range(from, to)),
    ]);
    rows = { events, tags, eventTags };
  }
  const data = validatePublicationData(rows);
  const snapshot = { ...data, mode: fixture ? "fixture" : "live", generatedAt: new Date().toISOString() };
  await mkdir(resolve(".cache"), { recursive: true });
  await writeFile(resolve(".cache/publication.json"), JSON.stringify(snapshot));
  // Save the validated snapshot before reporting unknown paths so the registry
  // can be extended offline, without repeating backend reads.
  if (!fixture) assertPublishedEventPaths(data.events);
  console.log(`Prepared ${snapshot.mode} snapshot: ${data.events.length} events, ${data.tags.length} tags.`);
}

if (process.argv[1]?.endsWith("prepare-publication.ts")) {
  preparePublication(process.argv.slice(2)).catch((error) => { console.error(error); process.exitCode = 1; });
}
