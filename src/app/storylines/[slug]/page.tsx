import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import ScrollToTop from "@/components/ScrollToTop";
import StorylineStructuredData from "@/components/StorylineStructuredData";
import { formatEventDate } from "@/components/timelineUtils";
import { getEventPath } from "@/lib/eventUrls";
import { getStorylinePageData } from "@/lib/storylinePageData";
import { getTwitterMetadata } from "@/lib/siteMetadata";
import {
  getStorylineBySlug,
  getStorylinePageTitle,
  getStorylineStaticParams,
  getStorylineTimelineHref,
  getStorylineUrl,
} from "@/lib/storylines";

type StorylinePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStorylineStaticParams();
}

export async function generateMetadata({
  params,
}: StorylinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const storyline = getStorylineBySlug(slug);

  if (!storyline) {
    return {
      title: "Storyline Not Found | Beer Chronicles",
      robots: { index: false, follow: false },
    };
  }

  const title = getStorylinePageTitle(storyline);
  const canonicalUrl = getStorylineUrl(storyline);

  return {
    title,
    description: storyline.description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: storyline.description,
      url: canonicalUrl,
      siteName: "Beer Chronicles",
      type: "website",
    },
    twitter: getTwitterMetadata(title, storyline.description),
  };
}

export default async function StorylinePage({
  params,
}: StorylinePageProps) {
  const { slug } = await params;
  const pageData = await getStorylinePageData(slug);

  if (!pageData) {
    notFound();
  }

  const { storyline, events } = pageData;

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <StorylineStructuredData storyline={storyline} />

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
              A Beer History Storyline
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
            A Beer History Storyline
          </p>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl">
        <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Beer History Storyline
          </p>
          <h1 className="mt-2 break-words font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {storyline.title}
          </h1>
          <p className="mt-5 leading-7 text-stone-700">
            {storyline.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={getStorylineTimelineHref(storyline)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              <span>Explore on Timeline</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/storylines"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              <span>All Storylines</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="milestones-heading"
          className="mt-8"
        >
          <div>
            <h2
              id="milestones-heading"
              className="font-serif text-2xl font-semibold text-stone-900"
            >
              Chronological milestones
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Sources and further references are available on each individual event page.
            </p>
          </div>

          {events.length > 0 ? (
            <ol className="mt-6 space-y-4">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-stone-500">
                    {formatEventDate(event)}
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-stone-900">
                    <Link
                      href={getEventPath(event.id, event.title)}
                      className="underline decoration-transparent underline-offset-2 transition hover:decoration-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
                    >
                      {event.title}
                    </Link>
                  </h3>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
              No published milestones are currently available for this Storyline.
            </p>
          )}
        </section>

        <nav
          aria-labelledby="continue-exploring-heading"
          className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <h2
            id="continue-exploring-heading"
            className="font-serif text-xl font-semibold text-stone-900"
          >
            Continue exploring
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/storylines"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              <span>Storylines overview</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={getStorylineTimelineHref(storyline)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              <span>Explore on Timeline</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            >
              <span>Full Timeline</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </nav>
      </article>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
