import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { getEventRouteParams, assertPublishedEventPaths } from "../src/lib/eventAliases";
import { getEventPath, getEventUrl } from "../src/lib/eventUrls";
import { decodeTimelineData } from "../src/lib/timelineTransport";
import { getEventsForStoryline } from "../src/lib/eventStorylines";
import { STORYLINES } from "../src/lib/storylines";
import type { PublicationSnapshot } from "../src/lib/publicationSnapshot";

export async function checkPublicationExport(requireLive = false) {
  const snapshot = JSON.parse(await readFile(".cache/publication.json", "utf8")) as PublicationSnapshot;
  if (requireLive && snapshot.mode !== "live") throw new Error("Refusing to deploy a fixture export");
  if (snapshot.mode === "live") assertPublishedEventPaths(snapshot.events);
  const status = JSON.parse(await readFile("out/publication-status.json", "utf8"));
  if (status.commit !== snapshot.commit || status.mode !== snapshot.mode || status.generatedAt !== snapshot.generatedAt || status.eventCount !== snapshot.events.length) throw new Error("Export belongs to a different publication snapshot");
  const payload = decodeTimelineData(JSON.parse(await readFile("out/timeline-data.json", "utf8")));
  const ids = (events: {id: string}[]) => events.map((e) => e.id).sort().join("\n");
  if (ids(payload.events) !== ids(snapshot.events)) throw new Error("Exported timeline does not match publication snapshot");
  const sitemap = await readFile("out/sitemap.xml", "utf8");
  if ((sitemap.match(/<loc>https:\/\/beer-chronicles\.org\/events\//g) ?? []).length !== snapshot.events.length) throw new Error("Sitemap event count differs from publication snapshot");
  const paths = new Set<string>(["/", "/map", "/histogram", "/storylines", "/submit", ...STORYLINES.map((s) => `/storylines/${s.slug}`)]);
  const eventById = new Map(snapshot.events.map((e) => [e.id, e]));
  for (const { id, slug } of getEventRouteParams(snapshot.events)) {
    const path = `/events/${id}/${slug}`;
    const html = await readFile(resolve(`out${path}.html`), "utf8");
    const event = eventById.get(id)!;
    if (!html.includes(`rel="canonical" href="${getEventUrl(id, event.title)}"`)) throw new Error(`Missing canonical: ${path}`);
    paths.add(path);
    if (path === getEventPath(id, event.title) && !sitemap.includes(`<loc>${getEventUrl(id, event.title)}</loc>`)) throw new Error(`Missing sitemap entry: ${path}`);
    if (path !== getEventPath(id, event.title) && sitemap.includes(`<loc>https://beer-chronicles.org${path}</loc>`)) throw new Error(`Alias in sitemap: ${path}`);
  }
  for (const storyline of STORYLINES) {
    const html = await readFile(`out/storylines/${storyline.slug}.html`, "utf8");
    const expectedPaths = getEventsForStoryline(snapshot.events, storyline).map((event) => getEventPath(event.id, event.title)).sort();
    const actualPaths = [...new Set([...html.matchAll(/href="(\/events\/[^"]+)"/g)].map((match) => match[1]))].sort();
    if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) throw new Error(`Storyline membership differs: ${storyline.slug}`);
    for (const event of getEventsForStoryline(snapshot.events, storyline)) {
      if (!html.includes(`href="${getEventPath(event.id, event.title)}"`)) throw new Error(`Missing Storyline event: ${storyline.slug}/${event.id}`);
    }
  }
  // Check all generated content links using Pages-style extensionless routing.
  for (const path of paths) {
    const html = await readFile(path === "/" ? "out/index.html" : `out${path}.html`, "utf8");
    for (const [, raw] of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      if (raw.startsWith("//")) continue;
      const target = decodeURIComponent(raw.replaceAll("&amp;", "&"));
      if (target.includes("..")) throw new Error(`Unsafe link: ${target}`);
      const candidates = target === "/" ? ["out/index.html"] : [`out${target}.html`, `out${target}`, `out${target}/index.html`];
      if (!(await Promise.all(candidates.map(async (file) => { try { return (await stat(file)).isFile(); } catch { return false; } }))).some(Boolean)) throw new Error(`Broken internal link: ${path} -> ${target}`);
    }
  }
  console.log(`Verified ${snapshot.events.length} events, historical aliases, Storyline links and internal export links (${snapshot.mode}).`);
}
if (process.argv[1]?.endsWith("check-publication-export.ts")) checkPublicationExport(process.argv.includes("--require-live")).catch((error) => { console.error(error); process.exitCode = 1; });
