// app/imprint/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Imprint | Beer Chronicles",
  description:
    "Legal notice, contact information, editorial responsibility, and Amazon Partner Programme disclosure for Beer Chronicles.",
  alternates: {
    canonical: "/imprint",
  },
  openGraph: {
    title: "Imprint | Beer Chronicles",
    description:
      "Legal notice, contact information, and disclosures for Beer Chronicles.",
    url: "/imprint",
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
};

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </h1>
          <HeaderMenu />
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <h1 className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </h2>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Mobile subtitle */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Imprint
          </h2>
        </div>
      </header>

      <section className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-6">
          Imprint
        </h2>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Information pursuant to § 5 DDG
            </h3>

            <address className="not-italic">
              Martin Schmidt
              <br />
              Bruchhausenstraße 19b
              <br />
              54290 Trier
              <br />
              Germany
            </address>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Contact
            </h3>

            <p>
              Email:{" "}
              <a
                href="mailto:schmaidt@web.de"
                className="underline hover:text-stone-900"
              >
                schmaidt@web.de
              </a>
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Responsible for editorial content
            </h3>

            <p>
              Responsible pursuant to § 18(2) MStV:
              <br />
              Martin Schmidt
              <br />
              Bruchhausenstraße 19b
              <br />
              54290 Trier
              <br />
              Germany
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Amazon Partner Programme
            </h3>

            <p>
              Beer Chronicles participates in the Amazon EU Associates
              Programme. As an Amazon Associate, I earn from qualifying
              purchases.
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
