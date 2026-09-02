// components/Timeline.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import dynamic from "next/dynamic";
import { TimelineFiltersWrapper } from "./TimelineFiltersWrapper";
import EventCard from "./EventCard";
import {
  filterTimelineEvents,
  type TagFilterMode,
} from "./timelineFiltering";
import { getRelatedEvents } from "./timelineUtils";
import { copyText } from "@/lib/copyText";
import type { TimelineEvent, Tag } from "@/lib/types";

const TimelineModal = dynamic(() => import("./TimelineModal"), {
  ssr: false,
});

type TimelineProps = {
  events: TimelineEvent[];

  // Tags shown in the manual dropdown
  allTags: Tag[];

  // Complete tag list used for direct URL links
  urlTags: Tag[];

  minYear: number;
  maxYear: number;
};

const SEARCH_DEBOUNCE_MS = 250;
const RESULTS_ANNOUNCEMENT_DEBOUNCE_MS = 500;
const INITIAL_RENDERED_EVENT_COUNT = 60;
const RENDERED_EVENT_BATCH_SIZE = 60;

type TimelineSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

function TimelineSearch({ value, onChange }: TimelineSearchProps) {
  const [edit, setEdit] = useState({
    baseValue: value,
    draftValue: value,
  });
  const draftValue =
    edit.baseValue === value ? edit.draftValue : value;

  useEffect(() => {
    if (draftValue === value) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onChange(draftValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftValue, value, onChange]);

  const clearSearch = () => {
    setEdit({ baseValue: value, draftValue: "" });
    onChange("");
  };

  return (
    <div className="relative">
      <input
        type="text"
        aria-label="Search timeline"
        placeholder="Search..."
        value={draftValue}
        onChange={(event) =>
          setEdit({
            baseValue: value,
            draftValue: event.target.value,
          })
        }
        className="h-10 w-36 rounded-full border border-gray-300 bg-white px-3 py-1 pr-10 text-sm text-stone-700 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-stone-500"
      />

      {draftValue && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-stone-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function Timeline({
  events,
  allTags,
  urlTags,
  minYear,
  maxYear,
}: TimelineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipNextTimelineUrlSyncRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    useState<TagFilterMode>(() =>
      searchParams.get("tagMode") === "any" ? "any" : "all"
    );
  const [isOldestFirst, setIsOldestFirst] = useState(
    () => searchParams.get("order") === "oldest"
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("string") ?? ""
  );
  const [copyFeedback, setCopyFeedback] = useState("");
  const [resultsAnnouncement, setResultsAnnouncement] = useState("");
  const hasInitializedResultsAnnouncementRef = useRef(false);

  useEffect(
    () => () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const restoreTimelineViewFromUrl = () => {
      const params = new URLSearchParams(window.location.search);

      skipNextTimelineUrlSyncRef.current = true;
      setSearchQuery(params.get("string") ?? "");
      setIsOldestFirst(params.get("order") === "oldest");
    };

    window.addEventListener("popstate", restoreTimelineViewFromUrl);

    return () => {
      window.removeEventListener("popstate", restoreTimelineViewFromUrl);
    };
  }, []);

  useEffect(() => {
    if (skipNextTimelineUrlSyncRef.current) {
      skipNextTimelineUrlSyncRef.current = false;
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

    if (isOldestFirst) {
      params.set("order", "oldest");
    } else {
      params.delete("order");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, isOldestFirst, router]);

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

  const renderWindowKey = useMemo(
    () =>
      JSON.stringify([
        activeCategory,
        startYear,
        endYear,
        selectedTagIds,
        tagFilterMode,
        isOldestFirst,
        searchQuery,
      ]),
    [
      activeCategory,
      startYear,
      endYear,
      selectedTagIds,
      tagFilterMode,
      isOldestFirst,
      searchQuery,
    ]
  );
  const [renderWindow, setRenderWindow] = useState({
    key: renderWindowKey,
    count: INITIAL_RENDERED_EVENT_COUNT,
  });
  const renderedEventCount =
    renderWindow.key === renderWindowKey
      ? renderWindow.count
      : INITIAL_RENDERED_EVENT_COUNT;
  const renderedEvents = filteredEvents.slice(0, renderedEventCount);
  const hasMoreEvents = renderedEvents.length < filteredEvents.length;

  const showMoreEvents = useCallback(() => {
    setRenderWindow((currentWindow) => ({
      key: renderWindowKey,
      count:
        (currentWindow.key === renderWindowKey
          ? currentWindow.count
          : INITIAL_RENDERED_EVENT_COUNT) +
        RENDERED_EVENT_BATCH_SIZE,
    }));
  }, [renderWindowKey]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreEvents || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          showMoreEvents();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreEvents, renderedEvents.length, showMoreEvents]);

  const totalEvents = events.length;
  const showingCount = filteredEvents.length;

  useEffect(() => {
    if (!hasInitializedResultsAnnouncementRef.current) {
      hasInitializedResultsAnnouncementRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResultsAnnouncement(
        showingCount === 0
          ? "No events match your filters."
          : `Showing ${showingCount} of ${totalEvents} events.`
      );
    }, RESULTS_ANNOUNCEMENT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [renderWindowKey, showingCount, totalEvents]);

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
      params.get("from") ?? "",
      10
    );
    const parsedEndYear = Number.parseInt(
      params.get("to") ?? "",
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

    const nextIsOldestFirst = params.get("order") === "oldest";

    if (
      nextSearchQuery !== searchQuery ||
      nextIsOldestFirst !== isOldestFirst
    ) {
      skipNextTimelineUrlSyncRef.current = true;
      setSearchQuery(nextSearchQuery);
      setIsOldestFirst(nextIsOldestFirst);
    }

    handleCloseModal();
    router.push(href, { scroll: false });
  };

  const handleNextEvent = useCallback(() => {
    if (randomEvent) {
      return;
    }

    setSelectedEventIndex((currentIndex) => {
      if (
        currentIndex !== null &&
        currentIndex < filteredEvents.length - 1
      ) {
        return currentIndex + 1;
      }

      return currentIndex;
    });
  }, [randomEvent, filteredEvents.length]);

  const handlePrevEvent = useCallback(() => {
    if (randomEvent) {
      return;
    }

    setSelectedEventIndex((currentIndex) => {
      if (currentIndex !== null && currentIndex > 0) {
        return currentIndex - 1;
      }

      return currentIndex;
    });
  }, [randomEvent]);

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
    setIsOldestFirst((currentValue) => !currentValue);
  };

  const copyFilteredView = async () => {
    const copied = await copyText(window.location.href);
    setCopyFeedback(copied ? "Link copied" : "Unable to copy link");

    if (copyFeedbackTimerRef.current) {
      clearTimeout(copyFeedbackTimerRef.current);
    }

    copyFeedbackTimerRef.current = setTimeout(
      () => setCopyFeedback(""),
      2500
    );
  };

  return (
    <>
      <section
        aria-label="Timeline exploration controls"
        className="mx-auto mb-4 w-full max-w-4xl border-y border-stone-200 py-2"
      >
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultsAnnouncement}
        </p>
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

        <div className="mt-3 flex flex-col items-center justify-center gap-2 border-t border-stone-200 pt-3 md:flex-row md:gap-3">
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

          <div className="flex flex-wrap items-center justify-center gap-2">
            <TimelineSearch
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <button
              onClick={toggleOrder}
              className="flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-stone-100 px-4 py-1 text-sm text-stone-700 transition hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
              aria-label={
                isOldestFirst ? "Oldest first" : "Newest first"
              }
            >
              <span>{isOldestFirst ? "↑" : "↓"}</span>
              <span>
                {isOldestFirst
                  ? "Oldest first"
                  : "Newest first"}
              </span>
            </button>

            {(hasActiveFilters || isOldestFirst) && (
              <button
                type="button"
                onClick={copyFilteredView}
                className="flex min-h-10 items-center whitespace-nowrap rounded-full border border-stone-300 bg-white px-4 py-1 text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
              >
                Copy filtered view
              </button>
            )}
          </div>

          <span aria-live="polite" className="text-sm text-stone-500">
            {copyFeedback}
          </span>
        </div>
      </section>

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
          <div className="absolute left-4 top-0 h-full w-1.5 -translate-x-1/2 bg-gray-300 md:left-1/2"></div>

          <ol
            className="m-0 flex list-none flex-col gap-0 p-0"
            aria-label="Beer history timeline"
          >
            {renderedEvents.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <li
                  key={event.id}
                  className="relative flex w-full items-start pb-5 last:pb-0 md:-mt-8 md:items-center md:pb-0 md:first:mt-0"
                >
                  <div
                    className={
                      isLeft
                        ? "flex w-full pl-10 pr-1 md:w-1/2 md:justify-end md:pl-0 md:pr-7"
                        : "hidden md:flex md:w-1/2 md:justify-end md:pr-7"
                    }
                  >
                    {isLeft && (
                      <EventCard
                        event={event}
                        onClick={() =>
                          handleOpenModal(index)
                        }
                      />
                    )}
                  </div>

                  <div className="absolute left-4 top-6 flex w-0 justify-center md:relative md:left-auto md:top-auto">
                    <div className="absolute left-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black md:translate-y-0"></div>
                  </div>

                  <div className="absolute left-4 top-6 h-px w-6 bg-gray-300 md:hidden"></div>

                  <div
                    className={
                      isLeft
                        ? "hidden md:flex md:w-1/2 md:justify-start md:pl-7"
                        : "flex w-full pl-10 pr-1 md:w-1/2 md:justify-start md:pl-7 md:pr-0"
                    }
                  >
                    {!isLeft && (
                      <EventCard
                        event={event}
                        onClick={() =>
                          handleOpenModal(index)
                        }
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {hasMoreEvents && (
            <div
              ref={loadMoreRef}
              className="relative z-10 flex justify-center bg-stone-50/90 py-6"
            >
              <button
                type="button"
                onClick={showMoreEvents}
                className="min-h-11 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
              >
                Show more events
                <span className="sr-only">
                  {`, ${filteredEvents.length - renderedEvents.length} remaining`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleRandomEvent}
        disabled={events.length === 0 || isRollingRandom}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-stone-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 md:h-auto md:min-h-11 md:w-auto md:rounded-full md:px-5 md:py-3"
        aria-label="Open random event"
        title="Open random event"
      >
        <span
          className={`text-xl md:mr-2 ${
            isRollingRandom ? "animate-spin motion-reduce:animate-none" : ""
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
