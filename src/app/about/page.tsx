// app/about/page.tsx
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="w-full md:w-1/3 order-1 md:order-1" />
        <div className="w-full md:w-1/3 text-left md:text-center order-2 md:order-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif md:whitespace-nowrap">
            <span className="block md:inline">BEER</span>{" "}
            <span className="block md:inline">CHRONICLES</span>
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm md:mt-2">
            An Interactive Beer History Timeline
          </h2>
        </div>
        <div className="w-full md:w-1/3 flex justify-end order-3 md:order-3">
          <HeaderMenu />
        </div>
      </header>

      <section className="max-w-2xl mx-auto space-y-4 text-gray-800">
        <h2 className="text-xl font-semibold mb-2">What is this about?</h2>

        <p>My name is Martin Schmidt. I am a homebrewer since 2020 and a certified beer sommelier since 2024. Plus: I'm a beer history geek.</p>

        <p>This project started a few years ago with just some more or less sorted notes about important events in the history of beer. I collected these notes when doing my research for the next beer style to be brewed or the next tasting to be planned.</p>

        <p>Since then I had the idea to move these notes to a beer history timeline that can be filtered by tags or categories. In 2026, I finally found the time to do it and - here it is!</p>

        <p>Disclamer: This timeline is, of course, not meant to be comprehensive. Moreover, although I tried to be as careful as possible, there can be mistakes! If you detect any bug: <a href="mailto:schmaidt@web.de?subject=Mistake%20in%20the%20beer%20history%20timeline" className="underline">just let me know</a> and I will correct. Additionally, if you have an entry in mind that needs to be included - again - <a href="mailto:schmaidt@web.de?subject=New%20entry%20suggestion%20for%20the%20beer%20history%20timeline" className="underline">just let me know</a>!</p>

        <p className="pt-4 text-sm text-gray-600">
          <Link href="/" className="underline hover:no-underline">
            ← Back to the Beer History Timeline
          </Link>
        </p>
      </section>
    </main>
  );
}
