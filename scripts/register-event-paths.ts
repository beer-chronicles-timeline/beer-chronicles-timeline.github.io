import { readFileSync, writeFileSync } from "node:fs";
import { publishedEventPaths } from "../src/lib/eventAliases";
import { createEventSlug } from "../src/lib/eventUrls";
import type { PublicationSnapshot } from "../src/lib/publicationSnapshot";

const snapshot = JSON.parse(readFileSync(".cache/publication.json", "utf8")) as PublicationSnapshot;
if (snapshot.mode !== "live") throw new Error("Never register synthetic fixture paths as published URLs");
for (const event of snapshot.events) {
  publishedEventPaths[event.id] = [...new Set([...(publishedEventPaths[event.id] ?? []), createEventSlug(event.title)])];
}
writeFileSync("src/data/published-event-paths.json", JSON.stringify(Object.fromEntries(Object.entries(publishedEventPaths).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
console.log("Extended the route registry from the prepared snapshot; review and retain every previous path.");
