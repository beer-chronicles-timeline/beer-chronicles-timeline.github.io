import { parseSourceCitations, normalizeSourceUrl } from "../src/lib/sourceCitations.ts";

export type LinkStatus =
  | "working"
  | "redirected"
  | "missing"
  | "blocked"
  | "rate-limited"
  | "transient-error"
  | "network-error"
  | "needs-review";

export type SourceReference = {
  eventId: string;
  eventTitle: string;
};

export type SourceLink = {
  url: string;
  references: SourceReference[];
};

export type LinkResult = SourceLink & {
  status: LinkStatus;
  httpStatus: number | null;
  finalUrl: string | null;
  detail: string | null;
};

type SourceEvent = {
  id: string;
  title: string;
  sources?: string | null;
};

export function collectSourceLinks(events: SourceEvent[]): SourceLink[] {
  const links = new Map<string, SourceReference[]>();

  for (const event of events) {
    for (const citation of parseSourceCitations(event.sources)) {
      for (const rawUrl of citation.urls) {
        const normalizedUrl = normalizeSourceUrl(rawUrl);

        try {
          const parsedUrl = new URL(normalizedUrl);
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            continue;
          }
        } catch {
          continue;
        }

        const references = links.get(normalizedUrl) ?? [];
        if (!references.some((reference) => reference.eventId === event.id)) {
          references.push({ eventId: event.id, eventTitle: event.title });
        }
        links.set(normalizedUrl, references);
      }
    }
  }

  return [...links.entries()]
    .map(([url, references]) => ({ url, references }))
    .sort((left, right) => left.url.localeCompare(right.url));
}

export function classifyHttpStatus(
  status: number,
  redirected: boolean
): LinkStatus {
  if (status >= 200 && status < 400) {
    return redirected ? "redirected" : "working";
  }

  if (status === 404 || status === 410) return "missing";
  if (status === 401 || status === 403) return "blocked";
  if (status === 429) return "rate-limited";
  if (status === 408 || status === 425 || status >= 500) {
    return "transient-error";
  }

  return "needs-review";
}

export async function checkSourceLink(
  link: SourceLink,
  timeoutMs: number
): Promise<LinkResult> {
  try {
    const response = await fetch(link.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        Range: "bytes=0-0",
        "User-Agent":
          "BeerChronicles-SourceLinkAudit/1.0 (+https://beer-chronicles.org/)",
      },
    });

    await response.body?.cancel();

    return {
      ...link,
      status: classifyHttpStatus(response.status, response.redirected),
      httpStatus: response.status,
      finalUrl: response.url === link.url ? null : response.url,
      detail: null,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return {
      ...link,
      status: timedOut ? "transient-error" : "network-error",
      httpStatus: null,
      finalUrl: null,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkSourceLinks(
  links: SourceLink[],
  options: { concurrency: number; timeoutMs: number }
): Promise<LinkResult[]> {
  const results = new Array<LinkResult>(links.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= links.length) return;
      results[index] = await checkSourceLink(links[index], options.timeoutMs);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(options.concurrency, links.length) },
      () => worker()
    )
  );

  return results;
}
