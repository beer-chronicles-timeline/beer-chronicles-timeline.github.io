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
      case "Laws": return "bg-red-100 text-red-800";
      case "Breweries": return "bg-yellow-100 text-yellow-800";
      case "Events": return "bg-blue-100 text-blue-800";
      case "People": return "bg-purple-100 text-purple-800";
      case "Science": return "bg-green-100 text-green-800";
      case "Styles": return "bg-orange-100 text-orange-800";
      case "Community": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  const preview = truncate(event.description, 170);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 shadow-md rounded-lg p-3.5 max-w-sm w-full cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-lg"
    >
      <p className="text-[13px] leading-snug text-gray-500">{formatEventDate(event)}</p>

      {event.category && (
        <div className="mt-1.5 md:hidden">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${getCategoryStyle(event.category)}`}>
            {event.category}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mt-1">
        <h2 className="text-base leading-tight font-semibold font-serif text-stone-900 break-words hyphens-auto">
          {event.title}
        </h2>

        {event.category && (
          <span className={`hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full font-sans whitespace-nowrap ${getCategoryStyle(event.category)}`}>
            {event.category}
          </span>
        )}
      </div>

      {preview && (
        <p className="text-[13px] leading-snug text-gray-600 mt-1 break-words hyphens-auto">
          {preview}
        </p>
      )}
    </div>
  );
}