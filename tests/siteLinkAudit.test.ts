import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { decodeCloudflareEmail, decodeEntities, parseAuditHtml, parseSitemap } from "../scripts/link-audit-html.ts";
import { auditPublishedSite, validatePublication, validateSourceEvents } from "../scripts/site-link-audit.ts";
import { makeMarkdown, makeSummary } from "../scripts/source-link-report.ts";

const site = "https://beer.example";
const publication = { commit: "a".repeat(40), mode: "live", eventCount: 1, generatedAt: "2026-10-11T12:00:00.000Z" };
const event = { id: "fixture", title: "Synthetic entry", sources: [
  "Article\nhttps://source.example/article#reference",
  "Blocked\nhttps://source.example/blocked",
  "Gone\nhttps://source.example/gone",
  "PDF\nhttps://source.example/transcript.pdf",
].join("\n\n") };
const page = (body: string, marker = publication) => `<html><head><title>Fixture page</title><meta name="bc-publication" content="${marker.commit}:${marker.generatedAt}"></head><body><h1>Fixture page</h1>${body}</body></html>`;
const html = (body: string) => new Response(body, { headers: { "content-type": "text/html" } });

function fixture(overrides: Partial<Record<string, () => Response>> = {}) {
  const calls: string[] = [];
  const fetchPage: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    assert.equal(init?.method, "GET", "All audit HTTP requests must be read-only GETs");
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    if (overrides[url]) return overrides[url]();
    const routes: Record<string, () => Response> = {
      [`${site}/publication-status.json`]: () => new Response(JSON.stringify(publication)),
      [`${site}/timeline-data.json`]: () => new Response(JSON.stringify({ events: [event] })),
      [`${site}/sitemap.xml`]: () => new Response(`<urlset>${["/", "/sources", "/events/fixture/entry"].map((path) => `<url><loc>${site}${path}</loc></url>`).join("")}</urlset>`),
      [`${site}/`]: () => html(page('<div id="home"></div><a href="#home">Home</a><a href="/sources#resource">Sources</a><a href="/extra?view=one#present">Extra</a><a href="mailto:fixture@example.org">Mail</a>')),
      [`${site}/sources`]: () => html(page('<div id="resource"></div><a href="https://source.example/only-on-sources">Resource</a><a href="https://source.example/query?a=1&amp;b=2">Query</a>')),
      [`${site}/events/fixture/entry`]: () => html(page('<a href="https://source.example/article#reference">Citation</a><a href="/extra?view=two#present">Explore</a>')),
      [`${site}/extra`]: () => html(page('<div id="present"></div><a href="https://source.example/article#reference">Another reference</a>')),
      "https://source.example/article": () => html('<h1>Source article</h1><p id="reference">Evidence</p>'),
      "https://source.example/only-on-sources": () => html("<h1>General resource</h1>"),
      "https://source.example/query?a=1&b=2": () => html("<h1>Query resource</h1>"),
      "https://source.example/blocked": () => new Response("Denied", { status: 403 }),
      "https://source.example/gone": () => new Response("Gone", { status: 410 }),
      "https://source.example/transcript.pdf": () => new Response("%PDF-1.7\nfixture", { headers: { "content-type": "application/pdf" } }),
    };
    assert.ok(routes[url], `Unexpected request: ${url}`);
    return routes[url]();
  };
  return { fetchPage, calls };
}

const auditOptions = { siteUrl: site, retries: 0, minHostIntervalMs: 0 };

test("extracts actual hyperlinks and targets while ignoring scripts, comments, and raw text", () => {
  const parsed = parseAuditHtml(`<!-- <a href="https://phantom.example/"> -->
    <script>const x='<a href="https://script.example/">';</script>
    <style>.x {content:'<a href="https://style.example/">'}</style>
    <textarea id="sources"><a href="https://text.example/"></textarea>
    <title>Test &amp; research</title><h1>A <em>heading</em></h1>
    <a HREF="/article?a=1&amp;b=2" data-label="a > b" id="caf&#233;">Link</a>
    <area href='/map'><a href=/plain name=legacy></a><base href="/archive/">`);
  assert.deepEqual(parsed.hrefs, ["/article?a=1&b=2", "/map", "/plain"]);
  assert.ok(parsed.ids.has("café"));
  assert.ok(parsed.ids.has("legacy"));
  assert.ok(parsed.ids.has("sources"));
  assert.equal(parsed.title, "Test & research");
  assert.equal(parsed.heading, "A heading");
  assert.equal(parsed.baseHref, "/archive/");
  assert.equal(decodeEntities("&#x1F37A; &AMP;"), "🍺 &");
});

