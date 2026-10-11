import { parseSourceCitations, normalizeSourceUrl } from "../src/lib/sourceCitations.ts";
import { setTimeout as delay } from "node:timers/promises";
import { parseAuditHtml, type HtmlAuditData } from "./link-audit-html.ts";

export type LinkStatus =
  | "working"
  | "redirected"
  | "missing"
  | "missing-fragment"
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
  pageReferences?: { pageUrl: string; href: string }[];
};

export type LinkResult = SourceLink & {
  status: LinkStatus;
  httpStatus: number | null;
  finalUrl: string | null;
  detail: string | null;
  attempts: number;
  contentType: string | null;
  bodyTruncated: boolean;
  fragmentStatus: "not-applicable" | "valid" | "missing" | "unverified";
};

export type SourceEvent = {
  id: string;
  title: string;
  sources?: string | null;
};

export function collectSourceLinks(
  events: SourceEvent[],
  onInvalid?: (url: string, reference: SourceReference) => void
): SourceLink[] {
  const links = new Map<string, SourceReference[]>();

  for (const event of events) {
    const invalidUrls = new Set<string>();
    const invalid = (url: string) => {
      if (!invalidUrls.has(url)) onInvalid?.(url, { eventId: event.id, eventTitle: event.title });
      invalidUrls.add(url);
    };
    for (const citation of parseSourceCitations(event.sources)) {
      for (const rawUrl of citation.urls) {
        const normalizedUrl = normalizeSourceUrl(rawUrl);

        try {
          const parsedUrl = new URL(normalizedUrl);
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            invalid(rawUrl);
            continue;
          }
          if (parsedUrl.username || parsedUrl.password) throw new Error("Credentials in URL");
        } catch {
          invalid(rawUrl);
          continue;
        }

        const references = links.get(normalizedUrl) ?? [];
        if (!references.some((reference) => reference.eventId === event.id)) {
          references.push({ eventId: event.id, eventTitle: event.title });
        }
        links.set(normalizedUrl, references);
      }
    }
    // Incomplete prefixes are not extracted by the UI's citation URL regex.
    for (const match of (event.sources ?? "").matchAll(/\bhttps?:\/\/(?=$|[\s<>"'])/gi)) invalid(match[0]);
  }

  return [...links.entries()]
    .map(([url, references]) => ({ url, references }))
    .sort((left, right) => left.url.localeCompare(right.url));
}

export function classifyHttpStatus(
  status: number,
  redirected: boolean
): LinkStatus {
  if (status >= 200 && status < 300) {
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

export type AuditDocument = {
  requestedUrl: string;
  finalUrl: string;
  redirected: boolean;
  status: LinkStatus;
  httpStatus: number | null;
  attempts: number;
  contentType: string | null;
  bodyTruncated: boolean;
  html: HtmlAuditData | null;
  text: string | null;
  warnings: string[];
  detail: string | null;
};

export type CheckerOptions = {
  timeoutMs?: number;
  retries?: number;
  minHostIntervalMs?: number;
  siteOrigin?: string;
  maxBodyBytes?: number;
  maxPageBytes?: number;
  signal?: AbortSignal;
  fetchPage?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

export function requestUrl(rawUrl: string, siteOrigin?: string): string {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Unsupported URL or embedded credentials");
  url.hash = "";
  // Beer Chronicles is a static export. Query state changes the client view,
  // not the served document. Preserve queries for all external sources.
  if (url.origin === siteOrigin) url.search = "";
  return url.href;
}

async function readBoundedBody(response: Response, limit: number) {
  const reader = response.body?.getReader();
  if (!reader) return { bytes: Buffer.alloc(0), truncated: false };
  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const remaining = limit + 1 - size;
      chunks.push(value.subarray(0, remaining));
      size += Math.min(value.length, remaining);
      if (size > limit) { truncated = true; break; }
    }
  } finally {
    await reader.cancel();
  }
  return { bytes: Buffer.concat(chunks, size).subarray(0, limit), truncated };
}

const missingPage = /^(?:(?:error\s*)?404\b|page\s+(?:not\s+found|unavailable|does\s+not\s+exist)|not\s+found\b|this\s+page\s+(?:could\s+not\s+be\s+found|doesn['’]t\s+exist)|seite\s+(?:nicht\s+gefunden|existiert\s+nicht)|pagina\s+non\s+trovata)/i;
const challengePage = /^(?:just\s+a\s+moment|attention\s+required|access\s+denied|verify\s+(?:you\s+are|that\s+you)|checking\s+your\s+browser|security\s+(?:check|verification)|robot\s+check|captcha)\b/i;
const loginPage = /^(?:sign\s+in|log\s*in|anmelden)(?:\s*$|\s*[-|:])/i;

function contentWarnings(url: string, contentType: string, bytes: Buffer, html: HtmlAuditData | null): string[] {
  const warnings: string[] = [];
  if (!bytes.length) warnings.push("Successful response has an empty body.");
  if ((/\.pdf$/i.test(new URL(url).pathname) || contentType.includes("application/pdf")) &&
      !/%PDF-\d\.\d/.test(bytes.subarray(0, 1024).toString("latin1"))) {
    warnings.push("Expected PDF but the response has no PDF header.");
  }
  if (html) {
    if ([html.title, html.heading].some((text) => missingPage.test(text))) warnings.push("Possible error page returned with a successful HTTP status.");
    if ([html.title, html.heading].some((text) => challengePage.test(text))) warnings.push("Automated-client challenge or access-denied page returned with a successful HTTP status.");
    if ([html.title, html.heading].some((text) => loginPage.test(text))) warnings.push("Possible login barrier; source availability requires manual review.");
  } else if (contentType.startsWith("text/") && missingPage.test(bytes.subarray(0, 256).toString("utf8").trim())) {
    warnings.push("Possible error message returned with a successful HTTP status.");
  }
  return warnings;
}

function homepageRedirect(from: string, to: string): boolean {
  const oldUrl = new URL(from), newUrl = new URL(to);
  const isRoot = (path: string) => /^\/(?:[a-z]{2}(?:[-_][a-z]{2})?\/?)?$/i.test(path);
  return !isRoot(oldUrl.pathname) && isRoot(newUrl.pathname) && !newUrl.search;
}

export function createLinkChecker(options: CheckerOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retries = options.retries ?? 2;
  const interval = options.minHostIntervalMs ?? 250;
  const fetchPage = options.fetchPage ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => delay(ms, undefined, { signal: options.signal }));
  const queues = new Map<string, Promise<void>>();
  const nextStart = new Map<string, number>();
  const documents = new Map<string, Promise<AuditDocument>>();
  let requests = 0;

  async function onHost<T>(url: string, action: () => Promise<T>): Promise<T> {
    const host = new URL(url).host;
    const previous = queues.get(host) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    queues.set(host, previous.then(() => gate));
    await previous;
    try {
      options.signal?.throwIfAborted();
      const wait = Math.max(0, (nextStart.get(host) ?? 0) - Date.now());
      if (wait) await sleep(wait);
      options.signal?.throwIfAborted();
      nextStart.set(host, Date.now() + interval);
      return await action();
    } finally { release(); }
  }

  async function readDocument(url: string, maxBytes: number, keepText = false): Promise<AuditDocument> {
    let result: AuditDocument = {
      requestedUrl: url, finalUrl: url, redirected: false, status: "network-error",
      httpStatus: null, attempts: 0, contentType: null, bodyTruncated: false,
      html: null, text: null, warnings: [], detail: null,
    };
    for (let attempt = 0; attempt <= retries; attempt++) {
      let retryAfter = 0;
      let current = url;
      const visited = new Set<string>();
      try {
        for (let redirects = 0; ; redirects++) {
          if (redirects > 10 || visited.has(current)) throw new Error("Redirect loop or more than 10 redirects");
          visited.add(current);
          result = await onHost(current, async () => {
            const signal = options.signal
              ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
              : AbortSignal.timeout(timeoutMs);
            requests++;
            const response = await fetchPage(requestUrl(current), {
              method: "GET", redirect: "manual", signal,
              headers: {
                Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
                "User-Agent": "BeerChronicles-SourceLinkAudit/2.0 (+https://beer-chronicles.org/)",
                "Cache-Control": "no-cache",
              },
            });
            const location = response.headers.get("location");
            if ([301, 302, 303, 307, 308].includes(response.status) && location) {
              await response.body?.cancel();
              const destination = new URL(location, current);
              requestUrl(destination.href); // reject credentials and non-HTTP redirects
              return { ...result, finalUrl: destination.href, httpStatus: response.status, redirected: true, status: "redirected" as const };
            }
            const after = response.headers.get("retry-after");
            if (after) retryAfter = /^\d+$/.test(after) ? Number(after) * 1000 : Math.max(0, Date.parse(after) - Date.now());
            const body = await readBoundedBody(response, maxBytes);
            const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
            const charset = contentType.match(/charset\s*=\s*["']?([\w-]+)/)?.[1] ?? "utf-8";
            let text: string;
            try { text = new TextDecoder(charset).decode(body.bytes); }
            catch { text = body.bytes.toString("utf8"); }
            const isHtml = /(?:text\/html|application\/xhtml\+xml)/.test(contentType) || /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(text);
            const html = isHtml ? parseAuditHtml(text) : null;
            const status = classifyHttpStatus(response.status, redirects > 0);
            const warnings = response.ok ? contentWarnings(url, contentType, body.bytes, html) : [];
            if (response.ok && redirects > 0 && homepageRedirect(url, current)) warnings.push("Specific page redirects to a homepage or language homepage; verify the cited content still exists.");
            return {
              requestedUrl: url, finalUrl: current, redirected: redirects > 0,
              status: warnings.length ? "needs-review" : status,
              httpStatus: response.status, attempts: attempt + 1, contentType: contentType || null,
              bodyTruncated: body.truncated, html, text: keepText ? text : null,
              warnings, detail: warnings.join(" ") || null,
            };
          });
          if ([301, 302, 303, 307, 308].includes(result.httpStatus ?? 0) && result.status === "redirected") {
            current = result.finalUrl;
            continue;
          }
          break;
        }
      } catch (error) {
        const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
        result = {
          ...result, requestedUrl: url, finalUrl: current, redirected: current !== url,
          status: timedOut ? "transient-error" : "network-error", httpStatus: null,
          attempts: attempt + 1, html: null, text: null, warnings: [],
          detail: error instanceof Error ? `${error.message}${error.cause instanceof Error ? ` (${error.cause.message})` : ""}` : String(error),
        };
      }
      if (!["rate-limited", "transient-error", "network-error"].includes(result.status) || attempt === retries || options.signal?.aborted) break;
      // Respect Retry-After without waiting indefinitely or retrying prematurely.
      if (retryAfter > 30_000) { result.detail = `Retry-After exceeds the 30-second retry budget (${Math.ceil(retryAfter / 1000)}s); left unresolved.`; break; }
      try { await sleep(Math.max(Number.isFinite(retryAfter) ? retryAfter : 0, 1000 * 2 ** attempt)); }
      catch { result.detail = "Audit cancelled or deadline reached during retry backoff."; break; }
    }
    return result;
  }

  function document(rawUrl: string): Promise<AuditDocument> {
    const key = requestUrl(rawUrl, options.siteOrigin);
    if (!documents.has(key)) {
      const internal = new URL(key).origin === options.siteOrigin;
      documents.set(key, readDocument(key, internal ? options.maxPageBytes ?? 4 * 1024 * 1024 : options.maxBodyBytes ?? 512 * 1024));
    }
    return documents.get(key)!;
  }

  async function check(link: SourceLink): Promise<LinkResult> {
    const doc = await document(link.url);
    let status = doc.status;
    let fragmentStatus: LinkResult["fragmentStatus"] = "not-applicable";
    const details = doc.detail ? [doc.detail] : [];
    const target = new URL(doc.finalUrl);
    const hash = target.hash || new URL(link.url).hash;
    if (hash && doc.httpStatus !== null && doc.httpStatus >= 200 && doc.httpStatus < 300) {
      fragmentStatus = "unverified";
      let fragment: string | null = null;
      try { fragment = decodeURIComponent(hash.slice(1).split(":~:")[0]); }
      catch { details.push("Malformed percent encoding in fragment."); }
      if (fragment !== null && doc.html && !doc.warnings.length) {
        if (fragment && (doc.html.ids.has(fragment) || fragment.toLowerCase() === "top")) fragmentStatus = "valid";
        else if (!fragment && !hash.includes(":~:")) fragmentStatus = "valid";
        else if (!doc.bodyTruncated && fragment && ![...doc.html.ids].some((id) => /&[a-z][\da-z]+;/i.test(id))) {
          status = target.origin === options.siteOrigin ? "missing-fragment" : "needs-review";
          fragmentStatus = "missing";
          details.push(`Fragment target #${fragment} is absent from the complete returned HTML.`);
          if (target.origin !== options.siteOrigin) details.push("External JavaScript may create the target; verify manually.");
        }
      }
      if (hash.includes(":~:")) {
        if (fragmentStatus !== "missing") fragmentStatus = "unverified";
        details.push("Browser text-fragment matching is not verified by this HTTP audit.");
      }
      if (fragmentStatus === "unverified") {
        if (["working", "redirected"].includes(status)) status = "needs-review";
        details.push("Fragment could not be verified (non-HTML response, truncated body, unsupported entity, or access barrier).");
      }
    }
    return {
      ...link, status, httpStatus: doc.httpStatus,
      finalUrl: doc.redirected ? doc.finalUrl : null,
      detail: details.join(" ") || null, attempts: doc.attempts,
      contentType: doc.contentType, bodyTruncated: doc.bodyTruncated, fragmentStatus,
    };
  }

  return { document, check, readResource: (url: string, maxBytes = 8 * 1024 * 1024) => readDocument(url, maxBytes, true),
    requestCount: () => requests, documentCount: () => documents.size };
}

export async function checkSourceLink(link: SourceLink, timeoutMs: number, options: CheckerOptions = {}): Promise<LinkResult> {
  return createLinkChecker({ ...options, timeoutMs }).check(link);
}

export async function checkSourceLinks(
  links: SourceLink[],
  options: CheckerOptions & { concurrency: number; timeoutMs: number }
): Promise<LinkResult[]> {
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) throw new Error("Concurrency must be a positive integer.");
  const checker = createLinkChecker(options);
  const results = new Array<LinkResult>(links.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= links.length) return;
      results[index] = await checker.check(links[index]);
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
