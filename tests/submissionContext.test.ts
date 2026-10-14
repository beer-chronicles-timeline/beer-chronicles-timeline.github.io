import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ChallengesPage from "../src/app/challenges/page.tsx";
import SubmitPage from "../src/app/submit/page.tsx";
import { CONTACT_EMAIL } from "../src/lib/contact.ts";
import { getCorrectionSubmissionPath } from "../src/lib/eventUrls.ts";
import {
  getChallengeSubmissionPath,
  RESEARCH_CHALLENGES,
} from "../src/lib/researchChallenges.ts";
import {
  buildSubmissionPayload,
  CHALLENGE_SUBMISSION_TYPE,
  CORRECTION_SUBMISSION_TYPE,
  SOURCE_SUBMISSION_TYPE,
  getSubmissionContext,
  getSubmissionRequirements,
  selectSubmissionType,
  type SubmissionFields,
  type SubmissionType,
} from "../src/lib/submissionContext.ts";

const fields: SubmissionFields = {
  name: "Test contributor",
  email: "contributor@example.org",
  title: "A partial research finding",
  description: "This source helps narrow the question but does not fully resolve it.",
  eventDate: "",
  datePrecision: "",
  dateUncertainty: "The source supports a range rather than an exact date.",
  sources: "https://example.org/archive/item",
};

function contextFor(id: string) {
  const url = new URL(getChallengeSubmissionPath(id), "https://beer-chronicles.org");
  const context = getSubmissionContext(url.search);
  if (context.type !== "challenge" || !context.challenge) {
    throw new Error("Missing challenge context");
  }
  return { type: "challenge" as const, challenge: context.challenge };
}

test("each challenge link selects its own question with a stable, unique identifier", () => {
  assert.equal(new Set(RESEARCH_CHALLENGES.map((challenge) => challenge.id)).size, RESEARCH_CHALLENGES.length);

  for (const challenge of RESEARCH_CHALLENGES) {
    const context = contextFor(challenge.id);

    assert.equal(context.type, "challenge");
    if (context.type !== "challenge" || !context.challenge) throw new Error("Missing challenge context");
    assert.equal(context.challenge.id, challenge.id);
    assert.equal(context.challenge.title, challenge.title);
    assert.equal(context.challenge.question, challenge.question);
  }
});

test("the rendered challenge buttons carry the correct question into the submission form", () => {
  const markup = renderToStaticMarkup(createElement(ChallengesPage));
  const links = [...markup.matchAll(/href="([^"]+)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .filter((href) => href.startsWith("/submit?"));

  assert.equal(links.length, RESEARCH_CHALLENGES.length);
  const selectedIds = links.map((href) => {
    const context = getSubmissionContext(new URL(href, "https://beer-chronicles.org").search);
    assert.equal(context.type, "challenge");
    if (context.type !== "challenge" || !context.challenge) throw new Error("Missing challenge context");
    return context.challenge.id;
  });
  assert.deepEqual(selectedIds, RESEARCH_CHALLENGES.map((challenge) => challenge.id));
});

test("the submission page can render for static export without a browser or URL context", () => {
  assert.doesNotThrow(() => renderToStaticMarkup(createElement(SubmitPage)));
});

test("challenge background links use registered published event paths", () => {
  const registry = JSON.parse(
    readFileSync(new URL("../src/data/published-event-paths.json", import.meta.url), "utf8")
  ) as Record<string, string[]>;

  for (const challenge of RESEARCH_CHALLENGES) {
    const [, route, id, slug] = challenge.backgroundHref.split("/");

    assert.equal(route, "events");
    assert.ok(registry[id]?.includes(slug), challenge.backgroundHref);
  }
});

test("a challenge submission preserves the selected question when the finding title is edited", () => {
  const context = contextFor("george-hodgson-death-date");
  assert.equal(context.type, "challenge");
  if (context.type !== "challenge" || !context.challenge) throw new Error("Missing challenge context");

  const payload = buildSubmissionPayload(context, fields);
  assert.ok("challengeId" in payload);

  assert.equal(payload.title, fields.title);
  assert.equal(payload.submissionType, CHALLENGE_SUBMISSION_TYPE);
  assert.equal(payload.challengeId, "george-hodgson-death-date");
  assert.equal(payload.challengeTitle, context.challenge.title);
  assert.equal(payload.challengeQuestion, context.challenge.question);
  assert.equal(payload.challengeUrl, "https://beer-chronicles.org/challenges#george-hodgson-death-date");
  assert.equal(payload.description, fields.description);
  assert.equal(payload.sources, fields.sources);
  assert.equal(payload.dateUncertainty, fields.dateUncertainty);
  assert.equal(payload.eventDate, "");
  assert.equal(payload.datePrecision, "");
  assert.equal(payload._subject, `Beer History Research Finding from ${fields.name}: ${context.challenge.title}`);
});

