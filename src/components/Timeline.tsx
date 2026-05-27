// components/Timeline.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { TimelineFilters } from "./TimelineFilters";
import type { TimelineEvent, Tag } from "@/lib/types";

type TimelineProps = {
  events: TimelineEvent[];
  allTags: Tag[];
};

// Safari-safe date formatter
function formatEventDate(event: TimelineEvent): string {
  const raw = event.event_date;
  if (!raw) return "";
  if (event.date_precision === "year") return raw.slice(0, 4);

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

export default function Timeline({ events, allTags }: TimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(1300);
  const [endYear, setEndYear] = useState(2026);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
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

        return true;
      }),
    [events, activeCategory, startYear, endYear, selectedTagIds]
  );

  return (
    <>
      <TimelineFilters
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        startYear={startYear}
        endYear={endYear}
        setStartYear={setStartYear}
        setEndYear={setEndYear}
        allTags={allTags}
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
      />

      {/* TIMELINE */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 w-1.5 h-full bg-gray-300 -translate-x-1/2"></div>

        <div className="flex flex-col gap-1.5">
          {filteredEvents.map((event, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div key={event.id} className="relative flex w-full items-center">
                <div className="w-1/2 flex justify-end pr-4 md:pr-7">
                  {isLeft && (
                    <EventCard
                      event={event}
                      onClick={() => setSelectedEvent(event)}
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
                      onClick={() => setSelectedEvent(event)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <Modal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
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
        <h2 className="text-base leading-tight font-semibold font-serif text-stone-900 break-words hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
        <p className="text-[13px] leading-snug text-gray-600 mt-1">{preview}</p>
      )}
    </div>
  );
}

type ModalProps = {
  event: TimelineEvent;
  onClose: () => void;
};

function Modal({ event, onClose }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, []);

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
          className="absolute top-2 right-3 text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-sm text-gray-500 mb-2">{formatEventDate(event)}</p>

        <h2 className="text-lg font-semibold font-serif text-stone-900">
          {event.title}
        </h2>

        {event.description && (
          <p className="text-gray-700 font-sans whitespace-pre-line mt-2">
            {event.description}
          </p>
        )}

        {rawLines.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <h3 className="text-sm font-semibold text-stone-800 mb-2">
              Sources
            </h3>

            {/* Plain bullets; if a URL exists in the line, show only the first URL as the clickable link */}
            <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700 break-words">
              {rawLines.map((line, i) => {
                const match = line.match(urlRegex);
                if (!match) {
                  // No URL -> render the whole line as-is
                  return <li key={i}>{line}</li>;
                }

                // Has URL -> render only the first URL as a clickable link
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
      </div>
    </div>
  );
}
