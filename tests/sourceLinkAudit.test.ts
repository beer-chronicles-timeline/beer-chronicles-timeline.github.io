import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyHttpStatus,
  collectSourceLinks,
  createLinkChecker,
  requestUrl,
} from "../scripts/source-link-audit.ts";

test("collects and deduplicates source URLs with their event references", () => {
  assert.deepEqual(
    collectSourceLinks([
      {
        id: "event-1",
        title: "First event",
        sources: "First source\nhttps://example.com/article",
      },
      {
        id: "event-2",
        title: "Second event",
        sources: JSON.stringify([
          { title: "Same source", url: "https://example.com/article" },
          { title: "Another source", url: "www.example.org/report.pdf" },
        ]),
      },
    ]),
    [
      {
        url: "https://example.com/article",
        references: [
          { eventId: "event-1", eventTitle: "First event" },
          { eventId: "event-2", eventTitle: "Second event" },
        ],
      },
      {
        url: "https://www.example.org/report.pdf",
        references: [{ eventId: "event-2", eventTitle: "Second event" }],
      },
    ]
  );
});

test("classifies definite failures separately from blocking and transient errors", () => {
  assert.equal(classifyHttpStatus(200, false), "working");
  assert.equal(classifyHttpStatus(200, true), "redirected");
  assert.equal(classifyHttpStatus(404, false), "missing");
  assert.equal(classifyHttpStatus(410, false), "missing");
  assert.equal(classifyHttpStatus(403, false), "blocked");
  assert.equal(classifyHttpStatus(429, false), "rate-limited");
  assert.equal(classifyHttpStatus(503, false), "transient-error");
  assert.equal(classifyHttpStatus(451, false), "needs-review");
  assert.equal(classifyHttpStatus(302, false), "needs-review");
});

const link = (url: string) => ({ url, references: [{ eventId: "one", eventTitle: "Fixture entry" }] });
const htmlResponse = (body: string, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });

test("retains invalid source URL findings instead of silently losing them", () => {
  const invalid: string[] = [];
  const links = collectSourceLinks([{ id: "one", title: "Fixture", sources: JSON.stringify([
    { title: "Invalid", url: "https://" }, { title: "Credentials", url: "https://user:password@example.org/" },
    { title: "Other protocol", url: "ftp://example.org/" },
  ]) }], (url) => invalid.push(url));
  assert.equal(links.length, 0);
  assert.equal(invalid.length, 3);
});

test("reads content with GET, without one-byte ranges or any modifying request", async () => {
  const checker = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async (_input, init) => {
    assert.equal(init?.method, "GET");
    assert.equal(init?.redirect, "manual");
    assert.equal(new Headers(init?.headers).has("range"), false);
    return htmlResponse("<title>Research article</title><h1>Evidence</h1>");
  } });
  assert.equal((await checker.check(link("https://example.org/article"))).status, "working");
});

test("flags soft errors, access challenges, login barriers, and empty bodies conservatively", async () => {
  for (const body of ["<title>404 - Page not found</title>", "<h1>Page not found</h1>",
    "<title>Just a moment...</title>", "<title>Log in - Library</title>", ""]) {
    const checker = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () => htmlResponse(body) });
    const result = await checker.check(link("https://example.org/article"));
    assert.equal(result.status, "needs-review");
    assert.ok(result.detail);
  }
});

test("flags article-to-homepage redirects and keeps ordinary moved articles separate", async () => {
  for (const destination of ["/", "/en/", "/new-article"]) {
    const checker = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async (input) =>
      new URL(String(input)).pathname === "/old-article"
        ? new Response(null, { status: 301, headers: { location: destination } })
        : htmlResponse("<title>Article</title>") });
    const result = await checker.check(link("https://example.org/old-article"));
    assert.equal(result.status, destination === "/new-article" ? "redirected" : "needs-review");
    assert.equal(result.finalUrl, `https://example.org${destination}`);
  }
});

test("detects invalid PDF responses, including PDFs redirected to HTML", async () => {
  const valid = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () =>
    new Response("%PDF-1.7\nfixture", { headers: { "content-type": "application/pdf" } }) });
  assert.equal((await valid.check(link("https://example.org/transcript.pdf"))).status, "working");
  const invalid = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async (input) =>
    String(input).endsWith(".pdf") ? new Response(null, { status: 302, headers: { location: "/download" } })
      : htmlResponse("<title>Missing file</title>") });
  const result = await invalid.check(link("https://example.org/transcript.pdf"));
  assert.equal(result.status, "needs-review");
  assert.match(result.detail!, /no PDF header/);
});

test("deduplicates HTTP documents while checking each fragment and keeping source references", async () => {
  let calls = 0;
  const checker = createLinkChecker({ siteOrigin: "https://example.org", retries: 0, minHostIntervalMs: 0,
    fetchPage: async () => { calls++; return htmlResponse('<div id="caf&#233;"></div><a name="legacy"></a>'); } });
  const results = await Promise.all(["caf%C3%A9", "legacy", "missing", "top"].map((fragment) => checker.check(link(`https://example.org/article#${fragment}`))));
  assert.deepEqual(results.map((result) => result.status), ["working", "working", "missing-fragment", "working"]);
  assert.equal(calls, 1);
  assert.equal(results[2].fragmentStatus, "missing");
  assert.equal(results[2].references[0].eventId, "one");
});

