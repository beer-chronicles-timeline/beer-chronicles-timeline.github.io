import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import ScrollToTop from "@/components/ScrollToTop";
import { formatEventDate } from "@/components/timelineUtils";
import { getHomeTimelineData } from "@/lib/homeTimelineData";
import {
  getReadingRouteStops,
  READING_ROUTE_HREF,
  READING_ROUTE_TITLE,
} from "@/lib/readingRoute";
import { getOpenGraphImageMetadata, getTwitterMetadata } from "@/lib/siteMetadata";

const title = `${READING_ROUTE_TITLE} | Beer Chronicles`;
const description = "A guided introduction to beer history through six selected entries, from early brewing evidence to modern craft beer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: READING_ROUTE_HREF },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: READING_ROUTE_HREF,
    siteName: "Beer Chronicles",
    type: "website",
    ...getOpenGraphImageMetadata(),
  },
  twitter: getTwitterMetadata(title, description),
};

export default async function IntroductoryReadingRoutePage() {
  const { events } = await getHomeTimelineData();
  const stops = getReadingRouteStops(events);
  if (stops.length === 0) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
            <Link href="/" className="hover:no-underline">BEER</Link>
          </p>
          <HeaderMenu />
        </div>
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">BEER CHRONICLES</Link>
            </p>
            <p className="mt-2 whitespace-nowrap text-sm uppercase tracking-wide text-stone-600">
              A Beer History Reading Route
            </p>
          </div>
          <div className="flex min-w-0 justify-end"><HeaderMenu /></div>
        </div>
        <div className="mt-2 block md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
            <Link href="/" className="hover:no-underline">CHRONICLES</Link>
          </p>
          <p className="mt-2 text-sm uppercase tracking-wide text-stone-600">A Beer History Reading Route</p>
        </div>
      </header>
      <MainContentStart />

      <article className="mx-auto w-full max-w-3xl">
        <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Start here · A guided introduction
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {READING_ROUTE_TITLE}
          </h1>
          <p className="mt-5 leading-7 text-stone-700">
            Begin with six selected entries, from early evidence of brewing to a beer from the modern craft movement.
            Along the way, explore written sources, ingredients, a familiar style, and fermentation science.
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Follow the stops in order. Each entry includes its sources and links to the next stop.
          </p>
          <Link
            href={stops[0].href}
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
          >
            Begin with stop 1 <span aria-hidden="true">→</span>
          </Link>
        </header>

        <section aria-labelledby="reading-stops-heading" className="mt-8">
          <h2 id="reading-stops-heading" className="font-serif text-2xl font-semibold text-stone-900">
            Your six stops
          </h2>
          <ol aria-label="Reading route stops" className="mt-5 space-y-4">
            {stops.map((stop, index) => (
              <li key={stop.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Stop {index + 1} <span aria-hidden="true">·</span> {formatEventDate(stop.event)}
                </p>
                <h3 className="mt-2 font-serif text-xl font-semibold leading-tight text-stone-900">
                  <Link href={stop.href} className="underline decoration-transparent underline-offset-2 hover:decoration-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2">
                    {stop.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{stop.note}</p>
                <Link href={stop.href} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-stone-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2">
                  Read stop {index + 1} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <nav aria-label="Continue exploring" className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
          <p className="font-serif text-xl font-semibold text-stone-900">Choose your next direction</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">Explore a topic in depth, or browse the full timeline.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/storylines" className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2">Explore Storylines →</Link>
            <Link href="/" className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2">Browse the timeline →</Link>
          </div>
        </nav>
      </article>
      <Footer />
      <ScrollToTop />
    </main>
  );
}
