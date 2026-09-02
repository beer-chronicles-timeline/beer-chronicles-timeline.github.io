// app/editorial-principles/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import Footer from "@/components/Footer";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Editorial Principles | Beer Chronicles",
  description:
    "Read how Beer Chronicles selects sources, handles date precision and uncertainty, uses AI assistance, and maintains human editorial control.",
  alternates: {
    canonical: "/editorial-principles",
  },
  openGraph: {
    title: "Editorial Principles | Beer Chronicles",
    description:
      "Read how Beer Chronicles approaches sources, date precision, uncertainty, AI assistance, and human editorial control.",
    url: "/editorial-principles",
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
    "Editorial Principles | Beer Chronicles",
    "Read how Beer Chronicles approaches sources, date precision, uncertainty, AI assistance, and human editorial control."
  ),
};

export default function EditorialPrinciplesPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
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
            <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </p>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

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
            Editorial Principles
          </p>
        </div>
      </header>

      <MainContentStart />

      <section className="max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-semibold font-serif text-stone-900 mb-2">
          Editorial Principles
        </h1>

        <div className="space-y-4 text-gray-800">
          <p>
            Beer Chronicles aims to present beer history in a way that is both
            historically reliable and easy to explore. The timeline is curated
            with the goal of providing well-supported historical information
            while remaining accessible to everyone interested in beer.
          </p>

          <p>
            Rather than documenting every event ever connected to beer, Beer
            Chronicles focuses on events that are historically significant and
            can be supported by reliable evidence. Historical research is an
            ongoing process, and new findings continue to improve our
            understanding of the past.
          </p>
        </div>

        <div className="mt-8">
          <section>
            <h2 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Source-Based Entries
            </h2>

            <p className="text-gray-700 leading-relaxed">
              Every entry is researched individually using reliable sources.
              Whenever possible, primary sources are preferred, while reputable
              secondary sources help provide historical context and
              interpretation. A selection of the books, podcasts, reference
              works, and other resources that have been especially important to
              the project is collected on the{" "}
              <Link
                href="/sources"
                className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                Sources page
              </Link>
              .
            </p>
          </section>

          <section className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Date Precision
            </h2>

            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Historical sources do not always provide the same level of
                detail. For that reason, Beer Chronicles displays dates with
                the level of precision supported by the available evidence.
                Depending on the historical record, an event may therefore be
                dated to an exact day, a month, a year, a decade, or a century.
              </p>

              <p>
                The timeline also includes prehistoric evidence that lies
                outside the range of ordinary calendar-date systems. These
                entries are represented using historical years and displayed
                using BCE and CE chronology. There is no year zero: 1 BCE is
                followed directly by 1 CE.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Exact date</div>
                <div className="text-gray-600 mt-1">
                  Used when day, month, and year are supported.
                </div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Month</div>
                <div className="text-gray-600 mt-1">
                  Used when the month and year are supported, but not the day.
                </div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Year</div>
                <div className="text-gray-600 mt-1">
                  Used when only the year is supported.
                </div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Decade</div>
                <div className="text-gray-600 mt-1">
                  Used when the evidence supports only an approximate decade.
                </div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Century</div>
                <div className="text-gray-600 mt-1">
                  Used when the evidence supports only a broad historical
                  period, especially for ancient or prehistoric events.
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Uncertainty Is Part of the Story
            </h2>

            <p className="text-gray-700 leading-relaxed">
              Beer history is full of fascinating stories, but not every story
              is equally well documented. In some cases, sources disagree or
              the historical evidence is incomplete. Where appropriate, this
              uncertainty is reflected in the timeline so that readers can
              better understand the current state of historical knowledge.
            </p>
          </section>

          <section className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              AI Assistance
            </h2>

            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                The Beer Chronicles website has been, and continues to be,
                developed through vibe coding with the assistance of AI tools.
              </p>

              <p>
                AI also supports the historical research behind most entries.
                This assistance includes finding potentially relevant sources,
                comparing information across sources, checking whether claims
                and dates are supported, and helping prepare draft text based
                on the available evidence.
              </p>

              <p>
                Editorial control remains entirely human. Decisions about
                which entries are added, expanded, revised, or removed are made
                by me. I also decide which sources are accepted, how
                uncertainty is presented, and which historical details are
                included in the final entry.
              </p>

              <p>
                The website’s development workflow may involve Codex and
                similar agentic AI tools inspecting the repository, running
                audits, researching issues, proposing changes, implementing
                code under my instructions, and running tests. These tools
                assist with the work, but they do not decide what is accepted
                into Beer Chronicles. Every change—whether to the website or
                its historical content—is reviewed and approved by me before it
                becomes part of the project.
              </p>
            </div>
          </section>

          <section className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Corrections and Open Questions
            </h2>

            <p className="text-gray-700 leading-relaxed">
              Mistakes can happen. If you find one, please let me know. If you
              can resolve an open research question, you can submit your
              finding through the{" "}
              <Link
                href="/submit"
                className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                Submission page
              </Link>
              . Current unresolved questions are collected on the{" "}
              <Link
                href="/challenges"
                className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                Open Challenges page
              </Link>
              .
            </p>
          </section>
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