test("supports sitemap indexes, XML entities, namespaces and rejects empty/error responses", () => {
  assert.deepEqual(parseSitemap('<sitemapindex><sitemap><loc>https://site.example/a.xml</loc></sitemap></sitemapindex>'), { index: true, urls: ["https://site.example/a.xml"] });
  assert.deepEqual(parseSitemap('<s:urlset><s:url><s:loc>https://site.example/?a=1&amp;b=2</s:loc></s:url></s:urlset>'), { index: false, urls: ["https://site.example/?a=1&b=2"] });
  assert.throws(() => parseSitemap('<html><h1>404</h1></html>'), /not a sitemap/);
  assert.throws(() => parseSitemap('<urlset></urlset>'), /no URLs/);
});

test("validates publication, corpus count, schema and unique event IDs", () => {
  assert.deepEqual(validatePublication(publication), publication);
  for (const marker of [{ ...publication, eventCount: 0 }, { ...publication, commit: "bad" }, { ...publication, mode: "fixture" }, { ...publication, generatedAt: 2026 }]) assert.throws(() => validatePublication(marker));
  for (const payload of [{ events: [] }, { events: [event, event] }, { events: [{ ...event, sources: [] }] }, { events: [{ id: "fixture" }] }]) assert.throws(() => validateSourceEvents(payload, 1));
});

test("covers citations, sitemap and discovered pages, external resources, query variants and fragments", async () => {
  const server = fixture();
  const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
  assert.equal(audit.coverage.complete, true, JSON.stringify(audit.coverage.errors));
  assert.equal(audit.coverage.eventCount, 1);
  assert.equal(audit.coverage.sourceUrls, 4);
  assert.equal(audit.coverage.sitemapPages, 3);
  assert.equal(audit.coverage.crawledPages, 4);
  assert.equal(audit.coverage.checkedUrls, audit.coverage.discoveredUrls);
  assert.equal(audit.results.length, audit.coverage.checkedUrls);
  assert.equal(audit.coverage.skippedSchemes["mailto:"], 1);
  assert.ok(audit.results.some((result) => result.url.endsWith("/only-on-sources")));
  assert.ok(audit.results.some((result) => result.url.endsWith("?a=1&b=2")));
  assert.equal(server.calls.filter((url) => url === `${site}/extra`).length, 1);
  assert.equal(server.calls.filter((url) => url === "https://source.example/article").length, 1);
  const shared = audit.results.find((result) => result.url === "https://source.example/article#reference")!;
  assert.equal(shared.references[0].eventId, event.id);
  assert.equal(shared.pageReferences!.length, 2);
  assert.equal(shared.fragmentStatus, "valid");
  assert.equal(makeSummary(audit.results).missing, 1);
  assert.equal(makeSummary(audit.results).blocked, 1);
});

test("reports unresolved results prominently and keeps source/page counts distinguishable", async () => {
  const server = fixture();
  const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
  for (const brief of [false, true]) {
    const report = makeMarkdown(audit, brief);
    assert.match(report, /Coverage: COMPLETE/);
    assert.match(report, /Citation URLs \| Page\/sitemap URLs/);
    assert.match(report, /Unresolved access and temporary failures/);
    assert.match(report, /https:\/\/source.example\/blocked/);
    assert.match(report, /read-only/);
    assert.match(report, /never repairs links/);
    assert.match(report, /Missing URLs and static HTML fragment targets/);
  }
});

test("flags URL/page limits and truncated crawls as incomplete, with partial findings retained", async () => {
  for (const limits of [{ maxPages: 1 }, { maxUrls: 1 }, { maxPageBytes: 50 }]) {
    const server = fixture();
    const audit = await auditPublishedSite({ ...auditOptions, ...limits, fetchPage: server.fetchPage });
    assert.equal(audit.coverage.complete, false);
    assert.ok(audit.coverage.errors.length);
    assert.ok(audit.results.length);
    assert.match(makeMarkdown(audit), /INCOMPLETE — this is not an all-clear/);
  }
});

test("rejects incomplete timeline, sitemap, and inconsistent published pages", async () => {
  for (const overrides of [
    { [`${site}/timeline-data.json`]: () => new Response(JSON.stringify({ events: [] })) },
    { [`${site}/sitemap.xml`]: () => new Response(`<urlset><url><loc>${site}/</loc></url></urlset>`) },
    { [`${site}/sources`]: () => html(page("<p>Old release</p>", { ...publication, commit: "b".repeat(40) })) },
    { [`${site}/sources`]: () => new Response("Gone", { status: 404 }) },
  ]) {
    const server = fixture(overrides);
    const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
    assert.equal(audit.coverage.complete, false);
    assert.ok(audit.coverage.errors.length);
  }
});

