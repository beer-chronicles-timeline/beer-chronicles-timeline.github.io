import catalog from "@/data/bjcp-2021.json";
import { compareEventsChronologicallyDescending, formatEventDate } from "@/components/timelineUtils";
import { getEventPath } from "@/lib/eventUrls";
import type { TimelineEvent } from "@/lib/types";

export type BjcpStyle = {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  url: string;
  tagNames: string[];
  isEntryCategory?: boolean;
};

export type BjcpCoverageEntry = { id: string; title: string; href: string; dateLabel: string };
export type BjcpCoverageRow = BjcpStyle & { entries: BjcpCoverageEntry[] };
export type BjcpCoverageCategory = { id: string; name: string; url: string; styles: BjcpCoverageRow[] };

export const BJCP_2021_STYLES: readonly BjcpStyle[] = catalog.styles;
export const BJCP_2021_CATEGORIES = catalog.categories;
export const BJCP_2021_SOURCE_URL = catalog.sourceUrl;

function tagKey(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Count distinct entries with an exact style tag or a documented equivalent.
 * Broad family tags and words in descriptions never create assignments.
 */
export function buildBjcpCoverage(events: readonly TimelineEvent[]): BjcpCoverageCategory[] {
  const eventsByTag = new Map<string, Map<string, TimelineEvent>>();
  for (const event of events) {
    for (const tag of event.tags ?? []) {
      const key = tagKey(tag.name);
      const matches = eventsByTag.get(key) ?? new Map<string, TimelineEvent>();
      matches.set(event.id, event);
      eventsByTag.set(key, matches);
    }
  }
  return BJCP_2021_CATEGORIES.map(category => ({
    ...category,
    styles: BJCP_2021_STYLES.filter(style => style.categoryId === category.id).map(style => {
      const matches = new Map<string, TimelineEvent>();
      for (const name of style.tagNames) {
        for (const [id, event] of eventsByTag.get(tagKey(name)) ?? []) matches.set(id, event);
      }
      return {
        ...style,
        entries: [...matches.values()].sort(compareEventsChronologicallyDescending).map(event => ({
          id: event.id, title: event.title, href: getEventPath(event.id, event.title), dateLabel: formatEventDate(event),
        })),
      };
    }),
  }));
}

export function getBjcpCoverageTotals(categories: readonly BjcpCoverageCategory[]) {
  const styles = categories.flatMap(category => category.styles);
  return {
    profiles: styles.length,
    covered: styles.filter(style => style.entries.length > 0).length,
    entries: new Set(styles.flatMap(style => style.entries.map(entry => entry.id))).size,
  };
}

export function filterBjcpCoverage(categories: readonly BjcpCoverageCategory[], query: string, coverage: "all" | "covered" | "uncovered") {
  const needle = tagKey(query);
  const isCodeQuery = /^(?:\d+[a-z]|x\d+)$/.test(needle);
  return categories.map(category => ({
    ...category,
    styles: category.styles.filter(style => {
      const matchesQuery = isCodeQuery
        ? tagKey(style.code) === needle
        : tagKey(`${style.code} ${style.name} ${category.name} ${style.tagNames.join(" ")}`).includes(needle);
      return matchesQuery && (coverage === "all" || (coverage === "covered" ? style.entries.length > 0 : style.entries.length === 0));
    }),
  })).filter(category => category.styles.length > 0);
}
