// components/Timeline.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TimelineFiltersWrapper } from "./TimelineFiltersWrapper";
import type { TimelineEvent, Tag } from "@/lib/types";

type TimelineProps = {
  events: TimelineEvent[];
  allTags: Tag[];
  minYear: number;
  maxYear: number;
};

// Safari-safe date formatter with decade support
function formatEventDate(event: TimelineEvent): string {
  const raw = event.event_date;
  if (!raw) return "";

  // Handle decade precision
  if (event.date_precision === "decade") {
    const year = raw.slice(0, 4);
    const decadeStart = Math.floor(parseInt(year, 10) / 10) * 10;
    return `${decadeStart}s`;
  }

  // Handle month precision (e.g., "October 1990")
  if (event.date_precision === "month") {
    const parts = raw.split("-");
    if (parts.length >= 2) {
      const [year, month] = parts;
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const m = parseInt(month, 10) - 1;
      if (!Number.isNaN(m) && m >= 0 && m < 12) {
        return `${monthNames[m]} ${year}`;
      }
    }
    return raw;
  }

  // Handle year precision
  if (event.date_precision === "year") {
    return raw.slice(0, 4);
  }

  // Handle full date
  const parts = raw.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (parts.length === 3) {
    const [year, month, day] = parts;
    const m = parseInt(month, 10) - 1;
    const d = parseInt(day, 10);
    if (!Number.isNaN(m) && m >= 0 && m < 12 && !Number.isNaN(d)) {
      return `${monthNames[m]} ${d}, ${year}`;
    }
  }

  if (parts.length === 2) {
    const [year, month] = parts;
    const m = parseInt(month, 10) - 1;
    if (!Number.isNaN(m) && m >= 0 && m < 12) {
      return `${monthNames[m]} ${year}`;
    }
  }

  return raw;
}

// Simple word-boundary truncation for card preview
function truncate(text: string | null | undefined, max = 160): string | null {
  if (!text) return null;
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return `${slice.slice(0, cut > 80 ? cut : max).trim()}…`;
}

// URL helpers for sources
const urlRegex = /\b(https?:\/\/[^\s)]+|www\.[^\s)]+)\b/gi;
function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `[${url}](https://${url})`;
  return url;
}

