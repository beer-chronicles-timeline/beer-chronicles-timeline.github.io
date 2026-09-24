import assert from "node:assert/strict";
import test from "node:test";
import { verifyRelease } from "../scripts/release-verification.mjs";
const publication = { commit: "a".repeat(40), mode: "live", eventCount: 590, generatedAt: "2026-09-24T11:46:07.348Z" };
const routes = [
  { path: "/", canonical: "https://beer-chronicles.org/", heading: "Homepage" },
  { path: "/map", canonical: "https://beer-chronicles.org/map", heading: "Beer Map" },
  { path: "/events/id/old", canonical: "https://beer-chronicles.org/events/id/new", heading: "This entry has a new address", continueTo: "/events/id/new" },
  { path: "/events/id/new", canonical: "https://beer-chronicles.org/events/id/new", heading: "Current title" },
].map((route) => ({ ...route, publicationId: `${publication.commit}:${publication.generatedAt}` }));
const manifest = { schemaVersion: 1, publication, routes };
const html = (route: typeof routes[number]) => `<meta name="bc-publication" content="${route.publicationId}"><link rel="canonical" href="${route.canonical}"><h1>${route.heading}</h1>${route.continueTo ? `<a href="${route.continueTo}">Continue</a>` : ""}`;
function server(options: { status?: object; transform?: (body: string, path: string) => string; missing?: string } = {}) {
  return async (input: Parameters<typeof fetch>[0]) => {
    const path = new URL(input instanceof Request ? input.url : input).pathname;
    if (path === "/publication-status.json") return new Response(JSON.stringify(options.status ?? publication));
    const route = routes.find((r) => r.path === path);
    if (!route || path === options.missing) return new Response("Not found", { status: 404 });
    return new Response(options.transform?.(html(route), path) ?? html(route));
  };
}
test("release verification checks exact marker, route identities and alias destination", async () => {
  await verifyRelease(manifest, { fetchPage: server(), attempts: 1 });
  for (const status of [{ ...publication, commit: "b".repeat(40) }, { ...publication, generatedAt: "old" }, { ...publication, mode: "fixture" }, { ...publication, eventCount: 589 }]) {
    await assert.rejects(verifyRelease(manifest, { fetchPage: server({ status }), attempts: 1 }), /expected.*observed/);
  }
  await assert.rejects(verifyRelease(manifest, { fetchPage: server({ transform: () => '<link rel="canonical" href="https://beer-chronicles.org"><h1>Homepage</h1>' }), attempts: 1 }), /expected publication/);
  await assert.rejects(verifyRelease(manifest, { fetchPage: server({ transform: (body, path) => path.endsWith("old") ? body.replaceAll("/events/id/new", "/wrong-event") : body }), attempts: 1 }), /expected canonical/);
  await assert.rejects(verifyRelease(manifest, { fetchPage: server({ transform: (body) => body.replace(/<a[^>]*>.*?<\/a>/g, "") }), attempts: 1 }), /continuation link/);
  await assert.rejects(verifyRelease(manifest, { fetchPage: server({ transform: (body) => body.replace(`${publication.commit}:${publication.generatedAt}`, "old-publication") }), attempts: 1 }), /expected publication/);
  await assert.rejects(verifyRelease(manifest, { fetchPage: server({ missing: "/events/id/old" }), attempts: 1 }), /HTTP 404/);
  await assert.rejects(verifyRelease({ ...manifest, publication: { ...publication, mode: "fixture" } }, { fetchPage: server(), attempts: 1 }), /Invalid expected live/);
});
test("release verification retries propagation and detects a mid-check release switch", async () => {
  let calls = 0, waits = 0;
  const healthy = server();
  await verifyRelease(manifest, { attempts: 2, sleep: async () => { waits++; }, fetchPage: async (input: Parameters<typeof fetch>[0]) => {
    const url = input instanceof Request ? input.url : String(input);
    if (++calls === 1) return new Response(JSON.stringify({ ...publication, generatedAt: "old" }));
    return healthy(url);
  } });
  assert.equal(waits, 1);
  let markers = 0;
  await assert.rejects(verifyRelease(manifest, { attempts: 1, fetchPage: async (input: Parameters<typeof fetch>[0]) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("publication-status") && ++markers === 2) return new Response(JSON.stringify({ ...publication, commit: "b".repeat(40) }));
    return healthy(url);
  } }), /Publication commit/);
});

test("release verification rejects homepage canonicals with query state or a missing root slash", async () => {
  for (const canonical of ["https://beer-chronicles.org", "https://beer-chronicles.org/?tags=Carlsberg", "https://beer-chronicles.org/?from=2012&to=2016&string=Maisel+Friends"]) {
    await assert.rejects(verifyRelease(manifest, {
      fetchPage: server({ transform: (body, path) => path === "/" ? body.replace('href="https://beer-chronicles.org/"', `href="${canonical}"`) : body }),
      attempts: 1,
    }), /expected canonical/);
  }
});
