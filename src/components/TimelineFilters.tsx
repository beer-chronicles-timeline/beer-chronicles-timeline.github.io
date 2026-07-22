// components/TimelineFilters.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import YearRangeSlider from "./YearRangeSlider";
import type { Tag } from "@/lib/types";
import type { TagFilterMode } from "./timelineFiltering";

const CATEGORIES = [
  "All",
  "Laws",
  "Breweries",
  "Events",
  "People",
  "Science",
  "Styles",
  "Community",
];

type TimelineFiltersProps = {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  startYear: number;
  endYear: number;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;

  // Tags normally displayed in the manual dropdown
  allTags: Tag[];

  // Complete tag list used to resolve direct URL links
  urlTags?: Tag[];

  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;

  tagFilterMode: TagFilterMode;
  setTagFilterMode: (mode: TagFilterMode) => void;

  tagCounts?: Map<string, number>;
  minYear: number;
  maxYear: number;
};

export function TimelineFilters({
  activeCategory,
  setActiveCategory,
  startYear,
  endYear,
  setStartYear,
  setEndYear,
  allTags,
  urlTags = allTags,
  selectedTagIds,
  setSelectedTagIds,
  tagFilterMode,
  setTagFilterMode,
  tagCounts,
  minYear,
  maxYear,
}: TimelineFiltersProps) {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const isUpdatingFromUrl = useRef(false);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      const nextSelectedTagIds = selectedTagIds.filter(
        (id) => id !== tagId
      );

      setSelectedTagIds(nextSelectedTagIds);

      if (nextSelectedTagIds.length === 0) {
        setTagFilterMode("all");
      }
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const clearTags = () => {
    setSelectedTagIds([]);
    setTagFilterMode("all");
  };

  const selectedCount = selectedTagIds.length;

  // Complete tag-name lookup for direct links, including hidden tags
  const tagNameToId = useMemo(() => {
    const map = new Map<string, string>();

    urlTags.forEach((tag) => {
      map.set(tag.name, tag.id);
    });

    return map;
  }, [urlTags]);

  // Complete tag-ID lookup so hidden URL tags remain in the URL
  const tagIdToName = useMemo(() => {
    const map = new Map<string, string>();

    urlTags.forEach((tag) => {
      map.set(tag.id, tag.name);
    });

    return map;
  }, [urlTags]);

  // Keep the normal visible tag list, but also display selected hidden tags.
  const dropdownTags = useMemo(() => {
    const visibleTagIds = new Set(allTags.map((tag) => tag.id));

    const selectedHiddenTags = urlTags.filter(
      (tag) =>
        selectedTagIds.includes(tag.id) &&
        !visibleTagIds.has(tag.id)
    );

    return [...selectedHiddenTags, ...allTags];
  }, [allTags, urlTags, selectedTagIds]);

  useEffect(() => {
    if (!isTagDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (!dropdownRef.current) {
        return;
      }

      if (target && dropdownRef.current.contains(target)) {
        return;
      }

      setIsTagDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  useEffect(() => {
    if (!isFirstRender.current) {
      return;
    }

    isFirstRender.current = false;
    isUpdatingFromUrl.current = true;

    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const tagNames = searchParams.get("tags");
    const tagMode = searchParams.get("tagMode");

    if (category) {
      setActiveCategory(category);
    }

    if (from) {
      const fromYear = Number.parseInt(from, 10);

      if (!Number.isNaN(fromYear)) {
        setStartYear(fromYear);
      }
    }

    if (to) {
      const toYear = Number.parseInt(to, 10);

      if (!Number.isNaN(toYear)) {
        setEndYear(toYear);
      }
    }

    if (tagNames) {
      const ids = tagNames
        .split(",")
        .map((name) => tagNameToId.get(name))
        .filter((id): id is string => id !== undefined);

      if (ids.length > 0) {
        setSelectedTagIds(ids);
      }
    }

    setTagFilterMode(tagMode === "any" ? "any" : "all");

    isUpdatingFromUrl.current = false;
  }, [
    searchParams,
    setActiveCategory,
    setStartYear,
    setEndYear,
    setSelectedTagIds,
    setTagFilterMode,
    tagNameToId,
  ]);

  const currentUrlState = useMemo(() => {
    const params = new URLSearchParams();
    const searchString = searchParams.get("string");

    if (activeCategory) {
      params.set("category", activeCategory);
    }

    if (startYear !== minYear) {
      params.set("from", startYear.toString());
    }

    if (endYear !== maxYear) {
      params.set("to", endYear.toString());
    }

    if (selectedTagIds.length > 0) {
      const names = selectedTagIds
        .map((id) => tagIdToName.get(id))
        .filter((name): name is string => name !== undefined);

      if (names.length > 0) {
        params.set("tags", names.join(","));
      }

      if (tagFilterMode === "any") {
        params.set("tagMode", "any");
      }
    }

    if (searchString) {
      params.set("string", searchString);
    }

    return params.toString();
  }, [
    activeCategory,
    startYear,
    endYear,
    selectedTagIds,
    tagFilterMode,
    minYear,
    maxYear,
    tagIdToName,
    searchParams,
  ]);

  useEffect(() => {
    if (isFirstRender.current || isUpdatingFromUrl.current) {
      return;
    }

    const currentUrl = searchParams.toString();

    if (currentUrlState !== currentUrl) {
      const url = currentUrlState ? `/?${currentUrlState}` : "/";

      router.replace(url, { scroll: false });
    }
  }, [currentUrlState, searchParams, router]);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((cat) => {
          const isAll = cat === "All";
          const isActive =
            (isAll && !activeCategory) || activeCategory === cat;

          return (
            <button
              type="button"
              key={cat}
              onClick={() =>
                setActiveCategory(isAll ? null : cat)
              }
              className={`px-3 py-1 text-sm rounded-full border transition
${isActive ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"}`}
            >
              {cat}
            </button>
          );
        })}

        <div
          className="relative inline-block text-left"
          ref={dropdownRef}
        >
          <button
            type="button"
            onClick={() =>
              setIsTagDropdownOpen((open) => !open)
            }
            className="inline-flex items-center gap-2 px-3 py-1 text-sm border rounded-full bg-white hover:bg-gray-50 transition"
          >
            <span>Tags</span>

            {selectedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">
                {selectedCount}
              </span>
            )}

            <span className="text-xs text-gray-500">
              {isTagDropdownOpen ? "▲" : "▼"}
            </span>
          </button>

          {isTagDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border z-20">
              <div className="max-h-64 overflow-auto py-2">
                {dropdownTags.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No tags available
                  </div>
                )}

                {dropdownTags.map((tag) => {
                  const checked = selectedTagIds.includes(tag.id);
                  const count = tagCounts?.get(tag.id) || 0;

                  return (
                    <label
                      key={tag.id}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={checked}
                          onChange={() => toggleTag(tag.id)}
                        />

                        <span>{tag.name}</span>
                      </div>

                      <span className="text-xs text-gray-400">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedCount > 0 && (
                <div className="border-t px-3 py-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={clearTags}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    Clear tags
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTagDropdownOpen(false)}
                    className="text-xs text-gray-900 font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <YearRangeSlider
        startYear={startYear}
        endYear={endYear}
        setStartYear={setStartYear}
        setEndYear={setEndYear}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  );
}