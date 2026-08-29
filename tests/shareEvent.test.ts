import assert from "node:assert/strict";
import test from "node:test";
import { shareEvent } from "../src/lib/shareEvent.ts";

const data = {
  title: "Test event",
  text: "Explore Test event on Beer Chronicles.",
  url: "https://beer-chronicles.org/events/123/test-event",
};

test("uses native sharing with event-specific canonical data when available", async () => {
  let sharedData;
  let copied = false;

  const result = await shareEvent(data, {
    share: async (receivedData) => {
      sharedData = receivedData;
    },
    copy: async () => {
      copied = true;
      return true;
    },
  });

  assert.equal(result, "shared");
  assert.deepEqual(sharedData, data);
  assert.equal(copied, false);
});

test("copies the canonical URL when native sharing is unavailable", async () => {
  let copiedUrl;

  const result = await shareEvent(data, {
    copy: async (url) => {
      copiedUrl = url;
      return true;
    },
  });

  assert.equal(result, "copied");
  assert.equal(copiedUrl, data.url);
});

test("treats cancellation as normal without attempting clipboard fallback", async () => {
  let copied = false;
  const cancellation = Object.assign(new Error("cancelled"), {
    name: "AbortError",
  });

  const result = await shareEvent(data, {
    share: async () => {
      throw cancellation;
    },
    copy: async () => {
      copied = true;
      return true;
    },
  });

  assert.equal(result, "cancelled");
  assert.equal(copied, false);
});

test("falls back to copying after a non-cancellation share failure", async () => {
  let copiedUrl;

  const result = await shareEvent(data, {
    share: async () => {
      throw new Error("share failed");
    },
    copy: async (url) => {
      copiedUrl = url;
      return true;
    },
  });

  assert.equal(result, "copied");
  assert.equal(copiedUrl, data.url);
});

test("reports clipboard failure", async () => {
  const result = await shareEvent(data, {
    copy: async () => false,
  });

  assert.equal(result, "failed");
});
