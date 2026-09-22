import Link from "next/link";
import type { ConnectedEvent } from "@/lib/eventConnections";
import type { TimelineEvent } from "@/lib/types";
import { getEventPath } from "@/lib/eventUrls";
import { formatEventDate } from "./timelineUtils";

type ConnectedHistoryProps = {
  connections: ConnectedEvent[];
  onOpenEvent?: (event: TimelineEvent) => void;
};

export default function ConnectedHistory({
  connections,
  onOpenEvent,
}: ConnectedHistoryProps) {
  if (connections.length === 0) return null;

  const Heading = onOpenEvent ? "h3" : "h2";
  const cardClassName = onOpenEvent
    ? "block min-h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
    : "block rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2";

  return (
    <section
      aria-labelledby="connected-history-heading"
      className={onOpenEvent ? "mt-4 border-t pt-3" : "mt-8 border-t border-stone-300 pt-6"}
    >
      <Heading
        id="connected-history-heading"
        className={onOpenEvent ? "text-sm font-semibold text-stone-800" : "font-serif text-xl font-semibold text-stone-900"}
      >
        Connected history
      </Heading>

      <div className={onOpenEvent ? "mt-3 space-y-2" : "mt-4 space-y-3"}>
        {connections.map(({ event, label }) => {
          const content = (
            <>
              <div className="text-xs font-medium text-stone-600">{label}</div>
              <div className="mt-1 text-xs text-stone-500">{formatEventDate(event)}</div>
              <div className={`mt-1 font-serif font-semibold text-stone-900 ${onOpenEvent ? "text-sm" : "text-base"}`}>
                {event.title}
              </div>
            </>
          );

          return onOpenEvent ? (
            <button
              key={event.id}
              type="button"
              onClick={() => onOpenEvent(event)}
              className={cardClassName}
            >
              {content}
            </button>
          ) : (
            <Link
              key={event.id}
              href={getEventPath(event.id, event.title)}
              className={cardClassName}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
