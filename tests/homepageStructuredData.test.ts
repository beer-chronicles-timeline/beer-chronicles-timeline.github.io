import assert from "node:assert/strict";
import test from "node:test";
import { getHomepageStructuredData } from "../src/lib/homepageStructuredData.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

function makeEvent(id: string, title: string): TimelineEvent {
  return {
    id,
    title,
    description: null,
    event_date: null,
    historical_year: null,
    image_url: null,
    created_at: null,
    category: null,
    date_precision: null,
    sources: null,
  };
}

test("describes the homepage and only its rendered preview entries", () => {
  const previewEvents = [
    makeEvent("first-id", "First Event"),
    makeEvent("second-id", "Second Event"),
  ];
  const structuredData = getHomepageStructuredData(previewEvents);

  assert.deepEqual(
    structuredData["@graph"].map((entity) => entity["@type"]),
    ["WebSite", "CollectionPage", "ItemList"]
  );

  const itemList = structuredData["@graph"][2];
  assert.equal(itemList.numberOfItems, 2);
  assert.deepEqual(itemList.itemListElement, [
    {
      "@type": "ListItem",
      position: 1,
      name: "First Event",
      url: "https://beer-chronicles.org/events/first-id/first-event",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Second Event",
      url: "https://beer-chronicles.org/events/second-id/second-event",
    },
  ]);
});
