// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkClassName =
    "rounded-sm transition hover:text-stone-700 focus-visible:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2";

  return (
    <footer className="mt-12 pt-6 pb-6 border-t border-stone-200 text-center text-sm text-stone-500">
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap justify-center gap-x-4 gap-y-2"
      >
        <Link href="/" className={linkClassName}>
          Timeline
        </Link>

        <Link href="/storylines" className={linkClassName}>
          Storylines
        </Link>

        <Link href="/about" className={linkClassName}>
          About
        </Link>

        <Link href="/tastings" className={linkClassName}>
          Tastings
        </Link>

        <Link href="/editorial-principles" className={linkClassName}>
          Editorial Principles
        </Link>

        <Link href="/sources" className={linkClassName}>
          Sources
        </Link>

        <Link href="/challenges" className={linkClassName}>
          Open Challenges
        </Link>

        <Link href="/submit" className={linkClassName}>
          Submit an Entry
        </Link>

        <Link href="/imprint" className={linkClassName}>
          Imprint
        </Link>
      </nav>

      <div className="mt-3">
        <p>© {currentYear} Beer Chronicles. All rights reserved.</p>
        <p className="mt-1">Built with 🍻 by Martin Schmidt</p>
      </div>
    </footer>
  );
}
