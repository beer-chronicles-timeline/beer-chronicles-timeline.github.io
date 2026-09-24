import { publishedEventPaths } from "../../src/lib/eventAliases";
import { STORYLINES } from "../../src/lib/storylines";
import type { PublicationRows } from "../../src/lib/publicationData";

// Synthetic data only. Known IDs/path labels exercise existing routing and map
// assignments; descriptions and dates are test values, never editorial records.
export function createPublicationFixture(count = 750): PublicationRows {
  const requiredIds = [...new Set([
    ...STORYLINES.map((s) => s.featuredEventId),
    "0a5a3946-30db-4a61-8d4d-bc36cbda6a7b", "3df5535f-0f59-463a-8e3e-ff80ec998e3a",
    "1c650d85-7d10-4e17-a7af-76a7a8c4556e", "fc252325-4204-4381-b718-234fa91110dc",
    "db044422-0cf2-4cd7-abac-cc7c093a127a",
  ])];
  if (!Number.isSafeInteger(count) || count < requiredIds.length) throw new Error(`Fixture requires at least ${requiredIds.length} events`);
  const ids = [...new Set([...requiredIds, ...Object.keys(publishedEventPaths)])].slice(0, count);
  const names = [...new Set([...STORYLINES.flatMap((s) => [...s.tagNames, ...(s.requiredTagNames ?? [])]), "Milestone", "Carlsberg", "Germany"])];
  const tags = names.map((name, i) => ({ id: `fixture-tag-${i}`, name }));
  const events = Array.from({ length: count }, (_, index) => {
    const id = ids[index] ?? `fixture-event-${index}`;
    const year = ["3df5535f-0f59-463a-8e3e-ff80ec998e3a", "db044422-0cf2-4cd7-abac-cc7c093a127a"].includes(id) ? 1869 : id === "fc252325-4204-4381-b718-234fa91110dc" ? 1516 : index === 0 ? -13000 : index === count - 1 ? 2026 : 1200 + index % 827;
    return {
      id, title: publishedEventPaths[id]?.[0].replaceAll("-", " ") ?? `Synthetic test entry ${index}`,
      description: `Synthetic publication fixture ${index}. This is test data, not a historical assertion.`,
      event_date: null, historical_year: year, category: index % 2 ? "Laws" : "Events",
      date_precision: "year", sources: "Test reference: https://example.org/fixture", image_url: null, created_at: null,
    };
  });
  const eventTags = events.flatMap((event, index) => {
    const featured = STORYLINES.filter((s) => s.featuredEventId === event.id).flatMap((s) => [...s.tagNames, ...(s.requiredTagNames ?? [])]);
    return tags.filter((tag, tagIndex) => featured.includes(tag.name) || tagIndex === index % tags.length)
      .map((tag) => ({ event_id: event.id, tag_id: tag.id }));
  });
  return { events, tags, eventTags };
}