export default function Timeline({ events, allTags, minYear, maxYear }: TimelineProps) {
  const router = useRouter();

  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(minYear);
  const [endYear, setEndYear] = useState(maxYear);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isOldestFirst, setIsOldestFirst] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // READ SEARCH QUERY FROM URL ON MOUNT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("string");
    if (s) {
      setSearchQuery(s);
    }
  }, []);

  // UPDATE URL WHEN SEARCH QUERY CHANGES
  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim() !== "") {
      params.set("string", searchQuery.trim());
    } else {
      params.delete("string");
    }
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    // Only push if the URL actually changed
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [searchQuery, router]);

  // Calculate tag counts (how many events have each tag)
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allTags.forEach(tag => counts.set(tag.id, 0));

    events.forEach(event => {
      event.tags?.forEach(tag => {
        counts.set(tag.id, (counts.get(tag.id) || 0) + 1);
      });
    });

    return counts;
  }, [events, allTags]);

  const filteredEvents = useMemo(
    () => {
      let filtered = events.filter((event) => {
        if (activeCategory && event.category !== activeCategory) return false;

        const eventYear = parseInt(event.event_date.slice(0, 4), 10);
        if (eventYear < startYear || eventYear > endYear) return false;

        if (selectedTagIds.length > 0) {
          const eventTags = event.tags ?? [];
          const eventTagIds = eventTags.map((t) => t.id);
          const hasAllSelected = selectedTagIds.every((id) =>
            eventTagIds.includes(id)
          );
          if (!hasAllSelected) return false;
        }

        // Search filter: split by spaces, treat as AND (all tokens must match)
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery !== "") {
          const tokens = trimmedQuery.split(/\s+/).filter(t => t.length > 0);
          const lowerTitle = (event.title || "").toLowerCase();
          const lowerDescription = (event.description || "").toLowerCase();

          // All tokens (lowercased) must be found in either title or description
          const allTokensMatch = tokens.every(token => {
            const lowerToken = token.toLowerCase();
            return lowerTitle.includes(lowerToken) || lowerDescription.includes(lowerToken);
          });

          if (!allTokensMatch) return false;
        }

        return true;
      });

      // Sort based on toggle state
      if (isOldestFirst) {
        return filtered.sort((a, b) => {
          const yearA = parseInt(a.event_date.slice(0, 4), 10);
          const yearB = parseInt(b.event_date.slice(0, 4), 10);
          return yearA - yearB;
        });
      } else {
        return filtered.sort((a, b) => {
          const yearA = parseInt(a.event_date.slice(0, 4), 10);
          const yearB = parseInt(b.event_date.slice(0, 4), 10);
          return yearB - yearA;
        });
      }
    },
    [events, activeCategory, startYear, endYear, selectedTagIds, isOldestFirst, searchQuery]
  );

  const totalEvents = events.length;
  const showingCount = filteredEvents.length;
  const hasActiveFilters = activeCategory !== null || startYear !== minYear || endYear !== maxYear || selectedTagIds.length > 0 || searchQuery.trim() !== "";

  const selectedEvent = selectedEventIndex !== null ? filteredEvents[selectedEventIndex] : null;

  const handleOpenModal = (index: number) => {
    setSelectedEventIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedEventIndex(null);
  };

  const handleNextEvent = () => {
    if (selectedEventIndex !== null && selectedEventIndex < filteredEvents.length - 1) {
      setSelectedEventIndex(selectedEventIndex + 1);
    }
  };

  const handlePrevEvent = () => {
    if (selectedEventIndex !== null && selectedEventIndex > 0) {
      setSelectedEventIndex(selectedEventIndex - 1);
    }
  };

  const toggleOrder = () => {
    setIsOldestFirst(!isOldestFirst);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEventIndex === null) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextEvent();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevEvent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventIndex, filteredEvents.length]);

  return (
    <>
      <TimelineFiltersWrapper
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        startYear={startYear}
        endYear={endYear}
        setStartYear={setStartYear}
        setEndYear={setEndYear}
        allTags={allTags}
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
        tagCounts={tagCounts}
        minYear={minYear}
        maxYear={maxYear}
      />

      {/* Event Count Indicator with Search and Order Toggle - perfectly centered as a block */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3">
          <div className="px-4 py-1 text-sm bg-stone-100 rounded-full text-stone-700 whitespace-nowrap">
            {hasActiveFilters ? (
              <>Showing <span className="font-semibold">{showingCount}</span> of <span className="font-semibold">{totalEvents}</span> events</>
            ) : (
              <><span className="font-semibold">{totalEvents}</span> events in total</>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 px-3 py-1 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none bg-white text-stone-700 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={toggleOrder}
            className="flex items-center gap-1.5 px-4 py-1 text-sm bg-stone-100 hover:bg-stone-200 rounded-full transition text-stone-700 whitespace-nowrap"
            aria-label="Toggle timeline order"
          >
            <span>{isOldestFirst ? "↑" : "↓"}</span>
            <span>{isOldestFirst ? "Oldest first" : "Newest first"}</span>
          </button>
        </div>
      </div>

      {/* TIMELINE - separate overlap for portrait, landscape, and desktop */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No events match your filters.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting the category, year range, tags, or search term.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-1/2 top-0 w-1.5 h-full bg-gray-300 -translate-x-1/2"></div>

          <div className="flex flex-col gap-0">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div key={event.id} className="relative flex w-full items-center -mt-20 landscape:-mt-8 first:mt-0 md:-mt-8">
                  {/* Left side */}
                  <div className="w-1/2 flex justify-end pr-4 md:pr-7">
                    {isLeft && (
                      <EventCard
                        event={event}
                        onClick={() => handleOpenModal(index)}
                      />
                    )}
                  </div>

                  <div className="w-0 relative flex justify-center">
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-10"></div>
                  </div>

                  {/* Right side */}
                  <div className="w-1/2 flex justify-start pl-4 md:pl-7">
                    {!isLeft && (
                      <EventCard
                        event={event}
                        onClick={() => handleOpenModal(index)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedEvent && (
        <Modal
          event={selectedEvent}
          onClose={handleCloseModal}
          onNext={handleNextEvent}
          onPrev={handlePrevEvent}
          hasNext={selectedEventIndex !== null && selectedEventIndex < filteredEvents.length - 1}
          hasPrev={selectedEventIndex !== null && selectedEventIndex > 0}
        />
      )}
    </>
  );
}

type EventCardProps = {
  event: TimelineEvent;
  onClick: () => void;
};

function EventCard({ event, onClick }: EventCardProps) {
  function getCategoryStyle(category: string | null | undefined) {
    switch (category) {
      case "Laws":
        return "bg-red-100 text-red-800";
      case "Breweries":
        return "bg-yellow-100 text-yellow-800";
      case "Events":
        return "bg-blue-100 text-blue-800";
      case "People":
        return "bg-purple-100 text-purple-800";
      case "Science":
        return "bg-green-100 text-green-800";
      case "Styles":
        return "bg-orange-100 text-orange-800";
      case "Community":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const preview = truncate(event.description, 170);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 shadow-md rounded-lg p-3.5 max-w-sm w-full cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-lg"
    >
      <p className="text-[13px] leading-snug text-gray-500">
        {formatEventDate(event)}
      </p>

      {/* Category - visible on mobile only, placed between date and title */}
      {event.category && (
        <div className="mt-1.5 md:hidden">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${getCategoryStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mt-1">
        <h2 className="text-base leading-tight font-semibold font-serif text-stone-900 break-words hyphens-auto">
          {event.title}
        </h2>

        {/* Category - hidden on mobile, visible on desktop next to title */}
        {event.category && (
          <span
            className={`hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full font-sans whitespace-nowrap ${getCategoryStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        )}
      </div>

      {preview && (
        <p className="text-[13px] leading-snug text-gray-600 mt-1 break-words hyphens-auto">
          {preview}
        </p>
      )}
    </div>
  );
}

type ModalProps = {
  event: TimelineEvent;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
};

function Modal({ event, onClose, onNext, onPrev, hasNext, hasPrev }: ModalProps) {
  useEffect(() => {
    // Get the current scroll position
    const scrollY = window.scrollY;

    // Lock the body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      // Restore the body and scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  // Parse sources into lines
  const rawLines =
    (event.sources || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200 rounded-lg p-6 max-w-lg w-full relative transform transition-all duration-200 scale-100 opacity-100 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl hover:text-gray-700 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="pr-8">
          <p className="text-sm text-gray-500 mb-2">{formatEventDate(event)}</p>

          <h2 className="text-lg font-semibold font-serif text-stone-900">
            {event.title}
          </h2>

          {event.category && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${(() => {
                switch (event.category) {
                  case "Laws": return "bg-red-100 text-red-800";
                  case "Breweries": return "bg-yellow-100 text-yellow-800";
                  case "Events": return "bg-blue-100 text-blue-800";
                  case "People": return "bg-purple-100 text-purple-800";
                  case "Science": return "bg-green-100 text-green-800";
                  case "Styles": return "bg-orange-100 text-orange-800";
                  case "Community": return "bg-pink-100 text-pink-800";
                  default: return "bg-gray-100 text-gray-700";
                }
              })()}`}>
                {event.category}
              </span>
            </div>
          )}

          {event.description && (
            <p className="text-gray-700 font-sans whitespace-pre-line mt-3">
              {event.description}
            </p>
          )}

          {rawLines.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h3 className="text-sm font-semibold text-stone-800 mb-2">
                Sources
              </h3>

              <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700 break-words">
                {rawLines.map((line, i) => {
                  const match = line.match(urlRegex);
                  if (!match) {
                    return <li key={i}>{line}</li>;
                  }
                  const firstUrl = match[0];
                  const href = normalizeUrl(firstUrl);
                  return (
                    <li key={i}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline break-all"
                      >
                        {firstUrl}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Navigation hint - hidden on mobile, visible on desktop */}
          <div className="hidden md:block mt-4 pt-3 border-t text-xs text-center text-gray-400">
            ← →  arrow keys to navigate
          </div>
        </div>
      </div>
    </div>
  );
}