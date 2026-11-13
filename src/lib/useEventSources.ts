"use client";

import { useEffect, useState } from "react";
import { decodeEventSources, getEventSourcesPath, type EventSources } from "./sourceTransport";

const cachedSources = new Map<string, EventSources>();
const pendingSources = new Map<string, Promise<EventSources>>();

export function loadEventSources(eventId: string, revision: string): Promise<EventSources> {
  const path = getEventSourcesPath(eventId, revision);
  const cached = cachedSources.get(path);
  if (cached) return Promise.resolve(cached);

  let request = pendingSources.get(path);
  if (!request) {
    request = fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error("Source request failed");
        return response.json();
      })
      .then((data: unknown) => {
        const sources = decodeEventSources(data, eventId, revision);
        cachedSources.set(path, sources);
        return sources;
      })
      .finally(() => { pendingSources.delete(path); });
    pendingSources.set(path, request);
  }
  return request;
}

type SourceState = {
  path: string;
  status: "ready" | "error" | "loading";
  sources: string | null;
};

export function useEventSources(
  eventId: string,
  embeddedSources: string | null,
  revision?: string
) {
  const [state, setState] = useState<SourceState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const path = revision ? getEventSourcesPath(eventId, revision) : null;
  const cached = path ? cachedSources.get(path) : undefined;
  const current = path && state?.path === path ? state : null;
  const status = cached ? "ready" : current?.status ?? (path ? "loading" : "ready");
  const sources = path ? cached?.sources ?? current?.sources ?? null : embeddedSources;

  useEffect(() => {
    if (!revision || !path) return;
    let active = true;

    void loadEventSources(eventId, revision).then(
      (data) => {
        if (active) setState({ path, status: "ready", sources: data.sources });
      },
      () => {
        if (active) setState({ path, status: "error", sources: null });
      }
    );

    return () => { active = false; };
  }, [eventId, revision, path, attempt]);

  const retry = () => {
    if (!path) return;
    setState({ path, status: "loading", sources: null });
    setAttempt((value) => value + 1);
  };

  return { sources, status, retry };
}
