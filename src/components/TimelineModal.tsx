// components/TimelineModal.tsx
"use client";

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { TimelineEvent } from "@/lib/types";
import EventDetailContent from "./EventDetailContent";
import RelatedEvents from "./RelatedEvents";
import { prefersReducedMotion } from "@/lib/motionPreferences";

type TimelineModalProps = {
  event: TimelineEvent;
  relatedEvents: TimelineEvent[];
  onOpenRelatedEvent: (event: TimelineEvent) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenFilterLink?: (href: string) => void;
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
  onOpenFilterLink,
  hasNext,
  hasPrev,
  isRandomDiscovery = false,
}: TimelineModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const activatingElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!dialog) {
      return;
    }

    dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      if (activatingElement?.isConnected) {
        activatingElement.focus({ preventScroll: true });
      }
    };
  }, []);

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

      if (scrollY) {
        window.scrollTo(
          0,
          Number.parseInt(scrollY || "0", 10) * -1
        );
      }
    };
  }, []);

  useEffect(() => {
    modalContentRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [event.id]);

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onClose();
      } else if (
        keyboardEvent.key === "ArrowRight" &&
        hasNext
      ) {
        keyboardEvent.preventDefault();
        onNext();
      } else if (
        keyboardEvent.key === "ArrowLeft" &&
        hasPrev
      ) {
        keyboardEvent.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  const handleContentClickCapture = (
    mouseEvent: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (!onOpenFilterLink) {
      return;
    }

    const target = mouseEvent.target;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest("a");
    const href = link?.getAttribute("href");

    if (!href?.startsWith("/?")) {
      return;
    }

    const url = new URL(href, window.location.origin);

    if (
      !url.searchParams.has("tags") &&
      !url.searchParams.has("from") &&
      !url.searchParams.has("to")
    ) {
      return;
    }

    mouseEvent.preventDefault();
    onOpenFilterLink(href);
  };

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-modal-title"
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-black/50 p-4 transition-opacity duration-200 motion-reduce:transition-none open:flex open:items-center open:justify-center"
      onClick={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        ref={modalContentRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-stone-400 bg-white p-6 opacity-100 shadow-2xl ring-1 ring-black/10 transition-all duration-200 motion-reduce:transition-none"
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
        onClickCapture={handleContentClickCapture}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
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

          <EventDetailContent
            event={event}
            showPermanentLink
            titleAs="h2"
            titleId="timeline-modal-title"
          />
        </div>

        <RelatedEvents
          relatedEvents={relatedEvents}
          onOpenRelatedEvent={onOpenRelatedEvent}
        />

        {!isRandomDiscovery && (
          <>
            <div className="mt-4 border-t pt-3 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="min-h-10 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="min-h-10 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="mt-4 hidden border-t pt-3 text-center text-xs text-gray-400 md:block">
              ← → arrow keys to navigate
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
