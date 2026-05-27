// components/TimelineFilters.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import YearRangeSlider from "./YearRangeSlider";
import type { Tag } from "@/lib/types";

const CATEGORIES = ["All", "Laws", "Breweries", "Events", "People", "Science", "Styles"];

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
}: TimelineFiltersProps) {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const clearTags = () => setSelectedTagIds([]);

  const selectedCount = selectedTagIds.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isTagDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!dropdownRef.current) return;
      if (target && dropdownRef.current.contains(target)) return;

      setIsTagDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagDropdownOpen]);

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
              className={`px-3 py-1 text-sm rounded-full border transition
${isActive ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100"}`}
            >
              {cat}
            </button>
          );
        })}

        {/* TAG FILTER DROPDOWN TRIGGER, INLINE WITH CATEGORY BUTTONS */}
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
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No tags available
                  </div>
                )}

                {allTags.map((tag) => {
                  const checked = selectedTagIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={checked}
                        onChange={() => toggleTag(tag.id)}
                      />
                      <span>{tag.name}</span>
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
      />
    </div>
  );
}
