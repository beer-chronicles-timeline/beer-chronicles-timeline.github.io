"use client";

import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";

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

function parseHistoricalYear(value: string): number | null {
  const normalized = value.trim().toUpperCase();

  if (normalized === "") {
    return null;
  }

  const bcMatch = normalized.match(/^(\d+)\s*(BC|BCE)$/);

  if (bcMatch) {
    const year = Number.parseInt(bcMatch[1], 10);

    if (Number.isNaN(year) || year === 0) {
      return null;
    }

    return -year;
  }

  const numericYear = Number.parseInt(normalized, 10);

  if (Number.isNaN(numericYear) || numericYear === 0) {
    return null;
  }

  return numericYear;
}

export default function YearRangeSlider({
  startYear,
  endYear,
  setStartYear,
  setEndYear,
  minYear,
  maxYear,
}: Props) {
  const [startInputValue, setStartInputValue] = useState<string>(
    formatHistoricalYear(startYear)
  );

  const [endInputValue, setEndInputValue] = useState<string>(
    formatHistoricalYear(endYear)
  );

  // Sync input fields when props change through slider movement or URL state.
  useEffect(() => {
    setStartInputValue(formatHistoricalYear(startYear));
    setEndInputValue(formatHistoricalYear(endYear));
  }, [startYear, endYear]);

  const handleStartInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = event.target.value;
    setStartInputValue(raw);

    const year = parseHistoricalYear(raw);

    if (
      year !== null &&
      year >= minYear &&
      year <= endYear
    ) {
      setStartYear(year);
    }
  };

  const handleStartInputBlur = () => {
    const year = parseHistoricalYear(startInputValue);

    if (
      year === null ||
      year < minYear ||
      year > endYear
    ) {
      setStartInputValue(formatHistoricalYear(startYear));
      return;
    }

    setStartYear(year);
    setStartInputValue(formatHistoricalYear(year));
  };

  const handleEndInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = event.target.value;
    setEndInputValue(raw);

    const year = parseHistoricalYear(raw);

    if (
      year !== null &&
      year >= startYear &&
      year <= maxYear
    ) {
      setEndYear(year);
    }
  };

  const handleEndInputBlur = () => {
    const year = parseHistoricalYear(endInputValue);

    if (
      year === null ||
      year < startYear ||
      year > maxYear
    ) {
      setEndInputValue(formatHistoricalYear(endYear));
      return;
    }

    setEndYear(year);
    setEndInputValue(formatHistoricalYear(year));
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
            onChange={handleStartInputChange}
            onBlur={handleStartInputBlur}
            aria-label="Start year"
            className="w-24 px-1 py-0.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-1">
          <input
            id="endYearInput"
            type="text"
            value={endInputValue}
            onChange={handleEndInputChange}
            onBlur={handleEndInputBlur}
            aria-label="End year"
            className="w-24 px-1 py-0.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent text-right"
          />

          <span>To:</span>
        </div>
      </div>

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
        className="relative flex items-center select-none touch-none w-full h-5"
        min={minYear}
        max={maxYear}
        step={1}
        value={[startYear, endYear]}
        onValueChange={(value) => {
          setStartYear(value[0]);
          setEndYear(value[1]);
        }}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-black rounded-full h-full" />
        </Slider.Track>

        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-black rounded-full shadow hover:scale-110 transition"
          aria-label="Start year"
        />

        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-black rounded-full shadow hover:scale-110 transition"
          aria-label="End year"
        />
      </Slider.Root>
    </div>
  );
}