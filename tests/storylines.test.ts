import assert from "node:assert/strict";
import test from "node:test";
import { getEventsForStoryline } from "../src/lib/eventStorylines.ts";
import {
  STORYLINES,
  getStorylineHref,
  getStorylinePageTitle,
  getStorylineSitemapUrls,
  getStorylineStaticParams,
  getStorylineTimelineHref,
  getStorylineUrl,
} from "../src/lib/storylines.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

test("every Storyline has one deterministic permanent URL and unique slug", () => {
  const slugs = STORYLINES.map((storyline) => storyline.slug);
  const urls = STORYLINES.map(getStorylineUrl);

  assert.equal(new Set(slugs).size, STORYLINES.length);
  assert.equal(new Set(urls).size, STORYLINES.length);

  STORYLINES.forEach((storyline) => {
    assert.equal(
      getStorylineHref(storyline),
      `/storylines/${storyline.slug}`
    );
    assert.equal(
      getStorylineUrl(storyline),
      `https://beer-chronicles.org/storylines/${storyline.slug}`
    );
  });
});

test("static params contain every Storyline exactly once", () => {
  assert.deepEqual(
    getStorylineStaticParams(),
    STORYLINES.map((storyline) => ({ slug: storyline.slug }))
  );
});

test("sitemap URLs contain every canonical Storyline URL exactly once", () => {
  const urls = getStorylineSitemapUrls();

  assert.deepEqual(urls, STORYLINES.map(getStorylineUrl));
  assert.equal(new Set(urls).size, STORYLINES.length);
  assert.ok(urls.every((url) => !url.includes("?")));
});

test("Storyline page titles are unique and use existing titles verbatim", () => {
  const titles = STORYLINES.map(getStorylinePageTitle);

  assert.equal(new Set(titles).size, STORYLINES.length);
  STORYLINES.forEach((storyline) => {
    assert.equal(
      getStorylinePageTitle(storyline),
      `${storyline.title}: A Beer History Storyline | Beer Chronicles`
    );
  });
});

test("every Storyline uses its existing editorial description as an introduction", () => {
  assert.ok(
    STORYLINES.every((storyline) => storyline.description.trim().length > 0)
  );
});

test("existing filtered-Timeline Storyline URLs remain available", () => {
  const storyline = STORYLINES.find(
    ({ slug }) => slug === "porter-stout-and-guinness"
  );

  assert.ok(storyline);
  assert.equal(
    getStorylineTimelineHref(storyline),
    "/?tags=Porter%2CStout%2CGuinness%2CImperial+Stout%2CRussian+Imperial+Stout&tagMode=any"
  );
});

test("membership and event content are preserved while milestones are sorted", () => {
  const storyline = STORYLINES.find(
    ({ slug }) => slug === "india-pale-ale"
  );
  assert.ok(storyline);

  const events: TimelineEvent[] = [
    {
      id: "newer",
      title: "Existing newer title",
      description: "Existing newer description",
      event_date: "2000-01-01",
      historical_year: null,
      image_url: null,
      created_at: null,
      tags: [{ id: "ipa", name: "IPA" }],
    },
    {
      id: "unrelated",
      title: "Existing unrelated title",
      description: "Existing unrelated description",
      event_date: "1900-01-01",
      historical_year: null,
      image_url: null,
      created_at: null,
      tags: [{ id: "water", name: "Water" }],
    },
    {
      id: "older",
      title: "Existing older title",
      description: "Existing older description",
      event_date: "1800-01-01",
      historical_year: null,
      image_url: null,
      created_at: null,
      tags: [{ id: "ipa", name: "IPA" }],
    },
  ];
  const snapshot = structuredClone(events);

  const milestones = getEventsForStoryline(events, storyline);

  assert.deepEqual(milestones.map(({ id }) => id), ["older", "newer"]);
  assert.deepEqual(events, snapshot);
  assert.equal(milestones[0]?.title, "Existing older title");
  assert.equal(
    milestones[0]?.description,
    "Existing older description"
  );
});
