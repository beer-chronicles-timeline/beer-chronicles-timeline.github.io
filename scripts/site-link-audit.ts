import { decodeCloudflareEmail, parseSitemap } from "./link-audit-html.ts";
import {
  collectSourceLinks, createLinkChecker, requestUrl,
  type CheckerOptions, type LinkResult, type SourceEvent, type SourceLink,
} from "./source-link-audit.ts";

export type PublicationMarker = { commit: string; mode: "live"; eventCount: number; generatedAt: string };
export type InventoryFinding = { url: string; referencedBy: string; detail: string };
export type AuditCoverage = {
  complete: boolean;
  errors: string[];
  publication: PublicationMarker | null;
  eventCount: number;
  eventsWithSourceUrls: number;
  sourceUrls: number;
  sourceReferences: number;
  sitemapPages: number;
  discoveredPages: number;
  crawledPages: number;
  failedPages: string[];
  discoveredUrls: number;
  checkedUrls: number;
  checkedDocuments: number;
  httpRequests: number;
  limited: boolean;
  inventoryFindings: InventoryFinding[];
  skippedSchemes: Record<string, number>;
};
export type PublishedAudit = {
  schemaVersion: 2;
  generatedAt: string;
  siteUrl: string;
  dataUrl: string;
  sitemapUrl: string;
  coverage: AuditCoverage;
  results: LinkResult[];
  reviewSummary?: import("./source-link-review.ts").ReviewSummary;
};
export type SiteAuditOptions = CheckerOptions & {
  siteUrl: string;
  dataUrl?: string;
  sitemapUrl?: string;
  concurrency?: number;
  maxUrls?: number;
  maxPages?: number;
  deadlineMs?: number;
  onProgress?: (message: string) => void;
};

export function validatePublication(value: unknown): PublicationMarker {
  if (!value || typeof value !== "object") throw new Error("Invalid publication marker.");
  const marker = value as PublicationMarker;
  if (marker.mode !== "live" || typeof marker.commit !== "string" || !/^[a-f0-9]{40}$/.test(marker.commit) ||
      !Number.isInteger(marker.eventCount) || marker.eventCount < 1 || typeof marker.generatedAt !== "string" || !Number.isFinite(Date.parse(marker.generatedAt))) {
    throw new Error("Invalid or non-live publication marker.");
  }
  return { commit: marker.commit, mode: marker.mode, eventCount: marker.eventCount, generatedAt: marker.generatedAt };
}

export function validateSourceEvents(value: unknown, expectedCount: number): SourceEvent[] {
  if (!value || typeof value !== "object" || !("events" in value) || !Array.isArray(value.events)) throw new Error("Timeline payload has no events array.");
  const ids = new Set<string>();
  for (const event of value.events) {
    if (!event || typeof event !== "object" || typeof event.id !== "string" || !event.id.trim() ||
        typeof event.title !== "string" || !event.title.trim() ||
        (event.sources != null && typeof event.sources !== "string") || ids.has(event.id)) {
      throw new Error("Timeline contains malformed or duplicate event/source records.");
    }
    ids.add(event.id);
  }
  if (value.events.length !== expectedCount) throw new Error(`Timeline has ${value.events.length} events; publication marker expects ${expectedCount}.`);
  return value.events;
}

export async function mapConcurrent<T, R>(items: T[], concurrency: number, task: (item: T) => Promise<R>): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("Concurrency must be a positive integer.");
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }));
  return results;
}

function isHtmlRoute(url: string): boolean {
  const path = new URL(url).pathname;
  return /\.html?$/i.test(path) || !/\.[\da-z]{1,10}$/i.test(path.split("/").at(-1) ?? "");
}

