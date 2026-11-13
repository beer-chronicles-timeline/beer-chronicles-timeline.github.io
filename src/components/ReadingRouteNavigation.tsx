"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  READING_ROUTE_HREF,
  READING_ROUTE_SLUG,
  READING_ROUTE_TITLE,
  type ReadingRouteLink,
} from "@/lib/readingRoute";

export default function ReadingRouteNavigation({
  eventId,
  stops,
}: {
  eventId: string;
  stops: ReadingRouteLink[];
}) {
  const searchParams = useSearchParams();
  const index = stops.findIndex((stop) => stop.id === eventId);
  if (searchParams.get("readingRoute") !== READING_ROUTE_SLUG || index < 0) return null;

  const previous = stops[index - 1];
  const next = stops[index + 1];
  const linkClass = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2";

  return (
    <nav aria-label="Reading route" className="my-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">
          Guided reading · Stop {index + 1} of {stops.length}
        </p>
        <Link href={READING_ROUTE_HREF} className="inline-flex min-h-10 items-center text-sm text-stone-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">
          Back to route
        </Link>
      </div>
      <p className="font-serif text-lg font-semibold text-stone-900">{READING_ROUTE_TITLE}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={previous.href} className={linkClass} aria-label={`Previous stop: ${previous.title}`}>
            <span aria-hidden="true">←</span>
            <span><span className="block text-xs text-stone-500">Previous</span>{previous.title}</span>
          </Link>
        ) : (
          <Link href={READING_ROUTE_HREF} className={linkClass}>
            <span aria-hidden="true">←</span> Route overview
          </Link>
        )}
        {next ? (
          <Link href={next.href} className={linkClass} aria-label={`Next stop: ${next.title}`}>
            <span className="min-w-0 flex-1"><span className="block text-xs text-stone-500">Next</span>{next.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link href="/storylines" className={linkClass}>
            <span className="flex-1">Keep exploring Storylines</span><span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
