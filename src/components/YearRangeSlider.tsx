"use client";

import * as Slider from "@radix-ui/react-slider";
import { useEffect, useId, useRef, useState } from "react";
import { parseHistoricalYear } from "@/lib/yearInput";
import { createYearRangeScale, historicalYearToSliderValue, sliderValueToHistoricalYear } from "@/lib/yearRangeScale";

type Props = {
  startYear: number;
  endYear: number;
  setStartYear: (value: number) => void;
  setEndYear: (value: number) => void;
  minYear: number;
  maxYear: number;
};

function formatHistoricalYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }

  return String(year);
}

export default function YearRangeSlider({
  startYear,
  endYear,
  setStartYear,
  setEndYear,
  minYear,
  maxYear,
}: Props) {
  const [startInputDraft, setStartInputDraft] =
    useState<string | null>(null);

  const [endInputDraft, setEndInputDraft] =
    useState<string | null>(null);

  const startInputValue =
    startInputDraft ?? formatHistoricalYear(startYear);

  const endInputValue =
    endInputDraft ?? formatHistoricalYear(endYear);

  const helpId = useId();
  const sliderRef = useRef<HTMLSpanElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSliderWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const drag = useRef<{ isStart: boolean; x: number; fraction: number; width: number } | null>(null);
  const minimum = historicalYearToSliderValue(minYear);
  const maximum = historicalYearToSliderValue(maxYear);
  const startValue = historicalYearToSliderValue(startYear);
  const endValue = historicalYearToSliderValue(endYear);
  const scale = createYearRangeScale(minYear, maxYear);
  const fromFraction = scale.yearToFraction(startYear);
  const toFraction = scale.yearToFraction(endYear);
  const handlesClose = (toFraction - fromFraction) * Math.max(0, sliderWidth - 44) < 44;
  const commitBoundary = (isStart: boolean, value: number) => {
    const clamped = Math.max(isStart ? minimum : startValue, Math.min(value, isStart ? endValue : maximum));
    if (isStart) { setStartInputDraft(null); setStartYear(sliderValueToHistoricalYear(clamped)); }
    else { setEndInputDraft(null); setEndYear(sliderValueToHistoricalYear(clamped)); }
    return clamped;
  };
  const startParsed = parseHistoricalYear(startInputValue);
  const endParsed = parseHistoricalYear(endInputValue);
  const startInvalid = startParsed === null || startParsed < minYear || startParsed > endYear;
  const endInvalid = endParsed === null || endParsed < startYear || endParsed > maxYear;

  const handleStartInputBlur = () => {
    if (startInvalid) return;
    setStartYear(startParsed!);
    setStartInputDraft(null);
  };
  const handleEndInputBlur = () => {
    if (endInvalid) return;
    setEndYear(endParsed!);
    setEndInputDraft(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-2 px-4 md:px-0">
      {/* Labels + input fields on the same row */}
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <div className="flex items-center gap-1">
          <span>From:</span>

          <input
            id="startYearInput"
            type="text"
            value={startInputValue}
            onChange={(event) => setStartInputDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") handleStartInputBlur(); }}
            aria-invalid={startInvalid}
            aria-describedby={startInvalid ? helpId : undefined}
            onBlur={handleStartInputBlur}
            aria-label="Start year"
            className="h-10 w-24 rounded-md border border-gray-300 px-2 text-base md:text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-500"
          />
        </div>

        <div className="flex items-center gap-1">
          <input
            id="endYearInput"
            type="text"
            value={endInputValue}
            onChange={(event) => setEndInputDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") handleEndInputBlur(); }}
            aria-invalid={endInvalid}
            aria-describedby={endInvalid ? helpId : undefined}
            onBlur={handleEndInputBlur}
            aria-label="End year"
            className="h-10 w-24 rounded-md border border-gray-300 px-2 text-right text-base md:text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stone-500"
          />

          <span>To:</span>
        </div>
      </div>

      {(startInvalid || endInvalid) && (
        <p id={helpId} role="status" className="mb-2 text-xs text-red-700">
          Enter a whole year within the selected range, such as 1800 or 1800 BC, without commas. There is no year zero. The range keeps its last valid values.
        </p>
      )}

      <Slider.Root
        ref={sliderRef}
        // Leave room for vertical separation without moving the track or ticks.
        className="relative flex h-[68px] w-full touch-none select-none items-center [&>span]:pointer-events-none"
        role="group"
        aria-label="Year range"
        min={0}
        max={1}
        step={0.0000001}
        value={[fromFraction, toFraction]}
        onValueChange={([from, to]) => {
          setStartInputDraft(null);
          setEndInputDraft(null);
          setStartYear(scale.fractionToYear(from));
          setEndYear(scale.fractionToYear(to));
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          if (event.button !== 0) return;
          const root = event.currentTarget;
          const rect = root.getBoundingClientRect();
          const width = Math.max(1, rect.width - 44);
          const x = event.clientX - rect.left;
          const boundary = (event.target as HTMLElement).closest<HTMLElement>("[data-boundary]")?.dataset.boundary;
          const isStart = boundary ? boundary === "start" : Math.abs(x - (22 + fromFraction * width)) <= Math.abs(x - (22 + toFraction * width));
          root.querySelector<HTMLElement>(`[data-boundary="${isStart ? "start" : "end"}"]`)!.focus({ preventScroll: true });
          // Retain the grab offset on a thumb; clicking the track moves the
          // nearest endpoint. Separate hit areas use the same year scale.
          const value = boundary ? (isStart ? startValue : endValue) : commitBoundary(isStart,
            historicalYearToSliderValue(scale.fractionToYear((x - 22) / width)));
          drag.current = { isStart, x: event.clientX, fraction: scale.yearToFraction(sliderValueToHistoricalYear(value)), width };
          root.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          event.preventDefault();
          if (!drag.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const { isStart, x, fraction, width } = drag.current;
          commitBoundary(isStart, historicalYearToSliderValue(scale.fractionToYear(fraction + (event.clientX - x) / width)));
        }}
        onPointerUp={(event) => {
          event.preventDefault();
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current = null; }}
        onLostPointerCapture={() => { drag.current = null; }}
      >
        <Slider.Track className="relative mx-[22px] h-2 grow rounded-full bg-gray-200">
          <span
            className="absolute h-full rounded-full bg-stone-600"
            style={{ left: `${fromFraction * 100}%`, right: `${(1 - toFraction) * 100}%` }}
          />
        </Slider.Track>
        {(["start", "end"] as const).map((boundary) => {
          const isStart = boundary === "start";
          const year = isStart ? startYear : endYear;
          return (
            <Slider.Thumb
              key={boundary}
              data-boundary={boundary}
              // Separate nearby handles vertically, preserving their exact year
              // positions and keeping each 44px target's center reachable.
              className="group pointer-events-auto relative flex h-11 w-11 items-center justify-center bg-transparent focus-visible:outline-none"
              style={{ transform: `translateY(${handlesClose ? (isStart ? -12 : 12) : 0}px)` }}
              aria-label={isStart ? "Start year" : "End year"}
              aria-valuemin={isStart ? minimum : startValue}
              aria-valuemax={isStart ? endValue : maximum}
              aria-valuenow={isStart ? startValue : endValue}
              aria-valuetext={`${Math.abs(year)} ${year < 0 ? "BCE" : "CE"}`}
              onKeyDown={(event) => {
                const direction = ["ArrowRight", "ArrowUp", "PageUp"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowDown", "PageDown"].includes(event.key) ? -1 : 0;
                if (!direction && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                const step = event.shiftKey || event.key.startsWith("Page") ? 10 : 1;
                const next = event.key === "Home" ? (isStart ? minimum : startValue) : event.key === "End" ? (isStart ? endValue : maximum) : historicalYearToSliderValue(year) + direction * step;
                commitBoundary(isStart, next);
              }}
            >
              <span aria-hidden="true" className="pointer-events-none h-6 w-6 rounded-full border-2 border-black bg-white shadow group-focus-visible:ring-2 group-focus-visible:ring-stone-500 group-focus-visible:ring-offset-2" />
            </Slider.Thumb>
          );
        })}
      </Slider.Root>
      {/* Match the visible track's margins so endpoint ticks align with its ends. */}
      <div aria-hidden="true" className="relative mx-[22px] h-7 text-[10px] text-gray-600 sm:text-xs">
        {scale.markers.map((year) => (
          <span key={year} data-year-marker={year} className={`absolute flex flex-col whitespace-nowrap ${year === minYear ? "items-start" : year === maxYear ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"}`} style={{ left: `${scale.yearToFraction(year) * 100}%` }}>
            <span className="mb-1 h-1.5 w-px bg-gray-400" />
            <span className={year === minYear ? "-translate-x-[22px]" : year === maxYear ? "translate-x-[22px]" : undefined}>
              {formatHistoricalYear(year)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
