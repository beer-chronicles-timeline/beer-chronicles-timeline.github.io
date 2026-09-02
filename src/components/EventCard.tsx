// components/EventCard.tsx
import type { TimelineEvent } from "@/lib/types";
import { formatEventDate, truncate } from "./timelineUtils";

type EventCardProps = {
  event: TimelineEvent;
  onClick: () => void;
};

export default function EventCard({ event, onClick }: EventCardProps) {
  function getCategoryStyle(category: string | null | undefined) {
    switch (category) {
      case "Laws":
        return "bg-red-100 text-red-800";
      case "Breweries":
        return "bg-yellow-100 text-yellow-800";
      case "Events":
        return "bg-blue-100 text-blue-800";
      case "People":
        return "bg-purple-100 text-purple-800";
      case "Science":
        return "bg-green-100 text-green-800";
      case "Styles":
        return "bg-orange-100 text-orange-800";
      case "Community":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const preview = truncate(event.description, 170);

  const isMilestone =
    event.tags?.some((tag) => tag.name === "Milestone") ?? false;

  const cardClasses = isMilestone
    ? "bg-amber-50/40 border border-amber-200 shadow-md hover:bg-amber-50/70 hover:shadow-lg"
    : "bg-white border border-stone-200 shadow-md hover:bg-gray-50 hover:shadow-lg";

  return (
    <div
      className={`${cardClasses} relative block max-w-sm w-full cursor-pointer rounded-lg p-3.5 text-left transition-all duration-150 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug text-stone-500">
          {formatEventDate(event)}
        </p>

        {isMilestone && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Milestone
          </span>
        )}
      </div>

      {event.category && (
        <div className="mt-1.5 md:hidden">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${getCategoryStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>
      )}

      <div className="mt-1.5 flex items-start justify-between gap-2">
        <h2 className="break-words font-serif text-[17px] font-semibold leading-tight text-stone-900 hyphens-auto md:text-lg">
          {event.title}
        </h2>

        {event.category && (
          <span
            className={`hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full font-sans whitespace-nowrap ${getCategoryStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        )}
      </div>

      {preview && (
        <p className="mt-2 break-words text-[13px] leading-relaxed text-gray-600 hyphens-auto">
          {preview}
        </p>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={`Open event: ${event.title}`}
        className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
      />
    </div>
  );
}
