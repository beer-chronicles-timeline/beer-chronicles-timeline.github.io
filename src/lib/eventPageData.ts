// lib/eventPageData.ts

import { getPublicationSnapshot } from "@/lib/publicationSnapshot";
import type { TimelineEvent } from "@/lib/types";

export type EventStaticParamSource = {
  id: string;
  title: string;
  created_at: string | null;
  updated_at?: string | null;
};

export type EventPageData = {
  event: TimelineEvent;
  events: TimelineEvent[];
};

export async function getEventPageData(
  eventId: string
): Promise<EventPageData | null> {
  const dataset = getPublicationSnapshot();
  const event = dataset.events.find((event) => event.id === eventId);

  if (!event) {
    return null;
  }

  return {
    event,
    events: dataset.events,
  };
}

export async function getEventStaticParamSources(): Promise<
  EventStaticParamSource[]
> {
  const dataset = getPublicationSnapshot();

  return dataset.events.map((event) => ({
    id: event.id,
    title: event.title,
    created_at: event.created_at,
    updated_at: event.updated_at,
  }));
}
