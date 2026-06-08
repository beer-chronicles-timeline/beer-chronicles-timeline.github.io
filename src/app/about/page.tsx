// app/about/page.tsx
import Link from "next/link";
import Image from "next/image";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";

export default function AboutPage() {
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
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
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
            About this page
          </h2>
        </div>
      </header>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">What Is This About?</h2>

        <div className="space-y-4 text-gray-800">
          {/* Image with text wrapping - float right on desktop, centered on mobile */}
          <div className="float-right ml-6 mb-4 w-40 md:w-48">
            <Image
              src="/images/martin-schmidt.jpg"
              alt="Martin Schmidt - Beer historian and homebrewer"
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>

          <p>
            My name is Martin Schmidt. I am a homebrewer since 2020 and a certified beer sommelier since 2024. Plus: I'm a beer history geek.
          </p>

          <p>
            This project started a few years ago with just some more or less sorted notes about important events in the history of beer. I collected these notes when doing my research for the next beer style to be brewed or the next tasting to be planned.
          </p>

          <p>
            Since then I had the idea to move these notes to a beer history timeline that can be filtered by tags or categories. In 2026, I finally found the time to do it and - here it is!
          </p>

          <p>
Disclaimer: This timeline is, of course, not meant to be comprehensive. Moreover, although I tried to be as careful as possible, there can be mistakes! If you detect any bug: <a href="mailto:schmaidt@web.de?subject=Mistake%20in%20the%20beer%20history%20timeline" className="underline">just let me know</a> and I will correct. Additionally, if you have an entry in mind that needs to be included, please <Link href="/submit" className="underline">submit a new entry here</Link>!
          </p>

          <p className="pt-4 text-sm text-gray-600">
            <Link href="/" className="underline hover:no-underline">
              ← Back to the Beer History Timeline
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
