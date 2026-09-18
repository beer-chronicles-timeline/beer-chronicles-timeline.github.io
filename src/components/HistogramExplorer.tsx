"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import YearRangeSlider from "@/components/YearRangeSlider";
import {
  buildHistogram,
  histogramRangeLabel,
  histogramYearLabel,
  yearCoordinate,
} from "@/lib/histogram";

type Props = { years: number[]; currentYear: number; undatedCount: number };

export default function HistogramExplorer({ years, currentYear, undatedCount }: Props) {
  const minYear = Math.min(1800, ...years);
  const maxYear = Math.max(currentYear, ...years);
  const [from, setFrom] = useState(1800);
  const [to, setTo] = useState(currentYear);
  const [binSize, setBinSize] = useState(10);
  const [binDraft, setBinDraft] = useState("10");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [width, setWidth] = useState(900);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const bins = useMemo(() => buildHistogram(years, from, to, binSize), [years, from, to, binSize]);
  const total = bins.reduce((sum, bin) => sum + bin.count, 0);
  const peak = Math.max(1, ...bins.map((bin) => bin.count));
  const roughStep = peak / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = Math.max(1, [1, 2, 5, 10].find((value) => value * magnitude >= roughStep)! * magnitude);
  const ceiling = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: Math.round(ceiling / step) + 1 }, (_, index) => index * step);
  const left = 48;
  const right = 20;
  const top = 32;
  const bottom = 294;
  const plotWidth = Math.max(1, width - left - right);
  const rangeStart = yearCoordinate(from);
  const span = yearCoordinate(to) - rangeStart + 1;
  const x = (coordinate: number) => left + (coordinate - rangeStart) / span * plotWidth;
  const y = (count: number) => bottom - count / ceiling * (bottom - top);
  const active = selectedIndex === null ? null : bins[Math.min(selectedIndex, bins.length - 1)];
  const binValid = /^\d+$/.test(binDraft) && Number.isSafeInteger(Number(binDraft)) && Number(binDraft) > 0;
  const labelCount = width < 500 ? 3 : 6;
  const labelIndices = [...new Set(Array.from({ length: labelCount }, (_, index) => Math.round(index * (bins.length - 1) / (labelCount - 1))))];

  function changeFrom(value: number) { setFrom(value); setSelectedIndex(null); }
  function changeTo(value: number) { setTo(value); setSelectedIndex(null); }
  function selectAt(clientX: number) {
    const bounds = chartRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const coordinate = rangeStart + Math.max(0, Math.min(1, (clientX - bounds.left - left) / plotWidth)) * span;
    const index = bins.findIndex((bin) => yearCoordinate(bin.to) + 1 > coordinate);
    setSelectedIndex(index < 0 ? bins.length - 1 : index);
  }

  return (
    <section aria-label="Timeline histogram" className="mt-8">
      <div className="rounded-xl border border-stone-200 bg-white p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center md:gap-10">
          <div className="min-w-0 [&>div]:px-0 max-[380px]:[&_input]:w-20">
            <h2 className="mb-4 text-sm font-semibold text-stone-900">Time range</h2>
            <YearRangeSlider startYear={from} endYear={to} setStartYear={changeFrom} setEndYear={changeTo} minYear={minYear} maxYear={maxYear} />
          </div>
          <div>
            <label htmlFor="histogram-bin-size" className="block text-sm font-semibold text-stone-900">Years per bin</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="histogram-bin-size" type="number" min="1" step="1" value={binDraft}
                aria-invalid={!binValid} aria-describedby="histogram-bin-help"
                onChange={(event) => {
                  const raw = event.target.value;
                  setBinDraft(raw);
                  if (/^\d+$/.test(raw) && Number.isSafeInteger(Number(raw)) && Number(raw) > 0) {
                    setBinSize(Number(raw)); setSelectedIndex(null);
                  }
                }}
                className="h-11 w-28 rounded-md border border-stone-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
              <span className="text-sm text-stone-600">years</span>
            </div>
            <p id="histogram-bin-help" className={`mt-2 text-xs ${binValid ? "text-stone-500" : "text-red-700"}`}>
              {binValid ? "Bins align to multiples of this number." : "Enter a positive whole number. The chart keeps the last valid value."}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
          <button type="button" onClick={() => { changeFrom(1800); changeTo(currentYear); }} className="min-h-10 rounded-full border border-stone-300 px-4 text-sm hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">1800–present</button>
          <button type="button" onClick={() => { changeFrom(minYear); changeTo(maxYear); }} className="min-h-10 rounded-full border border-stone-300 px-4 text-sm hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">All history</button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Entries over time</h2>
          <p aria-live="polite" aria-atomic="true" className="text-sm text-stone-600">{total.toLocaleString("en")} entries · {bins.length.toLocaleString("en")} bins · {binSize.toLocaleString("en")}-year bins</p>
        </div>
        <p className="mt-1 text-sm text-stone-500">{histogramRangeLabel(from, to)}</p>
        <div
          ref={chartRef} tabIndex={0} role="group" aria-label="Histogram: use left and right arrow keys to inspect bins"
          aria-describedby="histogram-instructions histogram-selection"
          className="mt-5 w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            setSelectedIndex((index) => event.key === "Home" ? 0 : event.key === "End" ? bins.length - 1 : Math.max(0, Math.min(bins.length - 1, (index ?? (event.key === "ArrowRight" ? -1 : bins.length)) + (event.key === "ArrowRight" ? 1 : -1))));
          }}
        >
          <svg width="100%" height="356" viewBox={`0 0 ${width} 356`} role="img" aria-labelledby="histogram-chart-title histogram-chart-description" onPointerMove={(event) => { if (event.pointerType === "mouse") selectAt(event.clientX); }} onClick={(event) => selectAt(event.clientX)}>
            <title id="histogram-chart-title">{`Timeline entry counts, ${histogramRangeLabel(from, to)}`}</title>
            <desc id="histogram-chart-description">Time is on the horizontal axis. Number of entries is on the vertical axis, starting at zero. Exact counts are also available in the table below.</desc>
            <text x="0" y="14" fontSize="12" fill="#57534e">Number of entries</text>
            {ticks.map((tick) => <g key={tick}>
              <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="#e7e5e4" />
              <text x={left - 10} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="#57534e">{tick}</text>
            </g>)}
            {bins.map((bin) => {
              const barX = x(yearCoordinate(bin.from));
              const barWidth = x(yearCoordinate(bin.to) + 1) - barX;
              return <rect key={bin.from} x={barX} y={y(bin.count)} width={barWidth} height={bottom - y(bin.count)} fill={active === bin ? "#a16207" : "#57534e"} stroke="#ffffff" strokeWidth={barWidth > 3 ? 0.7 : 0} />;
            })}
            {active && <rect x={x(yearCoordinate(active.from))} y={top} width={x(yearCoordinate(active.to) + 1) - x(yearCoordinate(active.from))} height={bottom - top} fill="#a16207" fillOpacity="0.08" stroke="#a16207" strokeWidth="1" />}
            <line x1={left} x2={width - right} y1={bottom} y2={bottom} stroke="#78716c" />
            {labelIndices.map((index, position) => <text key={index} x={position === labelIndices.length - 1 && bins.length > 1 ? width - right : x(yearCoordinate(bins[index].from))} y={bottom + 23} textAnchor={position === 0 ? "start" : position === labelIndices.length - 1 ? "end" : "middle"} fontSize="12" fill="#57534e">{histogramYearLabel(position === labelIndices.length - 1 && bins.length > 1 ? to : bins[index].from)}</text>)}
            <text x={left + plotWidth / 2} y="346" textAnchor="middle" fontSize="12" fill="#57534e">Year</text>
          </svg>
        </div>
        <div id="histogram-selection" role="status" className="mt-2 min-h-11 rounded-md bg-stone-100 px-3 py-3 text-sm text-stone-800">
          {active ? <><strong>{histogramRangeLabel(active.from, active.to)}</strong><span className="mx-2">·</span>{active.count} {active.count === 1 ? "entry" : "entries"}</> : total === 0 ? "No entries in this date range." : "Select a bin to see its exact range and entry count."}
        </div>
        <p id="histogram-instructions" className="mt-3 text-xs leading-5 text-stone-500">Hover or tap the chart to inspect a bin. With the chart focused, use the left and right arrow keys; Home and End jump to the first and last bins.</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600">Each entry is counted once at the year used on the timeline, including entries dated approximately. The first and last bins are clipped to your selected range. There is no year zero. These counts describe the coverage of Beer Chronicles.</p>
      {undatedCount > 0 && <p className="mt-2 text-sm text-stone-600">{undatedCount} {undatedCount === 1 ? "entry has" : "entries have"} no usable timeline year and {undatedCount === 1 ? "is" : "are"} excluded.</p>}
      <details className="mt-5 rounded-lg border border-stone-200 bg-white" onToggle={(event) => setShowTable(event.currentTarget.open)}>
        <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">Entry counts as a table</summary>
        {showTable && <div className="max-h-80 overflow-auto px-4 pb-4"><table className="w-full text-left text-sm">
          <caption className="sr-only">Entry counts by year range</caption>
          <thead className="sticky top-0 bg-white"><tr><th scope="col" className="py-2">Years</th><th scope="col" className="py-2 text-right">Entries</th></tr></thead>
          <tbody>{bins.map((bin) => <tr key={bin.from} className="border-t border-stone-100"><th scope="row" className="py-2 font-normal">{histogramRangeLabel(bin.from, bin.to)}</th><td className="py-2 text-right tabular-nums">{bin.count}</td></tr>)}</tbody>
        </table></div>}
      </details>
    </section>
  );
}
