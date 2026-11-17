import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import ScrollToTop from "@/components/ScrollToTop";
import BjcpCoverageExplorer from "@/components/BjcpCoverageExplorer";
import { getHomeTimelineData } from "@/lib/homeTimelineData";
import { BJCP_2021_SOURCE_URL, buildBjcpCoverage } from "@/lib/bjcpCoverage";
import { getOpenGraphImageMetadata, getTwitterMetadata } from "@/lib/siteMetadata";

const description = "Explore Beer Chronicles coverage of the BJCP 2021 beer styles, with related entry counts and expandable lists.";

export const metadata: Metadata = {
  title: "BJCP Coverage | Beer Chronicles",
  description,
  alternates: { canonical: "/bjcp-coverage" },
  openGraph: { title: "BJCP Coverage | Beer Chronicles", description, url: "/bjcp-coverage", type: "website", ...getOpenGraphImageMetadata() },
  twitter: getTwitterMetadata("BJCP Coverage | Beer Chronicles", description),
};

export default async function BjcpCoveragePage() {
  const { events } = await getHomeTimelineData();

  return (
    <main id="bjcp-coverage-top" tabIndex={-1} className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900"><Link href="/" className="hover:no-underline">BEER</Link></p>
          <HeaderMenu />
        </div>
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl"><Link href="/" className="hover:no-underline">BEER CHRONICLES</Link></p>
            <p className="mt-2 whitespace-nowrap text-sm uppercase tracking-wide text-stone-600">An Interactive Beer History Timeline</p>
          </div>
          <div className="flex min-w-0 justify-end"><HeaderMenu /></div>
        </div>
        <div className="mt-2 block md:hidden">
          <p className="font-serif text-4xl font-semibold tracking-tight text-stone-900"><Link href="/" className="hover:no-underline">CHRONICLES</Link></p>
          <p className="mt-2 text-sm uppercase tracking-wide text-stone-600">BJCP Coverage</p>
        </div>
      </header>
      <MainContentStart />
      <div className="mx-auto w-full max-w-6xl">
        <section aria-labelledby="bjcp-coverage-heading">
          <h1 id="bjcp-coverage-heading" className="font-serif text-3xl font-semibold text-stone-900">BJCP Coverage</h1>
          <p className="mt-4 leading-7 text-stone-700">Explore the beer styles in the <a href={BJCP_2021_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="rounded-sm underline underline-offset-2 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">BJCP 2021 Beer Style Guidelines</a> and their related entries in <span className="whitespace-nowrap">Beer Chronicles.</span></p>
        </section>
        <BjcpCoverageExplorer categories={buildBjcpCoverage(events)} />
        <Footer />
      </div>
      <ScrollToTop />
    </main>
  );
}
