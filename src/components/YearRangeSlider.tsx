"use client";

import * as Slider from "@radix-ui/react-slider";
import { useId, useRef, useState } from "react";
import { parseHistoricalYear } from "@/lib/yearInput";

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

function historicalYearToSliderValue(year: number): number {
  return year < 0 ? year : year - 1;
}

function sliderValueToHistoricalYear(value: number): number {
  return value < 0 ? value : value + 1;
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
  const drag = useRef<{ isStart: boolean; x: number; value: number; width: number } | null>(null);
  const minimum = historicalYearToSliderValue(minYear);
  const maximum = historicalYearToSliderValue(maxYear);
  const startValue = historicalYearToSliderValue(startYear);
  const endValue = historicalYearToSliderValue(endYear);
  const fromFraction = maximum === minimum ? 0 : (startValue - minimum) / (maximum - minimum);
  const toFraction = maximum === minimum ? 1 : (endValue - minimum) / (maximum - minimum);
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

      {/* Historical year display below the labels and inputs */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">
          {formatHistoricalYear(startYear)}
        </span>

        <span className="font-medium">
          {formatHistoricalYear(endYear)}
        </span>
      </div>

      <Slider.Root
        className="relative flex h-11 w-full touch-none select-none items-center"
        role="group"
        aria-label="Year range"
        min={minimum}
        max={maximum}
        step={1}
        value={[startValue, endValue]}
        onValueChange={([from, to]) => {
          setStartInputDraft(null);
          setEndInputDraft(null);
          setStartYear(sliderValueToHistoricalYear(from));
          setEndYear(sliderValueToHistoricalYear(to));
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          if (event.button !== 0) return;
          const root = event.currentTarget;
          const rect = root.getBoundingClientRect();
          const width = Math.max(1, rect.width - 88);
          const x = event.clientX - rect.left;
          const boundary = (event.target as HTMLElement).closest<HTMLElement>("[data-boundary]")?.dataset.boundary;
          const isStart = boundary ? boundary === "start" : Math.abs(x - (22 + fromFraction * width)) <= Math.abs(x - (66 + toFraction * width));
          root.querySelector<HTMLElement>(`[data-boundary="${isStart ? "start" : "end"}"]`)!.focus({ preventScroll: true });
          // Retain the grab offset on a thumb; clicking the track moves the
          // nearest endpoint. Separate hit areas use the same year scale.
          const value = boundary ? (isStart ? startValue : endValue) : commitBoundary(isStart, Math.round(minimum + (x - (isStart ? 22 : 66)) / width * (maximum - minimum)));
          drag.current = { isStart, x: event.clientX, value, width };
          root.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          event.preventDefault();
          if (!drag.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const { isStart, x, value, width } = drag.current;
          commitBoundary(isStart, Math.round(value + (event.clientX - x) / width * (maximum - minimum)));
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
            style={{ left: `calc(${fromFraction * 100}% - ${fromFraction * 44}px)`, right: `calc(${(1 - toFraction) * 100}% - ${(1 - toFraction) * 44}px)` }}
          />
        </Slider.Track>
        {(["start", "end"] as const).map((boundary) => {
          const isStart = boundary === "start";
          const year = isStart ? startYear : endYear;
          return (
            <Slider.Thumb
              key={boundary}
              data-boundary={boundary}
              // Reserve one 44px hit area for each endpoint on the shared scale,
              // so equal years still have two separately selectable handles.
              className="group relative flex h-11 w-11 items-center justify-center bg-transparent focus-visible:outline-none"
              style={{ transform: `translateX(${isStart ? -44 * fromFraction : 44 * (1 - toFraction)}px)` }}
              aria-label={isStart ? "Start year" : "End year"}
              aria-valuemin={isStart ? minimum : startValue}
              aria-valuemax={isStart ? endValue : maximum}
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
    </div>
  );
}
