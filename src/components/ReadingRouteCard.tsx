import Link from "next/link";
import { READING_ROUTE_HREF, READING_ROUTE_TITLE } from "@/lib/readingRoute";

export default function ReadingRouteCard() {
  return (
    <section
      aria-label="Start here"
      className="mx-auto mb-4 flex w-full max-w-4xl flex-col gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
          Start here · 6 selected entries
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-stone-900">
          {READING_ROUTE_TITLE}
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          New to Beer Chronicles? Follow a short guided introduction.
        </p>
      </div>
      <Link
        href={READING_ROUTE_HREF}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 sm:self-auto"
      >
        Start reading <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
