// app/tastings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Beer Tastings with History | Beer Chronicles",
  description:
    "Discover tailored beer tastings that combine selected beers, guided sensory analysis, brewing context, and a journey through beer history.",
  alternates: {
    canonical: "/tastings",
  },
  openGraph: {
    title: "Beer Tastings with History | Beer Chronicles",
    description:
      "Discover tailored beer tastings combining sensory analysis, brewing context, and a journey through beer history.",
    url: "/tastings",
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
    "Beer Tastings with History | Beer Chronicles",
    "Discover tailored beer tastings combining sensory analysis, brewing context, and a journey through beer history."
  ),
};

export default function TastingsPage() {
  const tastingElements = [
    "appearance, aroma, flavor, mouthfeel, and finish",
    "malt, hops, yeast, fermentation, water, and other ingredients",
    "the defining characteristics of different beer styles",
    "the historical conditions in which those styles emerged",
    "changes in brewing technology and drinking culture",
    "the relationship between traditional styles and modern interpretations",
  ];

  const tastingIncludes = [
    "a carefully curated selection of beers",
    "guided sensory analysis",
    "historical and brewing-related background",
    "water and supporting tasting materials",
    "time for questions and discussion",
  ];

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </h1>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
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

        {/* Mobile second title line and page subtitle */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Beer Tastings with History
          </h2>
        </div>
      </header>

      <section className="max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold font-serif text-stone-900 mb-3">
            Beer Tastings with History
          </h2>

          <p className="text-lg md:text-xl text-stone-600 font-serif">
            Great beers. Sensory discovery. Stories that shaped beer.
          </p>
        </div>

        <div className="space-y-4 text-gray-800 leading-relaxed">
          <p>
            Beer is more than a drink. Every glass reflects ingredients,
            brewing techniques, regional traditions, technological innovation,
            and centuries of cultural history.
          </p>

          <p>
            My tastings combine carefully selected beers with guided sensory
            discovery and a strong historical narrative. We explore not only
            what a beer tastes like, but also why it tastes that way, where its
            distinctive character comes from, and how it fits into the wider
            history of beer.
          </p>

          <p>
            Each tasting is designed as a coherent journey rather than a simple
            succession of samples. The selection and historical narrative can
            be adapted to the occasion, the interests of the group, and the
            participants&apos; level of experience.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-4">
            More Than a Standard Beer Tasting
          </h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              During the tasting, participants learn how to approach beer
              systematically and enjoyably.
            </p>

            <p>We explore:</p>

            <ul className="list-disc pl-6 space-y-2">
              {tastingElements.map((element) => (
                <li key={element}>{element}</li>
              ))}
            </ul>

            <p>
              The aim is not to turn beer enjoyment into an academic exercise.
              Historical and technical context can make the beers more
              accessible, memorable, and enjoyable.
            </p>

            <p className="font-medium">No previous knowledge is required. Curiosity is enough.</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-4">
            Tastings Tailored to the Occasion
          </h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              Every tasting can be developed around the interests of the group.
              It may offer a broad journey through beer history or focus more
              closely on particular styles, brewing traditions, ingredients,
              regions, technological developments, or historical periods.
            </p>

            <p>
              The number and selection of beers, the duration of the tasting,
              and the level of historical and technical detail can all be
              adapted. This creates an experience that works for curious
              beginners as well as experienced beer enthusiasts.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-4">
            For Private Groups, Companies, and Events
          </h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              The tastings are suitable for private celebrations, company
              events, team activities, cultural organizations, restaurants,
              beer venues, conferences, and other special occasions.
            </p>

            <p>
              Whether the goal is an entertaining introduction to beer, a
              deeper sensory experience, or a historically focused evening, the
              tasting will be shaped around the group and the setting.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-4">Your Guide</h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              I am a certified beer sommelier, passionate homebrewer, and the
              creator of Beer Chronicles.
            </p>

            <p>
              My sensory training, practical brewing experience, and historical
              research come together in every tasting. This allows us to
              connect what is in the glass with the ingredients, processes,
              people, inventions, and traditions behind it.
            </p>

            <p>
              You can learn more about me and the background of Beer Chronicles
              on the{" "}
              <Link
                href="/about"
                className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                About page
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-4">A Typical Tasting</h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>A tasting usually includes:</p>

            <ul className="list-disc pl-6 space-y-2">
              {tastingIncludes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p>
              The precise duration, number of beers, and structure will be
              agreed upon in advance.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold font-serif text-stone-900 mb-4">
            Interested in a Tasting?
          </h2>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              Tell me a little about your group, the preferred location, the
              approximate number of participants, and the kind of experience
              you are looking for.
            </p>

            <p>
              Together, we can create a tasting that combines excellent beer,
              sensory discovery, and a journey through beer history.
            </p>

            <a
              href="mailto:schmaidt@web.de?subject=Beer%20tasting%20request"
              className="inline-flex rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
            >
              Request a Tasting
            </a>
          </div>
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
