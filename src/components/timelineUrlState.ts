import type { TagFilterMode } from "./timelineFiltering";
import type { Tag } from "@/lib/types";

export type TimelineUrlState = {
  activeCategory: string | null;
  startYear: number;
  endYear: number;
  selectedTagIds: string[];
  tagFilterMode: TagFilterMode;
  searchQuery: string;
  isOldestFirst: boolean;
};

type TimelineUrlOptions = {
  minYear: number;
  maxYear: number;
  urlTags: Tag[];
};

function clampYear(value: string | null, fallback: number, options: TimelineUrlOptions) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isNaN(parsed)
    ? fallback
    : Math.max(options.minYear, Math.min(options.maxYear, parsed));
}

export function parseTimelineUrlState(
  search: string | URLSearchParams,
  options: TimelineUrlOptions
): TimelineUrlState {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const tagNameToId = new Map(options.urlTags.map((tag) => [tag.name, tag.id]));
  const tagNames = params
    .getAll("tags")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const selectedTagIds = Array.from(
    new Set(
      tagNames
        .map((name) => tagNameToId.get(name))
        .filter((id): id is string => id !== undefined)
    )
  );
  const parsedStartYear = clampYear(params.get("from"), options.minYear, options);
  const parsedEndYear = clampYear(params.get("to"), options.maxYear, options);

  return {
    activeCategory: params.get("category"),
    startYear: Math.min(parsedStartYear, parsedEndYear),
    endYear: Math.max(parsedStartYear, parsedEndYear),
    selectedTagIds,
    tagFilterMode:
      selectedTagIds.length > 0 && params.get("tagMode") === "any"
        ? "any"
        : "all",
    searchQuery: params.get("string") ?? "",
    isOldestFirst: params.get("order") === "oldest",
  };
}

export function serializeTimelineUrlState(
  state: TimelineUrlState,
  currentSearch: string | URLSearchParams,
  options: TimelineUrlOptions
): string {
  const params =
    typeof currentSearch === "string"
      ? new URLSearchParams(currentSearch)
      : new URLSearchParams(currentSearch);
  const tagIdToName = new Map(options.urlTags.map((tag) => [tag.id, tag.name]));

  for (const name of ["category", "from", "to", "tags", "tagMode", "string", "order"]) {
    params.delete(name);
  }

  if (state.activeCategory) params.set("category", state.activeCategory);
  if (state.startYear !== options.minYear) params.set("from", String(state.startYear));
  if (state.endYear !== options.maxYear) params.set("to", String(state.endYear));

  const tagNames = state.selectedTagIds
    .map((id) => tagIdToName.get(id))
    .filter((name): name is string => name !== undefined);

  if (tagNames.length > 0) {
    params.set("tags", tagNames.join(","));
    if (state.tagFilterMode === "any") params.set("tagMode", "any");
  }

  const trimmedSearchQuery = state.searchQuery.trim();
  if (trimmedSearchQuery) params.set("string", trimmedSearchQuery);
  if (state.isOldestFirst) params.set("order", "oldest");

  return params.toString();
}
