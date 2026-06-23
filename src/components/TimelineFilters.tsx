// components/TimelineFilters.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import YearRangeSlider from "./YearRangeSlider";
import type { Tag } from "@/lib/types";

const CATEGORIES = ["All", "Laws", "Breweries", "Events", "People", "Science", "Styles", "Community"];

type TimelineFiltersProps = {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  startYear: number;
  endYear: number;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;

  allTags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;

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
  selectedTagIds,
  setSelectedTagIds,
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
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const clearTags = () => setSelectedTagIds([]);

  const selectedCount = selectedTagIds.length;

  // Build tag name <-> ID lookups
  const tagNameToId = useMemo(() => {
    const map = new Map<string, string>();
    allTags.forEach(tag => map.set(tag.name, tag.id));
    return map;
  }, [allTags]);

  const tagIdToName = useMemo(() => {
    const map = new Map<string, string>();
    allTags.forEach(tag => map.set(tag.id, tag.name));
    return map;
  }, [allTags]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isTagDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!dropdownRef.current) return;
      if (target && dropdownRef.current.contains(target)) return;
      setIsTagDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTagDropdownOpen]);

  // READ URL PARAMS ON MOUNT
  useEffect(() => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;
    isUpdatingFromUrl.current = true;

    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const tagNames = searchParams.get("tags");
    // We don't need to read 'string' here – Timeline handles that

    if (category) setActiveCategory(category);
    if (from) {
      const fromYear = parseInt(from, 10);
      if (!isNaN(fromYear)) setStartYear(fromYear);
    }
    if (to) {
      const toYear = parseInt(to, 10);
      if (!isNaN(toYear)) setEndYear(toYear);
    }
    if (tagNames) {
      const ids = tagNames.split(",")
        .map(name => tagNameToId.get(name))
        .filter((id): id is string => id !== undefined);
      if (ids.length > 0) setSelectedTagIds(ids);
    }

    isUpdatingFromUrl.current = false;
  }, [searchParams, setActiveCategory, setStartYear, setEndYear, setSelectedTagIds, tagNameToId]);

  // CREATE URL STATE FOR COMPARISON
  const currentUrlState = useMemo(() => {
    const params = new URLSearchParams();

    if (activeCategory) params.set("category", activeCategory);
    if (startYear !== minYear) params.set("from", startYear.toString());
    if (endYear !== maxYear) params.set("to", endYear.toString());
    if (selectedTagIds.length > 0) {
      const names = selectedTagIds
        .map(id => tagIdToName.get(id))
        .filter((name): name is string => name !== undefined);
      if (names.length > 0) params.set("tags", names.join(","));
    }

    // Preserve existing 'string' parameter
    const existingString = searchParams.get("string");
    if (existingString) params.set("string", existingString);

    return params.toString();
  }, [activeCategory, startYear, endYear, selectedTagIds, minYear, maxYear, tagIdToName, searchParams]);

  // UPDATE URL ONLY WHEN STATE CHANGES AND NOT FROM URL UPDATE
  useEffect(() => {
    if (isFirstRender.current || isUpdatingFromUrl.current) return;

    const currentUrl = searchParams.toString();
    if (currentUrlState !== currentUrl) {
      const url = currentUrlState ? `/?${currentUrlState}` : "/";
      router.push(url, { scroll: false });
    }
  }, [currentUrlState, searchParams, router]);

  return (
    <div className="mb-6 space-y-4">
      {/* CATEGORY FILTER BUTTONS + TAGS BUTTON INLINE */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((cat) => {
          const isAll = cat === "All";
          const isActive = (isAll && !activeCategory) || activeCategory === cat;

          return (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(isAll ? null : cat)}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                isActive ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          );
        })}

        {/* TAG FILTER DROPDOWN */}
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsTagDropdownOpen((open) => !open)}
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
                {allTags.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-500">No tags available</div>
                )}
                {allTags.map((tag) => {
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
                      <span className="text-xs text-gray-400">{count}</span>
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

      {/* YEAR RANGE SLIDER */}
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