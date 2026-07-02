// components/HeaderMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
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
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="inline-flex flex-col justify-center items-center w-10 h-10 rounded-full border bg-white shadow-sm hover:bg-gray-50 transition"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="menu"
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
        <div
          role="menu"
          aria-label="Main menu"
          className="absolute right-0 mt-2 w-52 rounded-lg bg-white shadow-lg border z-30"
        >
          <nav className="py-1 text-sm">
            <Link
              href="/"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              Timeline
            </Link>

            <Link
              href="/submit"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              Submit New Entry
            </Link>

            <Link
              href="/challenges"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              Open Challenges
            </Link>

            <Link
              href="/editorial-principles"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              Editorial Principles
            </Link>

            <Link
              href="/sources"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              Main Sources
            </Link>

            <Link
              href="/about"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              About This Page
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}