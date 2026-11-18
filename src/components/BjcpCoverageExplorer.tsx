"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterBjcpCoverage, getBjcpCoverageTotals, type BjcpCoverageCategory } from "@/lib/bjcpCoverage";
import { useHydrated } from "@/lib/useHydrated";

type Props = { categories: BjcpCoverageCategory[] };

export default function BjcpCoverageExplorer({ categories }: Props) {
  const ready = useHydrated();
  const [query, setQuery] = useState("");
  const [coverage, setCoverage] = useState<"all" | "covered" | "uncovered">("all");
  const totals = useMemo(() => getBjcpCoverageTotals(categories), [categories]);
  const filtered = useMemo(() => filterBjcpCoverage(categories, query, coverage), [categories, query, coverage]);
  const visible = filtered.reduce((count, category) => count + category.styles.length, 0);
  const summary: [string, number][] = [
    ["BJCP styles and categories listed", totals.profiles],
    ["Styles and categories covered by at least one entry", totals.covered],
  ];

  return (
    <section aria-label="BJCP style and category coverage" className="mt-8">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white px-5 py-4">
            <dt className="text-sm text-stone-600">{label}</dt>
            <dd className="mt-1 font-serif text-3xl font-semibold tabular-nums text-stone-900">{value.toLocaleString("en")}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-6 text-stone-600">
        Counts use style tags. Each entry is counted once per style or category and may appear in several rows.
      </p>

      <fieldset disabled={!ready} className="mt-6 grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] md:p-5">
        <legend className="sr-only">Find styles and categories</legend>
        <div>
          <label htmlFor="bjcp-style-search" className="block text-sm font-medium text-stone-700">Find a style or category</label>
          <input id="bjcp-style-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Style name, BJCP code, or category" className="mt-2 h-11 w-full appearance-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500" />
        </div>
        <div className="sm:w-48">
          <label htmlFor="bjcp-coverage-filter" className="block text-sm font-medium text-stone-700">Coverage</label>
          <div className="relative mt-2">
            <select id="bjcp-coverage-filter" value={coverage} onChange={event => setCoverage(event.target.value as typeof coverage)} className="h-11 w-full appearance-none rounded-lg border border-stone-300 bg-white py-2 pl-3 pr-10 text-base text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">
              <option value="all">All</option>
              <option value="covered">With entries</option>
              <option value="uncovered">Without entries</option>
            </select>
            <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </fieldset>
      <p role="status" aria-atomic="true" className="mt-4 text-sm text-stone-600">Showing {visible} of {totals.profiles} styles and categories.</p>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-stone-700">No styles or categories match these filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCoverage("all"); }} className="mt-3 min-h-11 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">Clear filters</button>
        </div>
      ) : filtered.map(category => (
        <section key={category.id} aria-labelledby={`bjcp-category-${category.id}`} className="mt-8">
          <h2 id={`bjcp-category-${category.id}`} className="font-serif text-xl font-semibold text-stone-900">
            {category.id !== "appendix-b" && <span className="mr-2 text-stone-500">{category.id}.</span>}{category.name}
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white">
            {category.styles.map(style => (
              <details key={style.id} id={`bjcp-${style.id}`} className="group border-t border-stone-100 first:border-t-0 open:bg-stone-50">
                <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 text-sm text-stone-900 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-500 sm:gap-3 sm:px-4 [&::-webkit-details-marker]:hidden">
                  <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-90 motion-reduce:transition-none" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="w-8 text-xs font-medium tabular-nums text-stone-500">{style.code}</span>
                  <span className="min-w-0 font-medium">{style.name}{style.isEntryCategory && <span className="mt-0.5 block text-xs font-normal text-stone-500">Entry category, including its named variants</span>}</span>
                  <span className={`min-w-9 rounded-full px-2.5 py-1 text-center text-sm font-medium tabular-nums ${style.entries.length ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{style.entries.length}<span className="sr-only"> {style.entries.length === 1 ? "related entry" : "related entries"}</span></span>
                </summary>
                <div className="border-t border-stone-200 px-4 pb-4 pt-3 sm:pl-16">
                  <a href={style.url} target="_blank" rel="noopener noreferrer" className="rounded-sm text-xs font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">BJCP 2021 description<span className="sr-only"> for {style.name} (opens in a new tab)</span></a>
                  {style.entries.length === 0 ? <p className="mt-3 text-sm leading-6 text-stone-600">No entries are tagged for this style or category yet.</p> : (
                    <div tabIndex={0} role="region" aria-label={`Entries related to ${style.name}`} className="mt-3 max-h-96 overflow-auto rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-500">
                      <table className="w-full text-left text-sm">
                        <caption className="sr-only">Beer Chronicles entries related to {style.name}, newest first</caption>
                        <thead className="sticky top-0 bg-stone-50 text-stone-600"><tr><th scope="col" className="w-28 py-2 pr-3 font-medium sm:w-40">Date</th><th scope="col" className="py-2 font-medium">Entry</th></tr></thead>
                        <tbody>{style.entries.map(entry => <tr key={entry.id} className="border-t border-stone-200"><td className="py-3 pr-3 align-top text-stone-600">{entry.dateLabel}</td><th scope="row" className="py-3 align-top font-normal"><Link href={entry.href} className="rounded-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">{entry.title}</Link></th></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
