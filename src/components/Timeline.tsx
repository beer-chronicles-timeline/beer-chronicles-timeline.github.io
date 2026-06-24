// components/Timeline.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { TimelineFiltersWrapper } from "./TimelineFiltersWrapper";
import type { TimelineEvent, Tag } from "@/lib/types";

type TimelineProps = {
  events: TimelineEvent[];
  allTags: Tag[];
  minYear: number;
  maxYear: number;
};

function formatEventDate(event: TimelineEvent): string {
  const raw = event.event_date;
  if (!raw) return "";

  if (event.date_precision === "decade") {
    const year = raw.slice(0, 4);
    const decadeStart = Math.floor(parseInt(year, 10) / 10) * 10;
    return `${decadeStart}s`;
  }

  if (event.date_precision === "month") {
    const [year, month] = raw.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const m = parseInt(month, 10) - 1;
    return !Number.isNaN(m) && m >= 0 && m < 12 ? `${monthNames[m]} ${year}` : raw;
  }

  if (event.date_precision === "year") return raw.slice(0, 4);

  const [year, month, day] = raw.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const m = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);

  if (!Number.isNaN(m) && m >= 0 && m < 12 && !Number.isNaN(d)) {
    return `${monthNames[m]} ${d}, ${year}`;
  }

  return raw;
}

function truncate(text: string | null | undefined, max = 160): string | null {
  if (!text) return null;
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return `${slice.slice(0, cut > 80 ? cut : max).trim()}…`;
}

function getRelatedEvents(currentEvent: TimelineEvent, events: TimelineEvent[]) {
  const currentTagIds = new Set((currentEvent.tags ?? []).map((tag) => tag.id));
  const currentYear = parseInt(currentEvent.event_date.slice(0, 4), 10);

  return events
    .filter((event) => event.id !== currentEvent.id)
    .map((event) => {
      const eventTagIds = (event.tags ?? []).map((tag) => tag.id);
      const sharedTagCount = eventTagIds.filter((id) => currentTagIds.has(id)).length;
      const sameCategory = event.category && event.category === currentEvent.category ? 1 : 0;
      const eventYear = parseInt(event.event_date.slice(0, 4), 10);
      const yearDistance = Math.abs(currentYear - eventYear);

      const score =
        sharedTagCount * 100 +
        sameCategory * 20 +
        Math.max(0, 20 - Math.floor(yearDistance / 25));

      return { event, score, sharedTagCount };
    })
    .filter((item) => item.sharedTagCount > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.event);
}

const urlRegex = /\b(https?:\/\/[^\s)]+|www\.[^\s)]+)\b/gi;

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `https://${url}`;
  return url;
}