test("challenge findings require sources while allowing dates to remain unresolved", () => {
  for (const challenge of RESEARCH_CHALLENGES) {
    assert.deepEqual(getSubmissionRequirements(contextFor(challenge.id)), {
      date: false,
      sources: true,
    });
  }
});

test("challenge context comes from the approved questions rather than supplied URL text", () => {
  const context = getSubmissionContext(
    "?submissionType=challenge&challengeId=george-hodgson-birth-date&challengeTitle=Other+person&challengeQuestion=Different+question"
  );

  assert.equal(context.type, "challenge");
  if (context.type !== "challenge" || !context.challenge) throw new Error("Missing challenge context");
  assert.equal(context.challenge.title, "George Hodgson’s Birth Date");
  assert.notEqual(context.challenge.question, "Different question");
});

test("missing or stale challenge links require choosing an approved question before sending", () => {
  for (const search of [
    "?submissionType=challenge",
    "?submissionType=challenge&challengeId=unknown",
  ]) {
    const context = getSubmissionContext(search);
    assert.deepEqual(context, { type: "challenge", challenge: null });
    assert.throws(() => buildSubmissionPayload(context, fields), /choose an open research challenge/i);
  }
  assert.deepEqual(getSubmissionContext("?challengeId=george-hodgson-birth-date"), { type: "entry" });
});

test("existing event correction links retain their context, optional dates and sources, and payload", () => {
  const url = new URL(
    getCorrectionSubmissionPath("event-id", "Event title"),
    "https://beer-chronicles.org"
  );
  const context = getSubmissionContext(url.search);

  assert.deepEqual(context, {
    type: "correction",
    eventTitle: "Event title",
    eventUrl: "https://beer-chronicles.org/events/event-id/event-title",
  });
  assert.deepEqual(getSubmissionRequirements(context), { date: false, sources: false });
  assert.deepEqual(buildSubmissionPayload(context, fields), {
    ...fields,
    submissionType: CORRECTION_SUBMISSION_TYPE,
    eventUrl: "https://beer-chronicles.org/events/event-id/event-title",
    _subject: `Beer History Correction Suggestion from ${fields.name}`,
  });
});

test("corrections can open without event parameters and do not prefill foreign entry links", () => {
  assert.deepEqual(getSubmissionContext("?submissionType=correction"), {
    type: "correction", eventTitle: "", eventUrl: "",
  });
  assert.deepEqual(getSubmissionContext("?submissionType=correction&eventTitle=Event"), {
    type: "correction", eventTitle: "Event", eventUrl: "",
  });
  assert.deepEqual(getSubmissionContext("?submissionType=correction&eventTitle=Event&eventUrl=https%3A%2F%2Fexample.org%2Fevents%2Fid%2Ftitle"), {
    type: "correction", eventTitle: "Event", eventUrl: "",
  });
});

test("ordinary new entries retain their required evidence and existing submission payload", () => {
  const context = getSubmissionContext("");

  assert.deepEqual(context, { type: "entry" });
  assert.deepEqual(getSubmissionRequirements(context), { date: true, sources: true });
  assert.deepEqual(buildSubmissionPayload(context, fields), {
    ...fields,
    _subject: `New Beer History Entry Submission from ${fields.name}`,
  });
});

test("visitors can select all four contribution types from a direct visit", () => {
  const initial = getSubmissionContext("");
  const cases: Array<[SubmissionType, boolean, boolean]> = [
    ["entry", true, true],
    ["correction", false, false],
    ["source", false, true],
    ["challenge", false, true],
  ];
  for (const [type, date, sources] of cases) {
    const context = selectSubmissionType(initial, type);
    assert.equal(context.type, type);
    assert.deepEqual(getSubmissionRequirements(context), { date, sources });
  }
});

test("switching an existing-entry correction to an additional source retains the entry context", () => {
  const initial = getSubmissionContext(new URL(
    getCorrectionSubmissionPath("event-id", "Event title"), "https://beer-chronicles.org"
  ).search);
  const context = selectSubmissionType(initial, "source");
  assert.deepEqual(context, {
    type: "source", eventTitle: "Event title",
    eventUrl: "https://beer-chronicles.org/events/event-id/event-title",
  });
  assert.deepEqual(buildSubmissionPayload(context, fields), {
    ...fields,
    submissionType: SOURCE_SUBMISSION_TYPE,
    eventUrl: "https://beer-chronicles.org/events/event-id/event-title",
    _subject: `Beer History Additional Source from ${fields.name}`,
  });
});