test("detects release changes during the audit", async () => {
  let markerReads = 0;
  const server = fixture({ [`${site}/publication-status.json`]: () => new Response(JSON.stringify({
    ...publication, generatedAt: ++markerReads === 1 ? publication.generatedAt : "2026-10-11T13:00:00.000Z",
  })) });
  const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
  assert.equal(audit.coverage.complete, false);
  assert.ok(audit.coverage.errors.some((error) => error.includes("changed during")));
});

test("supports base-relative links and records malformed page/source URLs", async () => {
  const server = fixture({
    [`${site}/timeline-data.json`]: () => new Response(JSON.stringify({ events: [{ ...event, sources: event.sources + "\n\nBad URL\nhttps://" }] })),
    [`${site}/sources`]: () => html(page('<base href="https://source.example/"><a href="only-on-sources">Base relative</a><a href="http://[">Invalid</a>')),
  });
  const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
  assert.equal(audit.coverage.complete, true);
  assert.equal(audit.coverage.inventoryFindings.length, 2);
  assert.ok(audit.results.some((result) => result.url === "https://source.example/only-on-sources"));
  assert.match(makeMarkdown(audit), /Invalid hyperlinks requiring review/);
});

test("recognizes Cloudflare-protected mailto links without crawling or executing them", async () => {
  const protectedHref = "/cdn-cgi/l/email-protection#5d34333b321d3f38382f703e352f3233343e31382e73322f3a";
  assert.equal(decodeCloudflareEmail(new URL(protectedHref, site)), "mailto:info@beer-chronicles.org");
  assert.equal(decodeCloudflareEmail(new URL("/cdn-cgi/l/email-protection#invalid", site)), null);
  assert.equal(decodeCloudflareEmail(new URL("/ordinary-page#1234", site)), null);
  const server = fixture({ [`${site}/sources`]: () => html(page(`<script src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><a href="${protectedHref}">Email</a>`)) });
  const audit = await auditPublishedSite({ ...auditOptions, fetchPage: server.fetchPage });
  assert.equal(audit.coverage.complete, true);
  assert.equal(audit.coverage.skippedSchemes["mailto:"], 2);
  assert.ok(server.calls.every((url) => !url.includes("/cdn-cgi/")));
  assert.ok(audit.results.every((result) => !result.url.includes("/email-protection")));
});

test("prevents accidental sample-only or invalid configuration and off-site inputs", async () => {
  for (const option of [{ concurrency: 0 }, { maxPages: -1 }, { retries: NaN }, { timeoutMs: 0 }, { dataUrl: "https://other.example/timeline-data.json" }]) {
    await assert.rejects(auditPublishedSite({ ...auditOptions, ...option, fetchPage: async () => assert.fail("Invalid configuration must not fetch") }));
  }
});

