// components/HeaderMenu.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const navigationId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  // Close on Escape and on outside click
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        buttonRef.current?.focus();
      }
    };

    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node | null;

      if (!menuRef.current) return;
      if (t && menuRef.current.contains(t)) return;

      close();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  // Close when focus leaves the menu
  useEffect(() => {
    if (!open) return;

    const onFocus = (e: FocusEvent) => {
      const t = e.target as Node | null;

      if (!menuRef.current) return;
      if (t && menuRef.current.contains(t)) return;

      close();
    };

    document.addEventListener("focusin", onFocus);

    return () => {
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="inline-flex h-11 w-11 flex-col items-center justify-center rounded-full border bg-white shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls={navigationId}
      >
        <span
          className={`h-0.5 w-5 bg-black rounded transition-transform ${
            open ? "translate-y-1 rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-black rounded my-0.5 transition-opacity ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-black rounded transition-transform ${
            open ? "-translate-y-1 -rotate-45" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <nav
          id={navigationId}
          aria-label="Main navigation"
          className="absolute right-0 z-30 mt-2 w-52 rounded-lg border bg-white py-1 text-sm shadow-lg"
        >
          <div>
            <Link
              href="/"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Timeline
            </Link>

            <Link
              href="/storylines"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Storylines
            </Link>

            <Link
              href="/about"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              About
            </Link>

            <Link
              href="/tastings"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Tastings
            </Link>

            <Link
              href="/editorial-principles"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Editorial Principles
            </Link>

            <Link
              href="/sources"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Sources
            </Link>

            <Link
              href="/challenges"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Open Challenges
            </Link>

            <Link
              href="/submit"
              onClick={close}
              className="block px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400"
            >
              Submit an Entry
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
