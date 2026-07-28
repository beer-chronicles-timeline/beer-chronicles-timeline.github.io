// components/Timeline.tsx
"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
  const skipNextSearchUrlSyncRef = useRef(false);

  const [selectedEventIndex, setSelectedEventIndex] = useState<
    number | null
  >(null);
  const [randomEvent, setRandomEvent] =
    useState<TimelineEvent | null>(null);
  const [isRollingRandom, setIsRollingRandom] = useState(false);

  const [activeCategory, setActiveCategory] = useState<
    string | null
  >(null);
  const [startYear, setStartYear] = useState(minYear);
  const [endYear, setEndYear] = useState(maxYear);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    []
  );
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
    if (skipNextSearchUrlSyncRef.current) {
      skipNextSearchUrlSyncRef.current = false;
      return;
    }

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

  const handleOpenFilterLink = (href: string) => {
    const url = new URL(href, window.location.origin);
    const params = url.searchParams;

    const selectedTagNames = params
      .getAll("tags")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    const nextSelectedTagIds = urlTags
      .filter((tag) => selectedTagNames.includes(tag.name))
      .map((tag) => tag.id);

    const parsedStartYear = Number.parseInt(
      params.get("startYear") ?? "",
      10
    );
    const parsedEndYear = Number.parseInt(
      params.get("endYear") ?? "",
      10
    );

    const nextStartYear = Number.isFinite(parsedStartYear)
      ? Math.max(minYear, Math.min(maxYear, parsedStartYear))
      : minYear;

    const nextEndYear = Number.isFinite(parsedEndYear)
      ? Math.max(minYear, Math.min(maxYear, parsedEndYear))
      : maxYear;

    const nextSearchQuery = params.get("string") ?? "";

    setActiveCategory(null);
    setSelectedTagIds(nextSelectedTagIds);
    setTagFilterMode(
      params.get("tagMode") === "any" ? "any" : "all"
    );
    setStartYear(Math.min(nextStartYear, nextEndYear));
    setEndYear(Math.max(nextStartYear, nextEndYear));

    if (nextSearchQuery !== searchQuery) {
      skipNextSearchUrlSyncRef.current = true;
      setSearchQuery(nextSearchQuery);
    }

    handleCloseModal();
    router.push(href, { scroll: false });
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

    if (
      selectedEventIndex !== null &&
      selectedEventIndex > 0
    ) {
      setSelectedEventIndex(selectedEventIndex - 1);
    }
  };

  const handleRandomEvent = () => {
    if (events.length === 0 || isRollingRandom) {
      return;
    }

    setIsRollingRandom(true);

    window.setTimeout(() => {
      const randomIndex = Math.floor(
        Math.random() * events.length
      );

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
  }, [
    selectedEventIndex,
    filteredEvents.length,
    randomEvent,
  ]);

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

      <div className="mb-6 flex flex-col items-center justify-center gap-2 md:flex-row md:gap-3">
        <div className="flex w-full justify-center md:w-auto">
          <div className="whitespace-nowrap rounded-full bg-stone-100 px-4 py-1 text-sm text-stone-700">
            {hasActiveFilters ? (
              <>
                Showing{" "}
                <span className="font-semibold">
                  {showingCount}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {totalEvents}
                </span>{" "}
                events
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {totalEvents}
                </span>{" "}
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
              className="w-36 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-stone-700 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-stone-500"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={toggleOrder}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-stone-100 px-4 py-1 text-sm text-stone-700 transition hover:bg-stone-200"
            aria-label="Toggle timeline order"
          >
            <span>{isOldestFirst ? "↑" : "↓"}</span>
            <span>
              {isOldestFirst
                ? "Oldest first"
                : "Newest first"}
            </span>
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">
            No events match your filters.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Try adjusting the category, year range, tags, or
            search term.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 bg-gray-300"></div>

          <div className="flex flex-col gap-0">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={event.id}
                  className="relative -mt-20 flex w-full items-center first:mt-0 landscape:-mt-8 md:-mt-8"
                >
                  <div className="flex w-1/2 justify-end pr-4 md:pr-7">
                    {isLeft && (
                      <EventCard
                        event={event}
                        onClick={() =>
                          handleOpenModal(index)
                        }
                      />
                    )}
                  </div>

                  <div className="relative flex w-0 justify-center">
                    <div className="absolute left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-black"></div>
                  </div>

                  <div className="flex w-1/2 justify-start pl-4 md:pl-7">
                    {!isLeft && (
                      <EventCard
                        event={event}
                        onClick={() =>
                          handleOpenModal(index)
                        }
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
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 md:h-auto md:w-auto md:rounded-full md:px-5 md:py-3"
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
          {isRollingRandom
            ? "Rolling..."
            : "Surprise Me"}
        </span>
      </button>

      {modalEvent && (
        <TimelineModal
          event={modalEvent}
          relatedEvents={relatedEvents}
          onOpenRelatedEvent={handleOpenRelatedEvent}
          onOpenFilterLink={handleOpenFilterLink}
          onClose={handleCloseModal}
          onNext={handleNextEvent}
          onPrev={handlePrevEvent}
          hasNext={
            !isRandomDiscovery &&
            selectedEventIndex !== null &&
            selectedEventIndex <
              filteredEvents.length - 1
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