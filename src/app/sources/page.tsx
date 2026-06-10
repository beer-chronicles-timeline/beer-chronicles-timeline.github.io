// app/sources/page.tsx
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function SourcesPage() {
  const sources = [
    {
      title: "Brautag Podcast",
      description: "An indispensable podcast for all beer lovers and (home) brewing enthusiasts. The well-founded chapters on beer history have inspired and verified many of my entries.",
      imageUrl: "/images/brautag.png",
      link: "https://brautagpodcast.com",
    },
    {
      title: "Jan Brücklmeier: Bier verstehen",
      description: "An excellent book that explains the world of beer from the basics to the finest nuances. The historical chapters in particular were a valuable source for this project.",
      imageUrl: "/images/bier-verstehen.png",
      link: "https://amzn.eu/d/03i9FyVL",
    },
    {
      title: "Andreas Krennmair: Vienna Lager",
      description: "A comprehensive deep dive into the history and brewing techniques of Vienna Lager. This book provided essential context for understanding the development of lager beer styles in Central Europe.",
      imageUrl: "/images/Andreas-Krennmair-Vienna-Lager.jpeg",
      link: "https://amzn.eu/d/07tUwDrp",
    },
    {
      title: "Stan Hieronymus: Brew Like a Monk",
      description: "An authoritative exploration of Trappist and abbey brewing traditions. This book was invaluable for understanding the rich beer culture of Belgian monasteries and their historical significance.",
      imageUrl: "/images/Stan-Hieronymous-Brew-like-a-monk.jpg",
      link: "https://amzn.eu/d/04A0zDL0",
    },
    {
      title: "Craft Beer & Brewing: The Oxford Companion to Beer",
      description: "An essential reference work covering all aspects of beer and brewing, from historical developments to technical brewing terms. The dictionary entries provided valuable context for many historical events and brewing concepts featured in this timeline.",
      imageUrl: "/images/craft-beer-and-brewing.png",
      link: "https://www.beerandbrewing.com/dictionary",
    },
  ];

  const otherTimelines = [
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
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            BEER
          </h1>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-1/3" />
          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              BEER CHRONICLES
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </h2>
          </div>
          <div className="w-1/3 flex justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            CHRONICLES
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            Main Sources
          </h2>
        </div>
      </header>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-4">Main Sources & Acknowledgments</h2>

        <p className="text-gray-700 mb-8 leading-relaxed">
          This timeline would not have been possible without the incredible work of beer historians, journalists, podcasters, bloggers, and authors.
          I want to give the following sources and the people behind them the biggest credit possible. Their dedication to beer culture and history has been an inspiration for this project.
        </p>

        <div className="space-y-8">
          {sources.map((source, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
              {/* Image - left side */}
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

              {/* Text - right side */}
              <div className="w-full md:w-2/3">
                <h3 className="text-xl font-semibold font-serif text-stone-900 mb-2">
                  <a href={source.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {source.title}
                  </a>
                </h3>
                <p className="text-gray-700 leading-relaxed">{source.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Other Beer History Timelines Section */}
        <div className="mt-12 pt-6 border-t border-stone-200">
          <h3 className="text-xl font-semibold font-serif text-stone-900 mb-3">Other Beer History Timelines</h3>
          <p className="text-gray-600 mb-4">
            For further exploration of beer history, here are some other excellent timeline resources:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {otherTimelines.map((timeline, index) => (
              <li key={index}>
                <a 
                  href={timeline.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-stone-900"
                >
                  {timeline.title}
                </a>
              </li>
            ))}
          </ul>
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