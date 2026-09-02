"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { HomeTimelineData } from "@/lib/homeTimelineData";
import Timeline from "./Timeline";

type TimelineDataLoaderProps = {
  children: ReactNode;
};

export default function TimelineDataLoader({
  children,
}: TimelineDataLoaderProps) {
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
      <div>
        {children}

        <section
          className="mx-auto mt-6 w-full max-w-4xl rounded-xl border border-stone-200 bg-white px-6 py-5 text-center shadow-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Interactive timeline unavailable
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
        </section>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div>
        {children}
        <p className="sr-only" role="status" aria-live="polite">
          Loading the interactive timeline.
        </p>

        <noscript>
          <section className="mx-auto mt-6 w-full max-w-4xl rounded-xl border border-stone-200 bg-white px-6 py-5 text-center shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-stone-900">
              Interactive filters require JavaScript
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              You can still explore the entries above or browse Beer
              Storylines for connected histories across the timeline.
            </p>

            <Link
              href="/storylines"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              Browse Beer Storylines
            </Link>
          </section>
        </noscript>
      </div>
    );
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