export default function Timeline({ events, allTags, minYear, maxYear }: TimelineProps) {
  const router = useRouter();

  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [randomEvent, setRandomEvent] = useState<TimelineEvent | null>(null);
  const [isRollingRandom, setIsRollingRandom] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(minYear);
  const [endYear, setEndYear] = useState(maxYear);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isOldestFirst, setIsOldestFirst] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("string");
    if (s) setSearchQuery(s);
  }, []);

  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    const params = new URLSearchParams(window.location.search);

    if (searchQuery.trim() !== "") params.set("string", searchQuery.trim());
    else params.delete("string");

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    if (newUrl !== currentUrl) router.push(newUrl, { scroll: false });
  }, [searchQuery, router]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allTags.forEach((tag) => counts.set(tag.id, 0));

    events.forEach((event) => {
      event.tags?.forEach((tag) => {
        counts.set(tag.id, (counts.get(tag.id) || 0) + 1);
      });
    });

    return counts;
  }, [events, allTags]);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (activeCategory && event.category !== activeCategory) return false;

      const eventYear = parseInt(event.event_date.slice(0, 4), 10);
      if (eventYear < startYear || eventYear > endYear) return false;

      if (selectedTagIds.length > 0) {
        const eventTagIds = (event.tags ?? []).map((t) => t.id);
        if (!selectedTagIds.every((id) => eventTagIds.includes(id))) return false;
      }

      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery !== "") {
        const tokens = trimmedQuery.split(/\s+/).filter((t) => t.length > 0);
        const lowerTitle = (event.title || "").toLowerCase();
        const lowerDescription = (event.description || "").toLowerCase();

        const allTokensMatch = tokens.every((token) => {
          const lowerToken = token.toLowerCase();
          return lowerTitle.includes(lowerToken) || lowerDescription.includes(lowerToken);
        });

        if (!allTokensMatch) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const yearA = parseInt(a.event_date.slice(0, 4), 10);
      const yearB = parseInt(b.event_date.slice(0, 4), 10);
      return isOldestFirst ? yearA - yearB : yearB - yearA;
    });
  }, [events, activeCategory, startYear, endYear, selectedTagIds, isOldestFirst, searchQuery]);

  const totalEvents = events.length;
  const showingCount = filteredEvents.length;
  const hasActiveFilters =
    activeCategory !== null ||
    startYear !== minYear ||
    endYear !== maxYear ||
    selectedTagIds.length > 0 ||
    searchQuery.trim() !== "";

  const selectedEvent = selectedEventIndex !== null ? filteredEvents[selectedEventIndex] : null;
  const modalEvent = randomEvent ?? selectedEvent;
  const isRandomDiscovery = randomEvent !== null;
  const relatedEvents = modalEvent ? getRelatedEvents(modalEvent, events) : [];

  const handleOpenModal = (index: number) => {
    setRandomEvent(null);
    setSelectedEventIndex(index);
  };

  const handleOpenRelatedEvent = (event: TimelineEvent) => {
    setRandomEvent(event);
    setSelectedEventIndex(null);
  };

  const handleCloseModal = () => {
    setSelectedEventIndex(null);
    setRandomEvent(null);
  };

  const handleNextEvent = () => {
    if (randomEvent) return;
    if (selectedEventIndex !== null && selectedEventIndex < filteredEvents.length - 1) {
      setSelectedEventIndex(selectedEventIndex + 1);
    }
  };

  const handlePrevEvent = () => {
    if (randomEvent) return;
    if (selectedEventIndex !== null && selectedEventIndex > 0) {
      setSelectedEventIndex(selectedEventIndex - 1);
    }
  };

  const handleRandomEvent = () => {
    if (events.length === 0 || isRollingRandom) return;

    setIsRollingRandom(true);

    window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * events.length);
      setSelectedEventIndex(null);
      setRandomEvent(events[randomIndex]);
      setIsRollingRandom(false);
    }, 350);
  };

  const toggleOrder = () => setIsOldestFirst(!isOldestFirst);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEventIndex === null || randomEvent) return;

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
  }, [selectedEventIndex, filteredEvents.length, randomEvent]);

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

      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-6">
        <div className="w-full md:w-auto flex justify-center">
          <div className="px-4 py-1 text-sm bg-stone-100 rounded-full text-stone-700 whitespace-nowrap">
            {hasActiveFilters ? (
              <>
                Showing <span className="font-semibold">{showingCount}</span> of{" "}
                <span className="font-semibold">{totalEvents}</span> events
              </>
            ) : (
              <>
                <span className="font-semibold">{totalEvents}</span> events in total
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No events match your filters.</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting the category, year range, tags, or search term.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-1/2 top-0 w-1.5 h-full bg-gray-300 -translate-x-1/2"></div>

          <div className="flex flex-col gap-0">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={event.id}
                  className="relative flex w-full items-center -mt-20 landscape:-mt-8 first:mt-0 md:-mt-8"
                >
                  <div className="w-1/2 flex justify-end pr-4 md:pr-7">
                    {isLeft && <EventCard event={event} onClick={() => handleOpenModal(index)} />}
                  </div>

                  <div className="w-0 relative flex justify-center">
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-10"></div>
                  </div>

                  <div className="w-1/2 flex justify-start pl-4 md:pl-7">
                    {!isLeft && <EventCard event={event} onClick={() => handleOpenModal(index)} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleRandomEvent}
        disabled={events.length === 0 || isRollingRandom}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 md:h-auto md:w-auto md:px-5 md:py-3 md:rounded-full"
        aria-label="Open random event"
        title="Open random event"
      >
        <span className={`text-xl md:mr-2 ${isRollingRandom ? "animate-spin" : ""}`}>
          🎲
        </span>
        <span className="hidden text-sm font-semibold md:inline">
          {isRollingRandom ? "Rolling..." : "Surprise Me"}
        </span>
      </button>

      {modalEvent && (
        <Modal
          event={modalEvent}
          relatedEvents={relatedEvents}
          onOpenRelatedEvent={handleOpenRelatedEvent}
          onClose={handleCloseModal}
          onNext={handleNextEvent}
          onPrev={handlePrevEvent}
          hasNext={!isRandomDiscovery && selectedEventIndex !== null && selectedEventIndex < filteredEvents.length - 1}
          hasPrev={!isRandomDiscovery && selectedEventIndex !== null && selectedEventIndex > 0}
          isRandomDiscovery={isRandomDiscovery}
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
      case "Laws": return "bg-red-100 text-red-800";
      case "Breweries": return "bg-yellow-100 text-yellow-800";
      case "Events": return "bg-blue-100 text-blue-800";
      case "People": return "bg-purple-100 text-purple-800";
      case "Science": return "bg-green-100 text-green-800";
      case "Styles": return "bg-orange-100 text-orange-800";
      case "Community": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  const preview = truncate(event.description, 170);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 shadow-md rounded-lg p-3.5 max-w-sm w-full cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-lg"
    >
      <p className="text-[13px] leading-snug text-gray-500">{formatEventDate(event)}</p>

      {event.category && (
        <div className="mt-1.5 md:hidden">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${getCategoryStyle(event.category)}`}>
            {event.category}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mt-1">
        <h2 className="text-base leading-tight font-semibold font-serif text-stone-900 break-words hyphens-auto">
          {event.title}
        </h2>

        {event.category && (
          <span className={`hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full font-sans whitespace-nowrap ${getCategoryStyle(event.category)}`}>
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
  relatedEvents: TimelineEvent[];
  onOpenRelatedEvent: (event: TimelineEvent) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isRandomDiscovery?: boolean;
};

function Modal({
  event,
  relatedEvents,
  onOpenRelatedEvent,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isRandomDiscovery = false,
}: ModalProps) {
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    };
    }, []);

  useEffect(() => {
    modalContentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [event.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasNext) {
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
        ref={modalContentRef}
        className="bg-white border border-stone-200 rounded-lg p-6 max-w-lg w-full relative transform transition-all duration-200 scale-100 opacity-100 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl hover:text-gray-700 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="pr-8">
          {isRandomDiscovery && (
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                🎲 Random Discovery
              </span>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-2">{formatEventDate(event)}</p>

          <h2 className="text-lg font-semibold font-serif text-stone-900">
            {event.title}
          </h2>

          {event.category && (
            <div className="mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-sans bg-gray-100 text-gray-700">
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
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Sources</h3>

              <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700 break-words">
                {rawLines.map((line, i) => {
                  const match = line.match(urlRegex);

                  if (!match) return <li key={i}>{line}</li>;

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

          {relatedEvents.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h3 className="text-sm font-semibold text-stone-800">
                Continue Exploring
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Based on shared topics.
              </p>

              <div className="space-y-2">
                {relatedEvents.map((relatedEvent) => (
                  <button
                    key={relatedEvent.id}
                    type="button"
                    onClick={() => onOpenRelatedEvent(relatedEvent)}
                    className="block w-full text-left rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 hover:bg-stone-100 transition"
                  >
                    <div className="text-xs text-gray-500">
                      {formatEventDate(relatedEvent)}
                    </div>
                    <div className="text-sm font-semibold font-serif text-stone-900 mt-0.5">
                      {relatedEvent.title}
                    </div>
                    {relatedEvent.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        {truncate(relatedEvent.description, 100)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isRandomDiscovery && (
            <div className="hidden md:block mt-4 pt-3 border-t text-xs text-center text-gray-400">
              ← → arrow keys to navigate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}