export async function auditPublishedSite(options: SiteAuditOptions): Promise<PublishedAudit> {
  const site = new URL(options.siteUrl);
  const origin = site.origin;
  const dataUrl = options.dataUrl ?? new URL("/timeline-data.json", origin).href;
  const sitemapUrl = options.sitemapUrl ?? new URL("/sitemap.xml", origin).href;
  const markerUrl = new URL("/publication-status.json", origin).href;
  const concurrency = options.concurrency ?? 8;
  for (const [name, number] of Object.entries({ concurrency, timeoutMs: options.timeoutMs ?? 15_000,
    retries: options.retries ?? 2, minHostIntervalMs: options.minHostIntervalMs ?? 250,
    maxUrls: options.maxUrls ?? 0, maxPages: options.maxPages ?? 0, deadlineMs: options.deadlineMs ?? 22 * 60_000,
    maxBodyBytes: options.maxBodyBytes ?? 512 * 1024, maxPageBytes: options.maxPageBytes ?? 4 * 1024 * 1024 })) {
    const zeroAllowed = ["retries", "minHostIntervalMs", "maxUrls", "maxPages"].includes(name);
    if (!Number.isInteger(number) || number < (zeroAllowed ? 0 : 1)) throw new Error(`${name} has an invalid value.`);
  }
  if ([dataUrl, sitemapUrl].some((url) => new URL(url).origin !== origin)) throw new Error("Audit inputs must belong to the published site origin.");
  requestUrl(site.href);
  const deadline = AbortSignal.timeout(options.deadlineMs ?? 22 * 60_000);
  const signal = options.signal ? AbortSignal.any([deadline, options.signal]) : deadline;
  const checker = createLinkChecker({ ...options, siteOrigin: origin, signal });
  const coverage: AuditCoverage = {
    complete: false, errors: [], publication: null, eventCount: 0, eventsWithSourceUrls: 0,
    sourceUrls: 0, sourceReferences: 0, sitemapPages: 0, discoveredPages: 0, crawledPages: 0,
    failedPages: [], discoveredUrls: 0, checkedUrls: 0, checkedDocuments: 0, httpRequests: 0,
    limited: false, inventoryFindings: [], skippedSchemes: {},
  };
  const links = new Map<string, SourceLink>();
  const pages = new Set<string>();
  const queue: string[] = [];
  let results: LinkResult[] = [];
  const noteError = (error: unknown) => coverage.errors.push(error instanceof Error ? error.message : String(error));
  const addLink = (link: SourceLink) => {
    const existing = links.get(link.url);
    if (!existing) { links.set(link.url, link); return; }
    for (const reference of link.references) {
      if (!existing.references.some((item) => item.eventId === reference.eventId)) existing.references.push(reference);
    }
    for (const reference of link.pageReferences ?? []) {
      existing.pageReferences ??= [];
      if (!existing.pageReferences.some((item) => item.pageUrl === reference.pageUrl && item.href === reference.href)) existing.pageReferences.push(reference);
    }
  };
  const enqueue = (url: string) => {
    const key = requestUrl(url, origin);
    if (!pages.has(key)) { pages.add(key); queue.push(key); }
  };
  const resourceText = async (url: string) => {
    const doc = await checker.readResource(url);
    if (doc.httpStatus === null || doc.httpStatus < 200 || doc.httpStatus >= 300 || doc.bodyTruncated || !doc.text || doc.warnings.length) {
      throw new Error(`Could not read complete audit input ${url}: ${doc.detail ?? `HTTP ${doc.httpStatus}`}.`);
    }
    return doc.text;
  };
  try {
    coverage.publication = validatePublication(JSON.parse(await resourceText(markerUrl)));
    const events = validateSourceEvents(JSON.parse(await resourceText(dataUrl)), coverage.publication.eventCount);
    coverage.eventCount = events.length;
    const sources = collectSourceLinks(events, (url, reference) => coverage.inventoryFindings.push({
      url, referencedBy: reference.eventTitle, detail: "Invalid, non-HTTP, or credential-bearing source URL; not requested.",
    }));
    coverage.sourceUrls = sources.length;
    coverage.sourceReferences = sources.reduce((total, link) => total + link.references.length, 0);
    coverage.eventsWithSourceUrls = new Set(sources.flatMap((link) => link.references.map((reference) => reference.eventId))).size;
    if (!sources.length) throw new Error("Published timeline contains no auditable source URLs.");
    sources.forEach(addLink);

    const pendingSitemaps = [sitemapUrl], seenSitemaps = new Set<string>(), sitemapPages = new Set<string>();
    while (pendingSitemaps.length) {
      const current = pendingSitemaps.shift()!;
      if (seenSitemaps.has(current)) continue;
      if (seenSitemaps.size >= 100) throw new Error("Sitemap index exceeds the 100-sitemap safety limit; coverage is incomplete.");
      seenSitemaps.add(current);
      const sitemap = parseSitemap(await resourceText(current));
      for (const rawUrl of sitemap.urls) {
        const url = new URL(rawUrl);
        requestUrl(url.href);
        if (url.origin !== origin || url.hash || url.search) throw new Error(`Unexpected URL in published sitemap: ${rawUrl}`);
        if (sitemap.index) pendingSitemaps.push(url.href);
        else {
          sitemapPages.add(requestUrl(url.href, origin));
          addLink({ url: url.href, references: [], pageReferences: [{ pageUrl: current, href: rawUrl }] });
          enqueue(url.href);
        }
      }
    }
    coverage.sitemapPages = sitemapPages.size;
    const eventIds = new Set([...sitemapPages].filter((url) => new URL(url).pathname.startsWith("/events/"))
      .map((url) => decodeURIComponent(new URL(url).pathname.split("/")[2])));
    if (eventIds.size !== events.length || events.some((event) => !eventIds.has(event.id))) {
      throw new Error("Sitemap entry IDs do not match the complete published timeline.");
    }
    enqueue(new URL("/", origin).href);
    while (queue.length) {
      const remaining = options.maxPages ? options.maxPages - coverage.crawledPages : queue.length;
      if (remaining <= 0) { coverage.limited = true; noteError("Page limit reached; published-page crawl is incomplete."); break; }
      const batch = queue.splice(0, Math.min(concurrency, remaining));
      await mapConcurrent(batch, concurrency, async (pageUrl) => {
        const doc = await checker.document(pageUrl);
        coverage.crawledPages++;
        if (!doc.html || doc.bodyTruncated || doc.warnings.length || doc.httpStatus === null || doc.httpStatus < 200 || doc.httpStatus >= 300 || new URL(doc.finalUrl).origin !== origin) {
          coverage.failedPages.push(pageUrl);
          noteError(`Could not fully crawl ${pageUrl}: ${doc.detail ?? (doc.bodyTruncated ? "body limit reached" : `HTTP ${doc.httpStatus}, HTML=${Boolean(doc.html)}`)}.`);
        }
        if (!doc.html) return;
        const expectedIdentity = `${coverage.publication!.commit}:${coverage.publication!.generatedAt}`;
        if (doc.html.publicationId !== expectedIdentity) noteError(`Publication identity differs on ${pageUrl}; expected ${expectedIdentity}.`);
        let base = doc.finalUrl;
        if (doc.html.baseHref !== null) {
          try { base = new URL(doc.html.baseHref, base).href; }
          catch { coverage.inventoryFindings.push({ url: doc.html.baseHref, referencedBy: pageUrl, detail: "Invalid HTML base URL." }); }
        }
        for (const href of doc.html.hrefs) {
          try {
            let url = new URL(href, base);
            const email = doc.html.hasCloudflareEmailDecoder ? decodeCloudflareEmail(url) : null;
            if (email) url = new URL(email);
            if (!["http:", "https:"].includes(url.protocol)) {
              coverage.skippedSchemes[url.protocol] = (coverage.skippedSchemes[url.protocol] ?? 0) + 1;
              continue;
            }
            requestUrl(url.href);
            addLink({ url: url.href, references: [], pageReferences: [{ pageUrl, href }] });
            if (url.origin === origin && isHtmlRoute(url.href)) enqueue(url.href);
          } catch {
            coverage.inventoryFindings.push({ url: href, referencedBy: pageUrl, detail: "Invalid or credential-bearing page hyperlink; not requested." });
          }
        }
      });
      options.onProgress?.(`Crawled ${coverage.crawledPages}/${pages.size} published pages; discovered ${links.size} unique URLs.`);
    }
  } catch (error) { noteError(error); }
  coverage.discoveredPages = pages.size;
  coverage.discoveredUrls = links.size;
  const allLinks = [...links.values()].sort((a, b) => a.url.localeCompare(b.url));
  const selected = options.maxUrls ? allLinks.slice(0, options.maxUrls) : allLinks;
  if (selected.length !== allLinks.length) { coverage.limited = true; noteError("URL limit reached; link checks are incomplete."); }
  try {
    results = await mapConcurrent(selected, concurrency, async (link) => {
      const result = await checker.check(link);
      coverage.checkedUrls++;
      if (coverage.checkedUrls % 100 === 0) options.onProgress?.(`Checked ${coverage.checkedUrls}/${selected.length} URLs.`);
      return result;
    });
  } catch (error) { noteError(error); }
  try {
    const after = validatePublication(JSON.parse(await resourceText(markerUrl)));
    if (JSON.stringify(after) !== JSON.stringify(coverage.publication)) noteError("Published release changed during the audit; rerun against a consistent publication.");
  } catch (error) { noteError(error); }
  if (signal.aborted) noteError("Audit deadline or cancellation interrupted coverage.");
  coverage.checkedDocuments = checker.documentCount();
  coverage.httpRequests = checker.requestCount();
  coverage.errors = [...new Set(coverage.errors)];
  coverage.complete = coverage.errors.length === 0 && !coverage.limited && coverage.crawledPages === coverage.discoveredPages && results.length === coverage.discoveredUrls;
  return { schemaVersion: 2, generatedAt: new Date().toISOString(), siteUrl: origin, dataUrl, sitemapUrl, coverage, results };
}
