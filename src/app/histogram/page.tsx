import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import ScrollToTop from "@/components/ScrollToTop";
import HistogramExplorer from "@/components/HistogramExplorer";
import { getEventTimelineYear } from "@/components/timelineUtils";
import { getHomeTimelineData } from "@/lib/homeTimelineData";
import { getTwitterMetadata } from "@/lib/siteMetadata";

const description = "Explore the distribution of Beer Chronicles timeline entries over time, with an adjustable date range and bin size.";

export const metadata: Metadata = {
  title: "Histogram | Beer Chronicles",
  description,
  alternates: { canonical: "/histogram" },
  openGraph: { title: "Histogram | Beer Chronicles", description, url: "/histogram", type: "website" },
  twitter: getTwitterMetadata("Histogram | Beer Chronicles", description),
};

export default async function HistogramPage() {
  const { events } = await getHomeTimelineData();
  const years = events.map(getEventTimelineYear).filter((year): year is number => year !== null && Number.isSafeInteger(year) && year !== 0);

  return (
    <main id="histogram-top" tabIndex={-1} className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </p>
          <HeaderMenu />
        </div>

        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </p>
            <p className="mt-2 whitespace-nowrap text-sm uppercase tracking-wide text-stone-600">
              An Interactive Beer History Timeline
            </p>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        <div className="mt-2 block md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </p>
          <p className="mt-2 text-sm uppercase tracking-wide text-stone-600">
            Histogram
          </p>
        </div>
      </header>

      <MainContentStart />
      <div className="mx-auto w-full max-w-6xl">
        <section aria-labelledby="histogram-heading" className="max-w-3xl">
          <h1 id="histogram-heading" className="font-serif text-3xl font-semibold text-stone-900">Histogram</h1>
          <p className="mt-4 leading-7 text-stone-700">Explore how timeline entries are distributed across time. Choose a date range and the number of years per bin to see where the collection is most detailed and where there are gaps.</p>
        </section>
        <HistogramExplorer years={years} currentYear={new Date().getFullYear()} undatedCount={events.length - years.length} />
        <Footer />
      </div>
      <ScrollToTop />
    </main>
  );
}
