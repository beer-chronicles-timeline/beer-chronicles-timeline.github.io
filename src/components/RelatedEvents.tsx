// components/RelatedEvents.tsx
import type { TimelineEvent } from "@/lib/types";
import { formatEventDate, truncate } from "./timelineUtils";

type RelatedEventsProps = {
  relatedEvents: TimelineEvent[];
  onOpenRelatedEvent: (event: TimelineEvent) => void;
};

export default function RelatedEvents({
  relatedEvents,
  onOpenRelatedEvent,
}: RelatedEventsProps) {
  if (relatedEvents.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t">
      <h3 className="text-sm font-semibold text-stone-800">
        Continue Exploring
      </h3>

      <p className="text-xs text-gray-500 mt-1 mb-3">
        Based on shared topics.
      </p>

      <div className="space-y-2">
        {relatedEvents.map((relatedEvent) => (
          <button
            key={relatedEvent.id}
            type="button"
            onClick={() => onOpenRelatedEvent(relatedEvent)}
            className="block w-full text-left rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 hover:bg-stone-100 transition"
          >
            <div className="text-xs text-gray-500">
              {formatEventDate(relatedEvent)}
            </div>

            <div className="text-sm font-semibold font-serif text-stone-900 mt-0.5">
              {relatedEvent.title}
            </div>

            {relatedEvent.description && (
              <div className="text-xs text-gray-600 mt-1">
                {truncate(relatedEvent.description, 100)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}