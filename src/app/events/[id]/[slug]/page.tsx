// app/events/[id]/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventDetailContent from "@/components/EventDetailContent";
import EventStructuredData from "@/components/EventStructuredData";
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import RelatedEventLinks from "@/components/RelatedEventLinks";
import ScrollToTop from "@/components/ScrollToTop";
import {
  getRelatedEvents,
  truncate,
} from "@/components/timelineUtils";
import {
  getEventPageData,
  getEventStaticParamSources,
} from "@/lib/eventPageData";
import {
  createEventSlug,
  getEventUrl,
} from "@/lib/eventUrls";

const BASE_URL = "https://beer-chronicles.org";
const DEFAULT_SOCIAL_IMAGE =
  "/images/beer-chronicles-social.png";

type EventPageProps = {
  params: Promise<{
    id: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const events = await getEventStaticParamSources();

  return events.map((event) => ({
    id: event.id,
    slug: createEventSlug(event.title),
  }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id, slug } = await params;
  const pageData = await getEventPageData(id);

  if (!pageData) {
    return {
      title: "Event Not Found | Beer Chronicles",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { event } = pageData;
  const canonicalSlug = createEventSlug(event.title);

  if (slug !== canonicalSlug) {
    return {
      title: "Event Not Found | Beer Chronicles",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = getEventUrl(event.id, event.title);

  const description =
    truncate(event.description, 160) ??
    `Explore ${event.title} in the Beer Chronicles interactive beer-history timeline.`;

  const socialImage = event.image_url ?? DEFAULT_SOCIAL_IMAGE;

  return {
    title: `${event.title} | Beer Chronicles`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${event.title} | Beer Chronicles`,
      description,
      url: canonicalUrl,
      siteName: "Beer Chronicles",
      type: "article",
      images: [
        {
          url: socialImage,
          alt: event.image_url
            ? event.title
            : "Beer Chronicles — A Timeline of Beer History",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | Beer Chronicles`,
      description,
      images: [socialImage],
    },
  };
}

export default async function EventPage({
  params,
}: EventPageProps) {
  const { id, slug } = await params;
  const pageData = await getEventPageData(id);

  if (!pageData) {
    notFound();
  }

  const { event, events } = pageData;
  const canonicalSlug = createEventSlug(event.title);

  if (slug !== canonicalSlug) {
    notFound();
  }

  const relatedEvents = getRelatedEvents(event, events);
  const socialImage = event.image_url ?? DEFAULT_SOCIAL_IMAGE;
  const absoluteSocialImageUrl = new URL(
    socialImage,
    BASE_URL
  ).toString();

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 p-4 md:p-10">
      <EventStructuredData
        event={event}
        socialImageUrl={absoluteSocialImageUrl}
      />

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
            Beer History Entry
          </p>
        </div>
      </header>

      <MainContentStart />

      <div className="mx-auto w-full max-w-3xl">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <EventDetailContent event={event} titleAs="h1" />

          <RelatedEventLinks relatedEvents={relatedEvents} />
        </article>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
          >
            <span className="mr-2" aria-hidden="true">
              ←
            </span>
            Back to the timeline
          </Link>
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
