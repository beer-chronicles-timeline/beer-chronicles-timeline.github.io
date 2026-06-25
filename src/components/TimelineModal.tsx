// components/TimelineModal.tsx
"use client";

import { useEffect, useRef } from "react";
import type { TimelineEvent } from "@/lib/types";
import RelatedEvents from "./RelatedEvents";
import { formatEventDate, normalizeUrl, urlRegex } from "./timelineUtils";

type TimelineModalProps = {
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

export default function TimelineModal({
  event,
  relatedEvents,
  onOpenRelatedEvent,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isRandomDiscovery = false,
}: TimelineModalProps) {
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
      >
        <button
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
              <h3 className="text-sm font-semibold text-stone-800 mb-2">
                Sources
              </h3>

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

          <RelatedEvents
            relatedEvents={relatedEvents}
            onOpenRelatedEvent={onOpenRelatedEvent}
          />

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