test("does not claim external or truncated HTML, PDF, or text fragments are definitely broken", async () => {
  const external = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () => htmlResponse("<h1>Article</h1>") });
  assert.equal((await external.check(link("https://example.org/article#dynamic"))).status, "needs-review");
  const truncated = createLinkChecker({ siteOrigin: "https://example.org", maxPageBytes: 30, retries: 0, minHostIntervalMs: 0,
    fetchPage: async () => htmlResponse('<html><div>Long fixture body here</div><p id="end">Target</p></html>') });
  const result = await truncated.check(link("https://example.org/article#end"));
  assert.equal(result.bodyTruncated, true);
  assert.equal(result.fragmentStatus, "unverified");
  assert.equal(result.status, "needs-review");
  const pdf = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () => new Response("%PDF-1.7\nfixture", { headers: { "content-type": "application/pdf" } }) });
  assert.equal((await pdf.check(link("https://example.org/article.pdf#page=3"))).fragmentStatus, "unverified");
  assert.equal((await external.check(link("https://example.org/article#:~:text=Article"))).fragmentStatus, "unverified");
});

test("retries temporary failures with backoff and leaves blocks separate", async () => {
  for (const initial of [429, 503, "network"] as const) {
    let calls = 0;
    const waits: number[] = [];
    const checker = createLinkChecker({ retries: 2, minHostIntervalMs: 0, sleep: async (ms) => { waits.push(ms); },
      fetchPage: async () => {
        if (++calls === 1) {
          if (initial === "network") throw new TypeError("fetch failed");
          return new Response("Temporary", { status: initial, headers: { "retry-after": "2" } });
        }
        return htmlResponse("<title>Article</title>");
      } });
    const result = await checker.check(link("https://example.org/article"));
    assert.equal(result.status, "working");
    assert.equal(result.attempts, 2);
    assert.equal(calls, 2);
    assert.equal(waits[0], initial === "network" ? 1000 : 2000);
  }
  let calls = 0;
  const blocked = createLinkChecker({ retries: 2, minHostIntervalMs: 0, fetchPage: async () => { calls++; return new Response("Blocked", { status: 403 }); } });
  assert.equal((await blocked.check(link("https://example.org/article"))).status, "blocked");
  assert.equal(calls, 1);
});

test("leaves long Retry-After responses unresolved without waiting or retrying early", async () => {
  let calls = 0;
  const checker = createLinkChecker({ retries: 2, minHostIntervalMs: 0,
    sleep: async () => assert.fail("Must not wait beyond the retry budget"),
    fetchPage: async () => { calls++; return new Response("Rate limit", { status: 429, headers: { "retry-after": "120" } }); } });
  const result = await checker.check(link("https://example.org/article"));
  assert.equal(result.status, "rate-limited");
  assert.match(result.detail!, /left unresolved/);
  assert.equal(calls, 1);
});

test("serializes requests to one host while allowing different hosts to overlap", async () => {
  const active = new Map<string, number>();
  let maximumTotal = 0, total = 0;
  const checker = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async (input) => {
    const host = new URL(String(input)).host;
    const sameHost = (active.get(host) ?? 0) + 1;
    active.set(host, sameHost);
    assert.equal(sameHost, 1);
    maximumTotal = Math.max(maximumTotal, ++total);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active.set(host, sameHost - 1); total--;
    return htmlResponse("<title>Article</title>");
  } });
  await Promise.all(["https://one.example/a", "https://one.example/b", "https://two.example/a"].map((url) => checker.check(link(url))));
  assert.equal(maximumTotal, 2);
});

test("terminates redirect loops, malformed redirects, and cancellation", async () => {
  const loop = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () => new Response(null, { status: 302, headers: { location: "/loop" } }) });
  const result = await loop.check(link("https://example.org/loop"));
  assert.equal(result.status, "network-error");
  assert.match(result.detail!, /Redirect loop/);
  const unsafe = createLinkChecker({ retries: 0, minHostIntervalMs: 0, fetchPage: async () => new Response(null, { status: 302, headers: { location: "file:///private/file" } }) });
  assert.equal((await unsafe.check(link("https://example.org/article"))).status, "network-error");
  const controller = new AbortController(); controller.abort();
  const cancelled = createLinkChecker({ signal: controller.signal, fetchPage: async () => assert.fail("Cancelled check must not fetch") });
  assert.equal((await cancelled.check(link("https://example.org/article"))).status, "transient-error");
});

test("deduplicates static internal query state without dropping external source queries", () => {
  assert.equal(requestUrl("https://site.example/?tags=IPA#heading", "https://site.example"), "https://site.example/");
  assert.equal(requestUrl("https://source.example/?document=1#heading", "https://site.example"), "https://source.example/?document=1");
});
