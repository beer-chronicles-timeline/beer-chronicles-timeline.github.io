// app/sources/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Beer History Sources | Beer Chronicles",
  description:
    "Explore the source families, featured works, and acknowledgments behind Beer Chronicles, with direct evidence listed in each timeline entry.",
  alternates: {
    canonical: "/sources",
  },
  openGraph: {
    title: "Beer History Sources | Beer Chronicles",
    description:
      "Explore the source families, featured works, and acknowledgments behind Beer Chronicles.",
    url: "/sources",
    siteName: "Beer Chronicles",
    type: "website",
    images: [
      {
        url: "/images/beer-chronicles-social.png",
        width: 1731,
        height: 909,
        alt: "Beer Chronicles — A Timeline of Beer History",
      },
    ],
  },
  twitter: getTwitterMetadata(
    "Beer History Sources | Beer Chronicles",
    "Explore the source families, featured works, and acknowledgments behind Beer Chronicles."
  ),
};

export default function SourcesPage() {
  const sourceFamilies = [
    {
      title: "Books and Scholarly Publications",
      description:
        "Historical monographs, specialist beer books, academic articles, reference works, and critical editions provide broader context and help connect individual events to larger developments in brewing history.",
    },
    {
      title: "Archives and Historical Collections",
      description:
        "Digitized newspapers, trade journals, municipal records, historical documents, maps, archival catalogues, and contemporary publications are used whenever they provide direct evidence for an event.",
    },
    {
      title: "Museums and Cultural Institutions",
      description:
        "Museums, libraries, heritage organizations, and historical societies often make specialist research, collection records, and digitized primary material publicly accessible.",
    },
    {
      title: "Legal and Government Sources",
      description:
        "Laws, regulations, court decisions, parliamentary records, government publications, and official geographical-protection registers are preferred for entries concerning legislation and regulation.",
    },
    {
      title: "Scientific and Technical Institutions",
      description:
        "Universities, brewing research institutes, scientific journals, technical associations, and standards organizations support entries about brewing science, ingredients, measurement, quality control, and technology.",
    },
    {
      title: "Breweries and Industry Organizations",
      description:
        "Official brewery histories, company archives, brewing associations, and contemporary industry publications can provide valuable first-hand information. Promotional accounts are treated carefully and cross-checked where possible.",
    },
    {
      title: "Competitions and Style Records",
      description:
        "Official competition results, judging guidelines, style classifications, and records published by recognized organizers document the development of beer competitions and modern style taxonomy.",
    },
  ];

  const sources = [
    {
      title: "Brautag Podcast",
      description:
        "An indispensable podcast for all beer lovers and (home) brewing enthusiasts. The well-founded chapters on beer history have inspired and verified many of my entries.",
      imageUrl: "/images/brautag.png",
      link: "https://brautagpodcast.com",
      affiliate: false,
    },
    {
      title: "Jan Brücklmeier: Bier verstehen",
      description:
        "An excellent book that explains the world of beer from the basics to the finest nuances. The historical chapters in particular were a valuable source for this project.",
      imageUrl: "/images/bier-verstehen.png",
      link: "https://www.amazon.de/dp/3818613451?social_share=cm_sw_r_ffobk_cp_ud_dp_J14JVTKGM33QWZ8XPZ6G&bestFormat=true&linkCode=ll2&tag=beerchronicle-21&linkId=55a682dfcd4f6e2b69b83c7b6785b329&ref_=as_li_ss_tl",
      affiliate: true,
    },
    {
      title: "Andreas Krennmair: Vienna Lager",
      description:
        "A comprehensive deep dive into the history and brewing techniques of Vienna Lager. This book provided essential context for understanding the development of lager beer styles in Central Europe.",
      imageUrl: "/images/Andreas-Krennmair-Vienna-Lager.jpeg",
      link: "https://www.amazon.de/dp/B08CPDLRT7?social_share=cm_sw_r_ffobk_cp_ud_dp_K6534CJPCHD5KBPFTCRP&bestFormat=true&linkCode=ll2&tag=beerchronicle-21&linkId=6e5f6e173b234c2fc5d8f603756bc115&ref_=as_li_ss_tl",
      affiliate: true,
    },
    {
      title: "Stan Hieronymus: Brew Like a Monk",
      description:
        "An authoritative exploration of Trappist and abbey brewing traditions. This book was invaluable for understanding the rich beer culture of Belgian monasteries and their historical significance.",
      imageUrl: "/images/Stan-Hieronymous-Brew-like-a-monk.jpg",
      link: "https://www.amazon.de/dp/093738187X?social_share=cm_sw_r_ffobk_cp_ud_dp_CY5XK3GPRKZTRE1YCZ74_2&bestFormat=true&linkCode=ll2&tag=beerchronicle-21&linkId=33602c576368d2c1ba08befbcdf069c6&ref_=as_li_ss_tl",
      affiliate: true,
    },
    {
      title: "Craft Beer & Brewing: The Oxford Companion to Beer",
      description:
        "An essential reference work covering all aspects of beer and brewing, from historical developments to technical brewing terms. The dictionary entries provided valuable context for many historical events and brewing concepts featured in this timeline.",
      imageUrl: "/images/craft-beer-and-brewing.png",
      link: "https://www.beerandbrewing.com/dictionary",
      affiliate: false,
    },
  ];

  const otherTimelines = [
    {
      title: "Brewery History Society Wiki",
      link: "https://breweryhistory.com/wiki/index.php?title=Main_Page",
    },
    {
      title: "Shut Up About Barclay Perkins",
      link: "https://barclayperkins.blogspot.com",
    },
    {
      title: "CraftBeer.com – Beer History",
      link: "https://www.craftbeer.com/beer/beer-history",
    },
    {
      title: "Timetoast – Brewing History Timeline",
      link: "https://www.timetoast.com/timelines/brewing-history",
    },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </p>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </p>
            <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </p>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Mobile subtitle */}
        <div className="block md:hidden mt-2">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </p>
          <p
            aria-hidden="true"
            className="text-stone-600 mt-2 tracking-wide uppercase text-sm"
          >
            Sources
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold font-serif text-stone-900 mb-4">
          Sources
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Beer Chronicles draws on different types of sources depending on the
          subject and historical period. The source families below describe the
          main kinds of material used throughout the timeline.
        </p>

        <p className="text-gray-700 mb-8 leading-relaxed">
          The direct sources supporting individual facts remain listed inside
          the corresponding timeline entries. This keeps the evidence close to
          the claims it supports rather than separating it into one centralized
          bibliography.
        </p>

        {/* Source Families */}
        <div className="grid gap-x-8 md:grid-cols-2">
          {sourceFamilies.map((family, index) => (
            <div
              key={family.title}
              className={`border-t border-stone-200 py-5 ${
                index === sourceFamilies.length - 1
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              <h2 className="text-lg font-semibold font-serif text-stone-900 mb-2">
                {family.title}
              </h2>
              <p className="max-w-3xl text-gray-700 leading-relaxed">
                {family.description}
              </p>
            </div>
          ))}
        </div>

        {/* Featured Sources and Acknowledgments */}
        <div className="mt-16 pt-10 border-t border-stone-200">
          <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-4">
            Featured Sources & Acknowledgments
          </h2>

          <p className="text-gray-700 mb-4 leading-relaxed">
            This timeline would not have been possible without the incredible
            work of beer historians, journalists, podcasters, bloggers, and
            authors. I want to give the following sources and the people behind
            them the biggest credit possible. Their dedication to beer culture
            and history has been an inspiration for this project.
          </p>

          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            For more information on how Beer Chronicles selects sources,
            handles conflicting evidence, and communicates historical
            uncertainty, see the{" "}
            <Link
              href="/editorial-principles"
              className="underline hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Editorial Principles
            </Link>
            . Some book links on this page are affiliate links. If you purchase
            a book through one of these links, Beer Chronicles may receive a
            small commission at no additional cost to you. As an Amazon
            Associate, I earn from qualifying purchases.
          </p>

          <div className="space-y-8">
            {sources.map((source) => (
              <div
                key={source.title}
                className="flex flex-col md:flex-row gap-6 bg-white border border-stone-200 rounded-lg p-6 shadow-sm"
              >
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 md:w-full md:h-40 relative bg-amber-50 rounded-lg overflow-hidden">
                    <Image
                      src={source.imageUrl}
                      alt={source.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 128px, 33vw"
                    />
                  </div>
                </div>

                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-semibold font-serif text-stone-900 mb-2">
                    <a
                      href={source.link}
                      target="_blank"
                      rel={
                        source.affiliate
                          ? "noopener noreferrer sponsored"
                          : "noopener noreferrer"
                      }
                      className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                    >
                      {source.title}
                    </a>
                  </h3>

                  {source.affiliate && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                      Affiliate link
                    </p>
                  )}

                  <p className="text-gray-700 leading-relaxed">
                    {source.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Beer History Websites/Blogs/Timelines */}
        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold font-serif text-stone-900 mb-3">
            Other Beer History Websites, Blogs, or Timelines 
          </h2>
          <p className="text-gray-600 mb-4">
            For further exploration of beer history, here are some other
            excellent timeline resources:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {otherTimelines.map((timeline) => (
              <li key={timeline.title}>
                <a
                  href={timeline.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                >
                  {timeline.title}
                </a>
              </li>
            ))}
          </ul>

          <p className="text-gray-600 mt-4">
            If I have missed your beer history blog or website, my apologies —
            please let me know.
          </p>
        </div>

        {/* Thank You Section */}
        <div className="mt-12 pt-6 border-t border-stone-200">
          <p className="text-gray-600 text-sm leading-relaxed">
            Special thanks to Thomas Hostert,
            Henri Lefebvre,
            {" "}
            <a
              href="https://fermentos.beer/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Ben Kirst
            </a>, 
            {" "}
            <a
              href="https://www.instagram.com/bierblogtrier/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Andreas Gniffke
            </a>, 
            Christoph Merten, 
            Daniel Metzler, 
            {" "}
            <a
              href="https://www.instagram.com/panszpik/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Marcin Ostajewski
            </a>, 
            Nicole Renken, 
            Simon Stevens, 
            and Johannes Thürauf
            for their valuable feedback during the development of this
            website.
          </p>
        </div>

        <div className="mt-8 pt-4 text-sm text-gray-600">
          <Link
            href="/"
            className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            ← Back to the Beer History Timeline
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
