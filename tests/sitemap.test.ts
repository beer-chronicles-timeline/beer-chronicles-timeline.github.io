import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { resolveSitemap } from "next/dist/build/webpack/loaders/metadata/resolve-route-data";
import sitemap from "../src/app/sitemap";
import { verifySitemapExport } from "../scripts/check-publication-export";
import { getEventUrl } from "../src/lib/eventUrls";
import { getEventSitemapLastModified } from "../src/lib/eventMetadata";
import { validatePublicationData } from "../src/lib/publicationData";
import { getStorylineSitemapUrls } from "../src/lib/storylines";
import type { TimelineEvent } from "../src/lib/types";
import { createPublicationFixture } from "./fixtures/publication";

test("sitemap serializes every URL with verified modification dates or no lastmod", async () => {
  const data = validatePublicationData(createPublicationFixture(1500));
  const dates = [
    undefined, null, "2026-09-04T11:33:15.30406", "2026-09-05T14:04:05.111631",
    "2026-09-14T14:34:43.941155", "2026-02-29T12:00:00Z",
    "2026-11-27T14:30:00.111631Z", "2026-11-27T14:30:00.111631+01:00", "2026-11-27",
  ];
  data.events = data.events.map((event, index) => ({
    ...event, created_at: "2026-06-11T20:57:01Z", updated_at: dates[index % dates.length],
  }));
  const before = structuredClone(data);
  const directory = mkdtempSync(join(tmpdir(), "bc-sitemap-test-"));
  const originalCwd = process.cwd();
  try {
    mkdirSync(join(directory, ".cache"));
    writeFileSync(join(directory, ".cache/publication.json"), JSON.stringify({ ...data, mode: "fixture" }));
    // Exercise the actual route in a temporary workspace; keep the existing
    // publication snapshot and export untouched, with no backend access.
    process.chdir(directory);
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    assert.equal(entries.length, 14 + getStorylineSitemapUrls().length + data.events.length);
    assert.equal(new Set(urls).size, entries.length);
    for (const event of data.events) assert.ok(urls.includes(getEventUrl(event.id, event.title)));
    for (const url of getStorylineSitemapUrls()) assert.ok(urls.includes(url));
    const xml = resolveSitemap(entries);
    assert.doesNotThrow(() => verifySitemapExport(xml, data.events));
    // Check the serialized XML as well as the route's metadata objects.
    const actualDates = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
    assert.equal(actualDates.length, data.events.filter((event) => getEventSitemapLastModified(event)).length);
    for (const value of actualDates) {
      assert.match(value, /^2026-11-27(?:T14:30:00\.111631(?:Z|\+01:00))?$/);
    }
    assert.deepEqual(data, before);
  } finally {
    process.chdir(originalCwd);
    rmSync(directory, { recursive: true, force: true });
  }
});

const event: TimelineEvent = {
  id: "sitemap-test", title: "Synthetic test entry", description: null,
  event_date: "1516-04-23", historical_year: null, image_url: null,
  created_at: "2026-06-11T20:57:01Z", updated_at: "2026-11-27T14:30:00Z",
};

test("export verification checks every sitemap lastmod against the modification source", () => {
  const valid = resolveSitemap([
    { url: "https://beer-chronicles.org" },
    { url: getEventUrl(event.id, event.title), lastModified: event.updated_at! },
  ]);
  assert.doesNotThrow(() => verifySitemapExport(valid, [event]));
  for (const value of [
    "2026-11-27T14:30:00", "2026-02-30T00:00:00Z", "2026-06-11T20:57:01Z", "1516-04-23",
  ]) {
    assert.throws(() => verifySitemapExport(valid.replace(event.updated_at!, value), [event]), /Sitemap lastmod differs/);
  }
  assert.throws(() => verifySitemapExport(valid.replace(/<lastmod>[^<]+<\/lastmod>/, ""), [event]), /Sitemap lastmod differs/);
  assert.throws(() => verifySitemapExport(valid.replace("</url>", "<lastmod>2026-11-27</lastmod></url>"), [event]), /Sitemap lastmod differs/);
  assert.throws(() => verifySitemapExport(valid, [{ ...event, updated_at: null }]), /Sitemap lastmod differs/);
  assert.throws(() => verifySitemapExport(valid, [{ ...event, updated_at: "2026-09-04T11:33:15.30406" }]), /Sitemap lastmod differs/);
});

test("export verification rejects missing or duplicate sitemap entries", () => {
  const entry = { url: getEventUrl(event.id, event.title), lastModified: event.updated_at! };
  assert.throws(() => verifySitemapExport(resolveSitemap([]), [event]), /Missing sitemap entry/);
  assert.throws(() => verifySitemapExport(resolveSitemap([entry, entry]), [event]), /duplicate sitemap URL/);
});
