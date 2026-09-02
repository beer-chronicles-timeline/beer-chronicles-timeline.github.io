// app/challenges/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Open Research Challenges | Beer Chronicles",
  description:
    "Explore unresolved beer history questions where Beer Chronicles needs stronger evidence before an entry can be added or corrected.",
  alternates: {
    canonical: "/challenges",
  },
  openGraph: {
    title: "Open Research Challenges | Beer Chronicles",
    description:
      "Explore unresolved beer history questions where Beer Chronicles needs stronger evidence.",
    url: "/challenges",
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
    "Open Research Challenges | Beer Chronicles",
    "Explore unresolved beer history questions where Beer Chronicles needs stronger evidence."
  ),
};

export default function ChallengesPage() {
  const challenges = [
    {
      title: "Schieffer Brewery in Trier, Germany",
      question: "When did they really stop brewing?",
      context:
        "The timeline needs a verifiable source for the real end date of Schieffer Brewery in Trier, Germany.",
    },
    {
      title: "George Hodgson’s Birth Date",
      question: "What is his birth date?",
      context:
        "The timeline needs a verifiable source for the birth date of George Hodgson, the London brewer associated with the India Pale Ale storyline.",
    },
    {
      title: "George Hodgson’s Death Date",
      question: "What is his death date?",
      context:
        "The timeline needs a verifiable source for the death date of George Hodgson, the London brewer associated with the India Pale Ale storyline.",
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">BEER</Link>
          </p>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">BEER CHRONICLES</Link>
            </p>
            <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </p>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">CHRONICLES</Link>
          </p>
          <p
            aria-hidden="true"
            className="text-stone-600 mt-2 tracking-wide uppercase text-sm"
          >
            Open Research Challenges
          </p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-semibold font-serif text-stone-900 mb-2">
          Open Research Challenges
        </h1>

        <div className="space-y-4 text-gray-800">
          <p>
            Some beer history questions are still unresolved. This page collects open research challenges where Beer Chronicles needs stronger evidence before an entry can be added or corrected.
          </p>

          <p>
            If you can resolve one of these questions with reliable sources, please{" "}
            <Link
              href="/submit"
              className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              submit your finding here
            </Link>
            . Every resolved open research question will be awarded with a free beer of my choice, given to the submitting person if I accept the resolving entry.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {challenges.map((challenge, index) => (
            <article
              key={`${challenge.title}-${challenge.question}`}
              className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                Challenge #{index + 1}
              </div>

              <h2 className="text-lg font-semibold font-serif text-stone-900">
                {challenge.title}
              </h2>

              <p className="mt-2 font-serif text-base font-semibold leading-snug text-stone-800">
                {challenge.question}
              </p>

              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {challenge.context}
              </p>

              <div className="mt-4">
                <Link
                  href="/submit"
                  className="inline-flex min-h-10 items-center rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
                >
                  Submit a Resolution
                </Link>
              </div>
            </article>
          ))}
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
