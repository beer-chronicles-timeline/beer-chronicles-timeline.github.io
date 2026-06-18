"use client";

import * as Slider from "@radix-ui/react-slider";
import { useState, useEffect } from "react";

type Props = {
  startYear: number;
  endYear: number;
  setStartYear: (value: number) => void;
  setEndYear: (value: number) => void;
  minYear: number;
  maxYear: number;
};

export default function YearRangeSlider({
  startYear,
  endYear,
  setStartYear,
  setEndYear,
  minYear,
  maxYear,
}: Props) {
  const [startInputValue, setStartInputValue] = useState<string>(String(startYear));
  const [endInputValue, setEndInputValue] = useState<string>(String(endYear));

  // Sync input fields when props change (slider drag or external updates)
  useEffect(() => {
    setStartInputValue(String(startYear));
    setEndInputValue(String(endYear));
  }, [startYear, endYear]);

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setStartInputValue(raw);
    
    // Only update the actual year if the value is valid
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= minYear && num <= endYear) {
      setStartYear(num);
    }
  };

  const handleStartInputBlur = () => {
    // On blur, reset to valid value if invalid
    const num = parseInt(startInputValue, 10);
    if (isNaN(num) || num < minYear) {
      setStartInputValue(String(startYear));
    } else if (num > endYear) {
      setStartInputValue(String(endYear));
    }
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setEndInputValue(raw);
    
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= startYear && num <= maxYear) {
      setEndYear(num);
    }
  };

  const handleEndInputBlur = () => {
    const num = parseInt(endInputValue, 10);
    if (isNaN(num) || num > maxYear) {
      setEndInputValue(String(endYear));
    } else if (num < startYear) {
      setEndInputValue(String(startYear));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-2 px-4 md:px-0">
      {/* Labels + Input fields on the same row */}
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <div className="flex items-center gap-1">
          <span>From:</span>
          <input
            id="startYearInput"
            type="text"
            inputMode="numeric"
            value={startInputValue}
            onChange={handleStartInputChange}
            onBlur={handleStartInputBlur}
            className="w-12 px-1 py-0.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1">
          <input
            id="endYearInput"
            type="text"
            inputMode="numeric"
            value={endInputValue}
            onChange={handleEndInputChange}
            onBlur={handleEndInputBlur}
            className="w-12 px-1 py-0.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
          <span>To:</span>
        </div>
      </div>

      {/* Year display below the labels/inputs */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">{startYear}</span>
        <span className="font-medium">{endYear}</span>
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

        <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-black rounded-full shadow hover:scale-110 transition" />
        <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-black rounded-full shadow hover:scale-110 transition" />
      </Slider.Root>
    </div>
  );
}