test("workflow has read-only permissions and cannot edit issues, content or the backend", async () => {
  const workflow = await readFile(new URL("../.github/workflows/source-link-audit.yml", import.meta.url), "utf8");
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /actions: read/);
  assert.doesNotMatch(workflow, /\b[\w-]+: write/);
  const executable = workflow.replace(/^\s*#.*$/gm, "");
  assert.doesNotMatch(executable, /actions\/github-script|secrets\.|issues\.(?:update|create)|supabase|git push|deploy\.yml/i);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /if-no-files-found: error/);
  assert.match(workflow, /SOURCE_LINK_HISTORY_FILE/);
  const historyReader = await readFile(new URL("../scripts/restore-source-link-history.ts", import.meta.url), "utf8");
  assert.match(historyReader, /method: "GET"/);
  assert.match(historyReader, /run\("gh", \["run", "download"/);
  assert.doesNotMatch(historyReader, /method: "(?:POST|PUT|PATCH|DELETE)"|supabase|git push|source-link-review-register/i);
});

test("CLI writes read-only reports and summaries, and fails incomplete audits with retained evidence", async (t) => {
  let incomplete = false;
  let origin = "";
  const methods: string[] = [];
  const server = createServer((request, response) => {
    methods.push(request.method ?? "unknown");
    const path = new URL(request.url!, origin).pathname;
    response.setHeader("Content-Type", "application/json");
    if (path === "/publication-status.json") response.end(JSON.stringify(publication));
    else if (path === "/timeline-data.json") response.end(JSON.stringify({ events: incomplete ? [] : [{ ...event, sources: `Fixture PDF\n${origin}/fixture.pdf\n\nManually checked\n${origin}/blocked-source\n\nFirst access failure\n${origin}/unregistered-source` }] }));
    else if (path === "/sitemap.xml") {
      response.setHeader("Content-Type", "application/xml");
      response.end(`<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/events/fixture/entry</loc></url></urlset>`);
    } else if (path === "/fixture.pdf") {
      response.setHeader("Content-Type", "application/pdf");
      response.end("%PDF-1.7\nfixture");
    } else if (path === "/blocked-source" || path === "/unregistered-source") {
      response.statusCode = 403;
      response.end("Denied");
    } else {
      response.setHeader("Content-Type", "text/html");
      response.end(page('<a href="/fixture.pdf">Fixture source</a><a href="#main">Main</a><div id="main"></div>'));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => { server.closeAllConnections(); return new Promise<void>((resolve) => server.close(() => resolve())); });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  origin = `http://127.0.0.1:${address.port}`;
  const execute = promisify(execFile);
  let previousPath = "";
  let previousContents = "";
  for (const [brokenInput, useHistory] of [[false, false], [false, true], [true, true]]) {
    incomplete = brokenInput;
    const directory = await mkdtemp(join(tmpdir(), "bc-link-audit-test-"));
    const summaryPath = join(directory, "summary.md");
    const reviewPath = join(directory, "manual-reviews.json");
    const reviewedOn = new Date().toISOString().slice(0, 10);
    const reviewAfter = new Date(Date.parse(`${reviewedOn}T00:00:00.000Z`) + 180 * 86_400_000).toISOString().slice(0, 10);
    const reviewContents = JSON.stringify({ schemaVersion: 1, reviews: [{
      url: `${origin}/blocked-source`, reviewedOn, reviewAfter,
      reviewedBy: "fixture reviewer", note: "User-confirmed current state; synthetic fixture.",
      expectedFinding: { status: "blocked", httpStatus: 403, finalUrl: null, detail: null, fragmentStatus: "not-applicable" },
    }] });
    await writeFile(reviewPath, reviewContents);
    let exitCode = 0;
    try {
      await execute(process.execPath, ["--import", "tsx", "scripts/check-source-links.ts"], {
        cwd: new URL("..", import.meta.url).pathname,
        env: { ...process.env,
          SOURCE_LINK_SITE_URL: origin, SOURCE_LINK_DATA_URL: `${origin}/timeline-data.json`, SOURCE_LINK_SITEMAP_URL: `${origin}/sitemap.xml`,
          SOURCE_LINK_REPORT_DIR: directory, GITHUB_STEP_SUMMARY: summaryPath,
          SOURCE_LINK_REVIEW_FILE: reviewPath,
          SOURCE_LINK_HISTORY_FILE: useHistory ? previousPath : "",
          SOURCE_LINK_HOST_INTERVAL_MS: "0", SOURCE_LINK_RETRIES: "0", SOURCE_LINK_MAX_URLS: "0", SOURCE_LINK_MAX_PAGES: "0", SOURCE_LINK_TIMEOUT_MS: "2000",
        },
        timeout: 10_000,
      });
    } catch (error) {
      const failure = error as { code: number; stderr: string };
      assert.equal(failure.code, 1, failure.stderr);
      exitCode = failure.code;
    }
    assert.equal(exitCode, brokenInput ? 1 : 0);
    const report = JSON.parse(await readFile(join(directory, "source-link-report.json"), "utf8"));
    assert.equal(report.schemaVersion, 2);
    assert.equal(report.coverage.complete, !brokenInput);
    assert.equal(report.checkedUrls, report.results.length);
    if (!brokenInput) {
      assert.equal(report.summary.blocked, 2, "Raw HTTP statuses must remain visible");
      assert.equal(report.attentionSummary.blocked, useHistory ? 1 : 0);
      assert.equal(report.reviewSummary.acknowledgedWarnings, 1);
      assert.equal(report.accessReviewSummary.awaitingConfirmation, useHistory ? 0 : 1);
      assert.equal(report.accessReviewSummary.persistentWarnings, useHistory ? 1 : 0);
      assert.ok(report.results.some((result: { url: string; manualReview?: { state: string } }) => result.url === `${origin}/blocked-source` && result.manualReview?.state === "acknowledged"));
    }
    assert.equal(await readFile(reviewPath, "utf8"), reviewContents, "CLI must never write or renew reviews");
    assert.match(await readFile(summaryPath, "utf8"), brokenInput ? /INCOMPLETE/ : /COMPLETE/);
    assert.match(await readFile(join(directory, "source-link-report.md"), "utf8"), /read-only/);
    if (!previousPath) {
      previousPath = join(directory, "source-link-report.json");
      previousContents = await readFile(previousPath, "utf8");
    } else {
      assert.equal(await readFile(previousPath, "utf8"), previousContents, "Prior audit reports must never be rewritten");
    }
  }
  assert.ok(methods.length > 0);
  assert.ok(methods.every((method) => method === "GET"));
});
