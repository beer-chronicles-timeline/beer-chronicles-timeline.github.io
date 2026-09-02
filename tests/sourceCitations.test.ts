import assert from "node:assert/strict";
import test from "node:test";
import {
  getSourceLinkLabel,
  normalizeSourceUrl,
  parseSourceCitations,
} from "../src/lib/sourceCitations.ts";

test("pairs a citation paragraph with its following URL", () => {
  assert.deepEqual(
    parseSourceCitations(
      'Author. "Article title."\n\nhttps://example.com/article'
    ),
    [
      {
        text: ['Author. "Article title."'],
        urls: ["https://example.com/article"],
      },
    ]
  );
});

test("keeps multi-line bibliographic text with its URL", () => {
  assert.deepEqual(
    parseSourceCitations(
      'Author. "Article title."\nJournal, 2026.\nhttps://example.com/article'
    ),
    [
      {
        text: ['Author. "Article title."', "Journal, 2026."],
        urls: ["https://example.com/article"],
      },
    ]
  );
});

test("removes a complete inline URL from the displayed citation text", () => {
  assert.deepEqual(
    parseSourceCitations(
      'Publisher. "Article." https://example.com/path/'
    ),
    [
      {
        text: ['Publisher. "Article."'],
        urls: ["https://example.com/path/"],
      },
    ]
  );
});

test("preserves unlinked sources and URL-only sources", () => {
  assert.deepEqual(
    parseSourceCitations(
      "Personal communication\n\nPublisher. Article.\n\nhttps://example.com\n\nhttps://archive.example.org"
    ),
    [
      { text: ["Personal communication"], urls: [] },
      {
        text: ["Publisher. Article."],
        urls: ["https://example.com"],
      },
      { text: [], urls: ["https://archive.example.org"] },
    ]
  );
});

test("creates readable labels and normalizes www URLs", () => {
  assert.equal(normalizeSourceUrl("www.example.com/article"), "https://www.example.com/article");
  assert.equal(
    getSourceLinkLabel("https://www.example.com/article"),
    "View source on example.com"
  );
});
