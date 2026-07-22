// components/Timeline.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TimelineFiltersWrapper } from "./TimelineFiltersWrapper";
import EventCard from "./EventCard";
import TimelineModal from "./TimelineModal";
import {
  filterTimelineEvents,
  type TagFilterMode,
} from "./timelineFiltering";
import { getRelatedEvents } from "./timelineUtils";
import type { TimelineEvent, Tag } from "@/lib/types";

type TimelineProps = {
  events: TimelineEvent[];

  // Tags shown in the manual dropdown
  allTags: Tag[];

  // Complete tag list used for direct URL links
  urlTags: Tag[];

  minYear: number;
  maxYear: number;
};

export default function Timeline({
  events,
  allTags,
  urlTags,
  minYear,
  maxYear,
}: TimelineProps) {
  const router = useRouter();

  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null
  );
  const [randomEvent, setRandomEvent] = useState<TimelineEvent | null>(null);
  const [isRollingRandom, setIsRollingRandom] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(minYear);
  const [endYear, setEndYear] = useState(maxYear);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] =
    useState<TagFilterMode>("all");
  const [isOldestFirst, setIsOldestFirst] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchString = params.get("string");
    const tagMode = params.get("tagMode");

    if (searchString) {
      setSearchQuery(searchString);
    }

    if (tagMode === "any") {
      setTagFilterMode("any");
    }
  }, []);

  useEffect(() => {
    const currentUrl =
      window.location.pathname + window.location.search;
    const params = new URLSearchParams(window.location.search);

    if (searchQuery.trim() !== "") {
      params.set("string", searchQuery.trim());
    } else {
      params.delete("string");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [searchQuery, router]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    urlTags.forEach((tag) => {
      counts.set(tag.id, 0);
    });

    events.forEach((event) => {
      event.tags?.forEach((tag) => {
        counts.set(tag.id, (counts.get(tag.id) || 0) + 1);
      });
    });

    return counts;
  }, [events, urlTags]);

  const filteredEvents = useMemo(
    () =>
      filterTimelineEvents({
        events,
        activeCategory,
        startYear,
        endYear,
        selectedTagIds,
        tagFilterMode,
        isOldestFirst,
        searchQuery,
      }),
    [
      events,
      activeCategory,
      startYear,
      endYear,
      selectedTagIds,
      tagFilterMode,
      isOldestFirst,
      searchQuery,
    ]
  );

  const totalEvents = events.length;
  const showingCount = filteredEvents.length;

  const hasActiveFilters =
    activeCategory !== null ||
    startYear !== minYear ||
    endYear !== maxYear ||
    selectedTagIds.length > 0 ||
    searchQuery.trim() !== "";

  const selectedEvent =
    selectedEventIndex !== null
      ? filteredEvents[selectedEventIndex]
      : null;

  const modalEvent = randomEvent ?? selectedEvent;
  const isRandomDiscovery = randomEvent !== null;
  const relatedEvents = modalEvent
    ? getRelatedEvents(modalEvent, events)
    : [];

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
    if (randomEvent) {
      return;
    }

    if (
      selectedEventIndex !== null &&
      selectedEventIndex < filteredEvents.length - 1
    ) {
      setSelectedEventIndex(selectedEventIndex + 1);
    }
  };

  const handlePrevEvent = () => {
    if (randomEvent) {
      return;
    }

    if (selectedEventIndex !== null && selectedEventIndex > 0) {
      setSelectedEventIndex(selectedEventIndex - 1);
    }
  };

  const handleRandomEvent = () => {
    if (events.length === 0 || isRollingRandom) {
      return;
    }

    setIsRollingRandom(true);

    window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * events.length);

      setSelectedEventIndex(null);
      setRandomEvent(events[randomIndex]);
      setIsRollingRandom(false);
    }, 350);
  };

  const toggleOrder = () => {
    setIsOldestFirst(!isOldestFirst);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedEventIndex === null || randomEvent) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextEvent();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevEvent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        urlTags={urlTags}
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
        tagFilterMode={tagFilterMode}
        setTagFilterMode={setTagFilterMode}
        tagCounts={tagCounts}
        minYear={minYear}
        maxYear={maxYear}
      />

      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-6">
        <div className="w-full md:w-auto flex justify-center">
          <div className="px-4 py-1 text-sm bg-stone-100 rounded-full text-stone-700 whitespace-nowrap">
            {hasActiveFilters ? (
              <>
                Showing{" "}
                <span className="font-semibold">{showingCount}</span> of{" "}
                <span className="font-semibold">{totalEvents}</span>{" "}
                events
              </>
            ) : (
              <>
                <span className="font-semibold">{totalEvents}</span>{" "}
                events in total
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
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
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
            <span>
              {isOldestFirst ? "Oldest first" : "Newest first"}
            </span>
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No events match your filters.
          </p>

          <p className="text-gray-400 text-sm mt-2">
            Try adjusting the category, year range, tags, or search
            term.
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

      <button
        onClick={handleRandomEvent}
        disabled={events.length === 0 || isRollingRandom}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 md:h-auto md:w-auto md:px-5 md:py-3 md:rounded-full"
        aria-label="Open random event"
        title="Open random event"
      >
        <span
          className={`text-xl md:mr-2 ${
            isRollingRandom ? "animate-spin" : ""
          }`}
        >
          🎲
        </span>

        <span className="hidden text-sm font-semibold md:inline">
          {isRollingRandom ? "Rolling..." : "Surprise Me"}
        </span>
      </button>

      {modalEvent && (
        <TimelineModal
          event={modalEvent}
          relatedEvents={relatedEvents}
          onOpenRelatedEvent={handleOpenRelatedEvent}
          onClose={handleCloseModal}
          onNext={handleNextEvent}
          onPrev={handlePrevEvent}
          hasNext={
            !isRandomDiscovery &&
            selectedEventIndex !== null &&
            selectedEventIndex < filteredEvents.length - 1
          }
          hasPrev={
            !isRandomDiscovery &&
            selectedEventIndex !== null &&
            selectedEventIndex > 0
          }
          isRandomDiscovery={isRandomDiscovery}
        />
      )}
    </>
  );
}