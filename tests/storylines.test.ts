import assert from "node:assert/strict";
import test from "node:test";
import { getEventsForStoryline, getStorylinesForEvent } from "../src/lib/eventStorylines.ts";
import { filterTimelineEvents } from "../src/components/timelineFiltering.ts";
import { parseTimelineUrlState } from "../src/components/timelineUrlState.ts";
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

test("the Storyline collection includes the labor and consolidation narratives", () => {
  assert.equal(STORYLINES.length, 40);

  const labor = STORYLINES.find(
    ({ slug }) => slug === "beer-labor-and-workers"
  );
  const consolidation = STORYLINES.find(
    ({ slug }) =>
      slug === "brewing-empires-and-industry-consolidation"
  );

  assert.deepEqual(labor?.tagNames, ["Labor"]);
  assert.deepEqual(consolidation?.tagNames, ["Industry Consolidation"]);
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

test("British Ale requires UK context and at least one relevant style or tradition", () => {
  const storyline = STORYLINES.find(({ slug }) => slug === "british-ale-beyond-ipa");
  assert.ok(storyline);
  const fixtures: TimelineEvent[] = [
    ["uk-mild", "United Kingdom", "Mild"],
    ["uk-pale", "United Kingdom", "Pale Ale"],
    ["uk-cask", "United Kingdom", "Cask Beer"],
    ["uk-bitter", "United Kingdom", "Bitter"],
    ["slovenian-pale", "Slovenia", "Pale Ale", "Modern Craft Beer"],
    ["croatian-pale", "Croatia", "Pale Ale", "Modern Craft Beer"],
    ["us-pale", "USA", "Pale Ale", "Modern Craft Beer"],
    ["german-pale", "Germany", "Pale Ale", "Modern Craft Beer"],
    ["uk-unrelated", "United Kingdom", "Lager"],
    ["untagged"],
  ].map(([id, ...names], index) => ({
    id, title: id, description: "Membership test fixture",
    historical_year: 1800 + index, event_date: null, image_url: null, created_at: null,
    tags: names.map((name) => ({ id: name, name })),
  }));
  const snapshot = structuredClone(fixtures);
  const expected = ["uk-mild", "uk-pale", "uk-cask", "uk-bitter"];
  const members = getEventsForStoryline(fixtures, storyline);
  assert.deepEqual(members.map(({ id }) => id), expected);
  for (const event of fixtures) {
    assert.equal(
      getStorylinesForEvent(event).some(({ slug }) => slug === storyline.slug),
      expected.includes(event.id)
    );
  }

  const href = getStorylineTimelineHref(storyline);
  assert.equal(href, "/?storyline=british-ale-beyond-ipa");
  const state = parseTimelineUrlState(new URL(href, "https://example.test").search, {
    minYear: 1, maxYear: 2026, urlTags: fixtures.flatMap((event) => event.tags ?? []),
  });
  assert.deepEqual(
    filterTimelineEvents({ ...state, events: fixtures, isOldestFirst: true }),
    members
  );
  const previews = fixtures.map((event) => ({
    ...event,
    tags: event.tags?.map((tag) => ({ ...tag, name: "" })),
  }));
  assert.deepEqual(
    filterTimelineEvents({
      ...state, events: previews, isOldestFirst: true,
      urlTags: fixtures.flatMap((event) => event.tags ?? []),
    }).map(({ id }) => id),
    expected
  );
  assert.deepEqual(
    filterTimelineEvents({ ...state, events: fixtures, searchQuery: "bitter" }).map(({ id }) => id),
    ["uk-bitter"]
  );
  // Ordinary topic filters must remain independent of Storyline membership.
  assert.equal(filterTimelineEvents({
    ...state, events: fixtures, storylineSlug: null, selectedTagIds: ["Pale Ale"],
  }).length, 5);
  assert.deepEqual(fixtures, snapshot);
  const modernCraftBeer = STORYLINES.find(({ slug }) => slug === "modern-craft-beer");
  assert.ok(modernCraftBeer);
  assert.equal(getEventsForStoryline(fixtures, modernCraftBeer).length, 4);
});

test("overview counts and featured fallback use the same membership as every Storyline", async () => {
  const { buildStorylineViews } = await import("../src/lib/eventStorylines.ts");
  const british = STORYLINES.find((s) => s.slug === "british-ale-beyond-ipa")!;
  const tags = [
    { id: "ale", name: "Pale Ale" },
    { id: "uk", name: "United Kingdom" },
  ];
  const makeEvent = (id: string, year: number): TimelineEvent => ({
    id, title: id, historical_year: year, event_date: null,
    description: null, image_url: null, created_at: null,
  });
  // Even a configured featured entry must satisfy the required geography tag.
  const events = [makeEvent(british.featuredEventId, 1800), makeEvent("eligible", 1900)];
  const eventTags = [
    { event_id: british.featuredEventId, tag_id: "ale" },
    { event_id: "eligible", tag_id: "ale" },
    { event_id: "eligible", tag_id: "uk" },
  ];
  const taggedEvents = events.map((event) => ({ ...event,
    tags: tags.filter((tag) => eventTags.some((relation) =>
      relation.event_id === event.id && relation.tag_id === tag.id)),
  }));
  const views = buildStorylineViews({ events, tags, eventTags });
  for (const view of views) {
    const matches = getEventsForStoryline(taggedEvents, view.storyline);
    assert.equal(view.entryCount, matches.length, view.storyline.slug);
    const filtered = filterTimelineEvents({
      events: taggedEvents, activeCategory: null, startYear: -13000, endYear: 2026,
      selectedTagIds: [], tagFilterMode: "all", isOldestFirst: true,
      searchQuery: "", storylineSlug: view.storyline.slug, urlTags: tags,
    });
    assert.deepEqual(filtered.map((e) => e.id), matches.map((e) => e.id));
  }
  const view = views.find((v) => v.storyline.slug === british.slug)!;
  assert.equal(view.entryCount, 1);
  assert.equal(view.featuredEvent?.id, "eligible");
});
