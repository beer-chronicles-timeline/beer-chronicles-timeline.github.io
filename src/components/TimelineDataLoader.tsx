"use client";

import { useEffect, useState } from "react";
import type { HomeTimelineData } from "@/lib/homeTimelineData";
import Timeline from "./Timeline";

export default function TimelineDataLoader() {
  const [timelineData, setTimelineData] =
    useState<HomeTimelineData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTimelineData() {
      try {
        const response = await fetch("/timeline-data.json", {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as HomeTimelineData;

        setTimelineData(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    void loadTimelineData();

    return () => {
      abortController.abort();
    };
  }, []);

  if (errorMessage) {
    return (
      <div className="py-8 text-center text-red-600" role="alert">
        Error loading events: {errorMessage}
      </div>
    );
  }

  if (!timelineData) {
    return <div className="h-20" aria-label="Loading timeline" />;
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
