// app/editorial-principles/page.tsx
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";

export default function EditorialPrinciplesPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">BEER</Link>
          </h1>
          <HeaderMenu />
        </div>

        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-1/3" />
          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              <Link href="/" className="hover:no-underline">BEER CHRONICLES</Link>
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </h2>
          </div>
          <div className="w-1/3 flex justify-end">
            <HeaderMenu />
          </div>
        </div>

        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">CHRONICLES</Link>
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Editorial Principles
          </h2>
        </div>
      </header>

      <section className="max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-2">
          Editorial Principles
        </h2>

        <div className="space-y-4 text-gray-800">
          <p>
            Beer Chronicles aims to present beer history in a way that is both historically reliable and easy to explore. The timeline is curated with the goal of providing well-supported historical information while remaining accessible to everyone interested in beer.
          </p>

          <p>
            Rather than documenting every event ever connected to beer, Beer Chronicles focuses on events that are historically significant and can be supported by reliable evidence. Historical research is an ongoing process, and new findings continue to improve our understanding of the past.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <section className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Source-Based Entries
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Every entry is researched individually using reliable sources. Whenever possible, primary sources are preferred, while reputable secondary sources help provide historical context and interpretation.
            </p>
          </section>

          <section className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Date Precision
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Historical sources do not always provide the same level of detail. For that reason, Beer Chronicles displays dates with the level of precision that is supported by the available evidence. Depending on the historical record, an event may therefore be dated to an exact day, a month, a year, or, where appropriate, only a decade.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Exact date</div>
                <div className="text-gray-600 mt-1">Used when day, month, and year are supported.</div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Month</div>
                <div className="text-gray-600 mt-1">Used when the month and year are supported, but not the day.</div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Year</div>
                <div className="text-gray-600 mt-1">Used when only the year is supported.</div>
              </div>

              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="font-semibold text-stone-900">Decade</div>
                <div className="text-gray-600 mt-1">Used when the evidence only supports a broader time period.</div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Uncertainty Is Part of the Story
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Beer history is full of fascinating stories, but not every story is equally well documented. In some cases, sources disagree or the historical evidence is incomplete. Where appropriate, this uncertainty is reflected in the timeline so that readers can better understand the current state of historical knowledge.
            </p>
          </section>

          <section className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              AI Assistance
            </h3>

            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                The Beer Chronicles website has been, and continues to be, developed through vibe coding with the assistance of AI tools.
              </p>

              <p>
                AI also supports the historical research behind most entries. This assistance includes finding potentially relevant sources, comparing information across sources, checking whether claims and dates are supported, and helping prepare draft text based on the available evidence.
              </p>

              <p>
                Editorial control remains entirely human. Decisions about which entries are added, expanded, revised, or removed are made by me. I also decide which sources are accepted, how uncertainty is presented, and which historical details are included in the final entry.
              </p>

              <p>
                Neither the website nor its historical content is produced in an agentic or fully automated way. AI tools do not independently publish code, create entries, or make editorial decisions. Every change is reviewed and approved before it becomes part of Beer Chronicles.
              </p>
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold font-serif text-stone-900 mb-3">
              Corrections and Open Questions
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Mistakes can happen. If you find one, please let me know. If you can resolve an open research question, you can submit your finding through the{" "}
              <Link href="/submit" className="underline hover:no-underline">
                Submission page
              </Link>
              . Current unresolved questions are collected on the{" "}
              <Link href="/challenges" className="underline hover:no-underline">
                Open Challenges page
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 text-sm text-gray-600">
          <Link href="/" className="underline hover:no-underline">
            ← Back to the Beer History Timeline
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}