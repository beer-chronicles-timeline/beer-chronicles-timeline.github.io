import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Privacy Information | Beer Chronicles",
  description:
    "Information about analytics and submission data used by Beer Chronicles.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Information | Beer Chronicles",
    description:
      "Information about analytics and submission data used by Beer Chronicles.",
    url: "/privacy",
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
    "Privacy Information | Beer Chronicles",
    "Information about analytics and submission data used by Beer Chronicles."
  ),
};

const linkClassName =
  "rounded-sm underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900 hover:decoration-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2";

export default function PrivacyPage() {
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
          <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Privacy Information
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto w-full">
        <h1 className="mb-3 font-serif text-2xl font-semibold text-stone-900">
          Privacy Information
        </h1>
        <p className="mb-8 leading-relaxed text-gray-700">
          This page explains how Beer Chronicles uses analytics and handles
          information submitted through the website.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-stone-900">
              Cloudflare Web Analytics
            </h2>
            <p>
              Beer Chronicles uses Cloudflare Web Analytics to understand page
              visits and website performance. A small analytics script runs
              when you visit a page and sends performance and usage information
              to Cloudflare for processing.
            </p>
            <p className="mt-3">
              According to Cloudflare, Web Analytics does not use cookies,
              local storage, or fingerprinting to track individual visitors.
              Cloudflare retains unsampled beacon data for seven days and then
              keeps aggregated, sampled data for longer-term reporting. Read
              Cloudflare&apos;s information about{" "}
              <a
                href="https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                data collection
              </a>{" "}
              and its{" "}
              <a
                href="https://developers.cloudflare.com/web-analytics/faq/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                Web Analytics FAQ
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-stone-900">
              Entry and correction submissions
            </h2>
            <p>
              The submission form uses Formspree. Your name and email address
              are sent through Formspree so I can clarify your submission and
              let you know if or when it is published. Your email address will
              not be published.
            </p>
            <p className="mt-3">
              I will only add your name—and, if you wish, a link—to the
              acknowledgements on the Sources page after asking for and
              receiving your consent. Read Formspree&apos;s{" "}
              <a
                href="https://formspree.io/security/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                privacy and security information
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-stone-900">
              Questions
            </h2>
            <p>
              If you have a question about this information, use the contact
              details in the <Link href="/imprint" className={linkClassName}>Imprint</Link>.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-4 text-sm text-gray-600">
          <Link href="/" className="underline hover:no-underline">
            ← Back to the Beer History Timeline
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
