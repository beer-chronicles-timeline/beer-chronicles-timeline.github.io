import Link from "next/link";
import Footer from "@/components/Footer";
import MainContentStart from "@/components/MainContentStart";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <header className="mb-8">
        <Link
          href="/"
          className="rounded-sm font-serif text-2xl font-semibold tracking-tight text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 sm:text-3xl"
        >
          BEER CHRONICLES
        </Link>
      </header>

      <MainContentStart />

      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center py-8">
        <section
          aria-labelledby="not-found-heading"
          className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Error 404
          </p>
          <h1
            id="not-found-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl"
          >
            Page not found
          </h1>
          <p className="mt-4 leading-7 text-stone-700">
            We couldn&apos;t find a page at this address. Continue exploring beer
            history on the timeline or follow one of the Storylines.
          </p>

          <nav aria-label="Page recovery" className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              Back to the timeline
            </Link>
            <Link
              href="/storylines"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-stone-50 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              Explore Storylines
            </Link>
          </nav>
        </section>
      </div>

      <Footer />
    </main>
  );
}
