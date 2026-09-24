import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PublicationData } from "./publicationData";

export type PublicationSnapshot = PublicationData & { mode: "live" | "fixture"; generatedAt: string };
let snapshot: PublicationSnapshot | undefined;

// Every Next worker reads the same prepared file; no page performs backend reads.
export function getPublicationSnapshot(): PublicationSnapshot {
  if (!snapshot) {
    const path = resolve(process.cwd(), ".cache/publication.json");
    snapshot = JSON.parse(readFileSync(path, "utf8")) as PublicationSnapshot;
    if (!["live", "fixture"].includes(snapshot.mode) || !snapshot.events?.length) throw new Error("Invalid publication snapshot. Run the build preparation command.");
  }
  return snapshot;
}
