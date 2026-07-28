// lib/eventUrls.ts

const BASE_URL = "https://beer-chronicles.org";

export function createEventSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventPath(id: string, title: string): string {
  const slug = createEventSlug(title);

  return `/events/${encodeURIComponent(id)}/${slug}`;
}

export function getEventUrl(id: string, title: string): string {
  return new URL(getEventPath(id, title), BASE_URL).toString();
}

export function isCurrentEventSlug(
  suppliedSlug: string,
  title: string
): boolean {
  return suppliedSlug === createEventSlug(title);
}