// app/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import TimelineDataLoader from "@/components/TimelineDataLoader";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://beer-chronicles.org/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-6">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </h1>

          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />

          <div className="text-center">
            <h1 className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </h1>

            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </h2>
          </div>

          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>

          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </h2>
        </div>
      </header>

      <section
        aria-labelledby="storylines-promo-heading"
        className="mx-auto mb-8 flex w-full max-w-4xl flex-col gap-3 rounded-xl border border-stone-200 bg-white px-5 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:gap-6"
      >
        <div className="flex min-w-0 flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-3 lg:whitespace-nowrap">
          <h2
            id="storylines-promo-heading"
            className="shrink-0 font-serif text-lg font-semibold text-stone-900"
          >
            Beer Storylines
          </h2>

          <p className="text-sm text-stone-600">
            Explore beer’s connected history across time, styles, science, and culture.
          </p>
        </div>

        <Link
          href="/storylines"
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 lg:self-auto"
        >
          Explore
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      </section>

      <Suspense fallback={<div className="h-20" />}>
        <TimelineDataLoader />
      </Suspense>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
