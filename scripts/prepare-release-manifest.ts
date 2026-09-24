import { readFile, writeFile } from "node:fs/promises";
import { getEventRouteParams } from "../src/lib/eventAliases";
import { getEventPath, getEventUrl } from "../src/lib/eventUrls";
import type { PublicationSnapshot } from "../src/lib/publicationSnapshot";
import { pageIdentity, PUBLIC_ORIGIN } from "./release-verification.mjs";

export async function prepareReleaseManifest() {
  const snapshot: PublicationSnapshot = JSON.parse(await readFile(".cache/publication.json", "utf8"));
  const publication = JSON.parse(await readFile("out/publication-status.json", "utf8"));
  const routes = new Map<string, { path: string; canonical: string; continueTo?: string }>();
  for (const path of ["/", "/map", "/histogram", "/storylines", "/submit"]) {
    routes.set(path, { path, canonical: PUBLIC_ORIGIN + path });
  }
  const events = new Map(snapshot.events.map((event) => [event.id, event]));
  for (const { id, slug } of getEventRouteParams(snapshot.events)) {
    const event = events.get(id)!;
    const path = `/events/${id}/${slug}`;
    const current = getEventPath(id, event.title);
    if (path === current) continue;
    const canonical = getEventUrl(id, event.title);
    routes.set(path, { path, canonical, continueTo: current });
    routes.set(current, { path: current, canonical });
  }
  const identities = await Promise.all([...routes.values()].map(async (route) => {
    const html = await readFile(route.path === "/" ? "out/index.html" : `out${route.path}.html`, "utf8");
    const identity = pageIdentity(html);
    const publicationId = `${snapshot.commit}:${snapshot.generatedAt}`;
    if (identity.publicationId !== publicationId || identity.canonical !== route.canonical || !identity.heading) throw new Error(`Cannot create release identity for ${route.path}`);
    return { ...route, heading: identity.heading, publicationId };
  }));
  await writeFile(".cache/release-manifest.json", JSON.stringify({ schemaVersion: 1, publication, routes: identities }, null, 2) + "\n");
}
