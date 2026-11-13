export type EventSources = {
  version: 1;
  eventId: string;
  revision: string;
  sources: string | null;
};

export function isSourceRevision(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{20}$/.test(value);
}

export function getEventSourcesPath(eventId: string, revision: string): string {
  if (!isSourceRevision(revision)) throw new Error("Invalid source revision");
  return `/events/${encodeURIComponent(eventId)}/sources/${revision}/data.json`;
}

export function decodeEventSources(
  data: unknown,
  eventId: string,
  revision: string
): EventSources {
  if (
    typeof data !== "object" || data === null ||
    !("version" in data) || data.version !== 1 ||
    !("eventId" in data) || data.eventId !== eventId ||
    !("revision" in data) || data.revision !== revision ||
    !isSourceRevision(data.revision) ||
    !("sources" in data) ||
    (data.sources !== null && typeof data.sources !== "string")
  ) {
    throw new Error("Sources do not match this entry");
  }

  return data as EventSources;
}
