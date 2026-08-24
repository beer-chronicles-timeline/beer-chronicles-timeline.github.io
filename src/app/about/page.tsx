// app/about/page.tsx
import Link from "next/link";
import Image from "next/image";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const useCases = [
    {
      title: "For Sommeliers",
      description:
        "Planning your next tasting and need historical context? Filter by beer style, brewery, ingredients, or time period. Use tags and categories to find the exact historic background you need to impress your guests with compelling stories behind each beer.",
      icon: "🍻",
    },
    {
      title: "For Retailers",
      description:
        "Need a fresh angle for a new beer in your portfolio? Looking for an interesting anecdote from beer history to spark customer curiosity? Filter by beer or style and discover fascinating backstories that make your product stand out on the shelf.",
      icon: "🛒",
    },
    {
      title: "For (Home) Brewers",
      description:
        "Curious about where a beer style comes from? Want to understand its original ingredients – grain bill, hops, yeast, and traditional brewing methods? Discover who brewed it first, what inspired them, and how historical examples can guide your own recipe development.",
      icon: "🔬",
    },
    {
      title: "For Craft Beer Pubs",
      description:
        "Elevate your beer menu with rich historical context. Train your staff with authentic stories behind each pour, create themed tasting flights based on historical eras, and engage customers with the fascinating heritage of the beers you serve. A knowledgeable pub keeps patrons coming back.",
      icon: "🏛️",
    },
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

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            About this page
          </h2>
        </div>
      </header>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-4">
          What Is This About?
        </h2>

        <div className="space-y-4 text-gray-800">
          {/* Image with text wrapping - float right on desktop, centered on mobile */}
          <div className="mx-auto mb-5 w-40 md:float-right md:mx-0 md:ml-6 md:mb-4 md:w-48">
            <Image
              src="/images/martin-schmidt.jpg"
              alt="Martin Schmidt - Beer historian and homebrewer"
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>

          <p>
            My name is Martin Schmidt. I am a homebrewer since 2020 and a
            certified beer sommelier since 2024. Plus: I&apos;m a beer history
            geek.
          </p>

          <p>
            This project started a few years ago with just some more or less
            sorted notes about important events in the history of beer. I
            collected these notes when doing my research for the next beer
            style to be brewed or the next tasting to be planned.
          </p>

          <p>
            Since then I had the idea to move these notes to a beer history
            timeline that can be filtered by tags or categories. In 2026, I
            finally found the time to do it and - here it is!
          </p>

          <p>
            Beer Chronicles follows this history from prehistoric evidence of
            brewing to the present day. The timeline therefore includes both
            BCE and CE dates and is not limited by the range of an ordinary
            calendar date field.
          </p>

          <p>
            Disclaimer: This timeline is, of course, not meant to be
            comprehensive. Moreover, although I tried to be as careful as
            possible, there can be mistakes! If you detect any bug:{" "}
            <a
              href="mailto:schmaidt@web.de?subject=Mistake%20in%20the%20beer%20history%20timeline"
              className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              just let me know
            </a>{" "}
            and I will correct. Additionally, if you have an entry in mind that
            needs to be included, please{" "}
            <Link
              href="/submit"
              className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              submit a new entry here
            </Link>
            . You can also help investigate unresolved questions on the{" "}
            <Link
              href="/challenges"
              className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Open Challenges page
            </Link>
            .
          </p>
        </div>

        {/* Use Cases Section */}
        <div className="mt-12 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-semibold mb-6">
            Who Can Benefit from Beer Chronicles?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm"
              >
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h3 className="text-lg font-semibold font-serif text-stone-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
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
