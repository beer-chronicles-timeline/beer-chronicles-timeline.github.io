import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import MapExplorer from "@/components/MapExplorer";
import MapPlaceIndex from "@/components/MapPlaceIndex";
import MapStructuredData from "@/components/MapStructuredData";
import ScrollToTop from "@/components/ScrollToTop";
import { getHomeTimelineData } from "@/lib/homeTimelineData";
import { buildMapLocations } from "@/lib/mapLocations";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Beer Map | Beer Chronicles",
  description:
    "Explore source-supported Beer Chronicles entries by their reviewed historical locations.",
  alternates: {
    canonical: "/map",
  },
  openGraph: {
    title: "Beer Map | Beer Chronicles",
    description:
      "Explore beer history through reviewed places and geographic connections.",
    url: "/map",
    type: "website",
  },
  twitter: getTwitterMetadata(
    "Beer Map | Beer Chronicles",
    "Explore beer history through reviewed places and geographic connections."
  ),
};

export default async function MapPage() {
  const timelineData = await getHomeTimelineData();
  const locations = buildMapLocations(timelineData.events);

  return (
    <main
      id="map-top"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10"
    >
      <MapStructuredData locations={locations} />
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
            Beer Map
          </p>
        </div>
      </header>

      <MainContentStart />

      <div className="mx-auto w-full max-w-7xl">
        <section aria-labelledby="map-heading" className="max-w-3xl">
          <h1
            id="map-heading"
            className="font-serif text-3xl font-semibold text-stone-900"
          >
            Beer Map
          </h1>
          <p className="mt-4 leading-7 text-stone-700">
            Discover timeline entries through the places connected to them.
            Locations appear only when their historical role and geographic
            precision have been reviewed. Solid gray markers indicate cities or
            exact sites; brown dashed markers indicate approximate regional or
            country centroids; dark markers group nearby places.
          </p>
        </section>

        <MapExplorer locations={locations} />
        <MapPlaceIndex locations={locations} />
        <Footer />
      </div>

      <ScrollToTop />
    </main>
  );
}