test("direct corrections can identify the entry by title without requiring an entry URL", () => {
  const context = selectSubmissionType(getSubmissionContext(""), "correction");
  const payload = buildSubmissionPayload(context, fields);
  assert.ok("eventUrl" in payload);
  assert.equal(payload.title, fields.title);
  assert.equal(payload.eventUrl, "");
  assert.equal(payload.submissionType, CORRECTION_SUBMISSION_TYPE);
});

test("an edited entry link replaces prefilled context while an invalid link is rejected", () => {
  const context = getSubmissionContext("?submissionType=correction&eventTitle=Event&eventUrl=https%3A%2F%2Fbeer-chronicles.org%2Fevents%2Fold%2Fold-title");
  const payload = buildSubmissionPayload(context, {
    ...fields, eventUrl: "https://beer-chronicles.org/events/new/new-title",
  });
  assert.ok("eventUrl" in payload);
  assert.equal(payload.eventUrl, "https://beer-chronicles.org/events/new/new-title");
  assert.throws(() => buildSubmissionPayload(context, {
    ...fields, eventUrl: "https://example.org/events/new/new-title",
  }), /Beer Chronicles entry URL/);
});

test("switching to a new entry or a challenge does not send a leftover entry link", () => {
  const initial = getSubmissionContext("?submissionType=source&eventTitle=Event&eventUrl=https%3A%2F%2Fbeer-chronicles.org%2Fevents%2Fid%2Ftitle");
  const withEntryLink = { ...fields, eventUrl: "https://beer-chronicles.org/events/id/title" };
  assert.ok(!("eventUrl" in buildSubmissionPayload(selectSubmissionType(initial, "entry"), withEntryLink)));
  assert.ok(!("eventUrl" in buildSubmissionPayload(contextFor("schieffer-end-of-brewing"), withEntryLink)));
});

test("the initially rendered page offers every type and associates the selector with its form", () => {
  const markup = renderToStaticMarkup(createElement(SubmitPage));
  const selector = markup.match(/<select\b[^>]*id="submissionType"[^>]*>[\s\S]*?<\/select>/)?.[0];
  assert.ok(selector);
  assert.match(selector, /form="contribution-form"/);
  assert.match(markup, /<form\b[^>]*id="contribution-form"/);
  for (const type of ["entry", "correction", "source", "challenge"]) {
    assert.ok(selector.includes(`value="${type}"`));
  }
});

test("name and email support autofill and required fields have visible labels", () => {
  const markup = renderToStaticMarkup(createElement(SubmitPage));
  for (const id of ["name", "email"]) {
    const input = markup.match(new RegExp(`<input\\b[^>]*id="${id}"[^>]*>`))?.[0];
    const label = markup.match(new RegExp(`<label\\b[^>]*for="${id}"[^>]*>([\\s\\S]*?)<\\/label>`))?.[1];
    assert.ok(input);
    assert.match(input, new RegExp(`autocomplete="${id}"`, "i"));
    assert.ok(label?.includes("(required)"));
  }
  const dateLabel = markup.match(/<label\b[^>]*for="datePrecision"[^>]*>([\s\S]*?)<\/label>/)?.[1];
  assert.ok(dateLabel?.includes("(required)"));
  const uncertaintyLabel = markup.match(/<label\b[^>]*for="dateUncertainty"[^>]*>([\s\S]*?)<\/label>/)?.[1];
  assert.ok(uncertaintyLabel?.includes("(optional)"));
});

test("the email alternative is present before the disabled form and keeps a raw mailto link for visitors without JavaScript", () => {
  const markup = renderToStaticMarkup(createElement(SubmitPage));
  const start = markup.indexOf("<!--email_off-->");
  const end = markup.indexOf("<!--/email_off-->");
  const form = markup.indexOf('<form id="contribution-form"');
  assert.ok(start >= 0 && end > start && form > end);
  assert.ok(markup.slice(start, end).includes(`href="mailto:${CONTACT_EMAIL}`));
  assert.ok(markup.slice(start, end).includes(`>${CONTACT_EMAIL}</a>`));
  assert.match(markup, /<noscript>[\s\S]*?form needs JavaScript[\s\S]*?<\/noscript>/);
});
