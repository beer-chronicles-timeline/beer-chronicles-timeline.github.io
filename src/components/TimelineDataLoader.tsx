"use client";

import { useEffect, useState } from "react";
import type { HomeTimelineData } from "@/lib/homeTimelineData";
import Timeline from "./Timeline";
import TimelineLoadingState from "./TimelineLoadingState";

export default function TimelineDataLoader() {
  const [timelineData, setTimelineData] =
    useState<HomeTimelineData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTimelineData() {
      try {
        const response = await fetch("/timeline-data.json", {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Timeline request failed");
        }

        const data = (await response.json()) as HomeTimelineData;

        setTimelineData(data);
        setHasError(false);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setHasError(true);
      }
    }

    void loadTimelineData();

    return () => {
      abortController.abort();
    };
  }, [requestAttempt]);

  if (hasError) {
    return (
      <section
        className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-12"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white px-6 py-8 text-center shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Timeline unavailable
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            We couldn&apos;t load the timeline just now. Please check
            your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setRequestAttempt((attempt) => attempt + 1);
            }}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!timelineData) {
    return <TimelineLoadingState />;
  }

  return (
    <Timeline
      events={timelineData.events}
      allTags={timelineData.visibleTags}
      urlTags={timelineData.tags}
      minYear={timelineData.minYear}
      maxYear={timelineData.maxYear}
    />
  );
}
