"use client";

import * as Slider from "@radix-ui/react-slider";

type Props = {
  startYear: number;
  endYear: number;
  setStartYear: (value: number) => void;
  setEndYear: (value: number) => void;
};

export default function YearRangeSlider({
  startYear,
  endYear,
  setStartYear,
  setEndYear,
}: Props) {
  return (
    <div className="w-full max-w-xl mx-auto mb-10">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{startYear}</span>
        <span>{endYear}</span>
      </div>

      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        min={1300}
        max={2026}
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
