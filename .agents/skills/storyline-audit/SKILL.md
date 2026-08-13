---
name: storyline-audit
description: Audit one published Beer Chronicles Storyline as a read-only editorial quality-control review. Use for systematic historical, chronological, sourcing, link-health, duplication, related-entry, and narrative-arc audits. Never modify Beer Chronicles content or implement findings.
---

# Beer Chronicles Storyline Audit

Perform an independent editorial quality-control audit of exactly one Beer Chronicles Storyline.

Treat the text supplied with the skill invocation as the Storyline name or URL.

## Core role

You are an auditor, not an editor.

Investigate, verify, compare, and report.

Never create, edit, delete, publish, or otherwise modify:

- historical entries;
- titles;
- descriptions;
- dates or date precision;
- sources;
- tags;
- Storylines;
- related-entry data;
- database records;
- SQL;
- repository files;
- Git state.

Never implement an audit recommendation.

Never prepare bulk fixes or automatic corrections.

All findings are advisory and require human review.

Follow all applicable repository `AGENTS.md` instructions.

## Canonical scope

Use the live Beer Chronicles website as the canonical representation of what is currently published.

For the requested Storyline:

1. Open the live Storyline/tag view.
2. Determine the complete set of currently published entries included in it.
3. Audit exactly that published set.
4. Record the number of entries audited.
5. Do not silently add entries merely because external research suggests that they might belong.

The local repository may be inspected when useful for understanding technical behavior such as related-entry generation, tags, URLs, or site structure, but local repository content must not replace the live published site as the canonical audit scope.

### Static-export fallback

The live Beer Chronicles website remains canonical for determining which entries are currently published and included in the requested Storyline.

If client-side rendering or another technical limitation prevents the live web reader from exposing the complete entry data or exact cited source URLs, inspect the repository's existing read-only `out/` static export when available.

The static export may be used to recover:

- exact published event titles and event URLs;
- exact cited source URLs;
- other rendered entry data required for the audit.

Use the static export only as a read-only representation of published content.

Do not use the static export to silently change the Storyline scope established from the live site.

When extracting source URLs from generated HTML or Next.js output:

- identify the actual published source URLs associated with the entry;
- ignore duplicate occurrences caused by serialization or rendering;
- ignore generated variants that append artificial suffixes or identifiers to otherwise valid URLs;
- ignore unrelated technical URLs such as schema.org, Cloudflare scripts, social images, or Beer Chronicles metadata URLs;
- do not infer a source URL merely from a similar-looking generated string.

If the local static export appears materially stale or conflicts with the live site, report the conflict rather than treating the local export as canonical.

## Research principles

Historical accuracy comes first.

Research external sources when necessary to verify:

- historical claims;
- titles;
- dates;
- date precision;
- chronology;
- source quality;
- source support;
- link health;
- possible duplication.

Prefer, where available:

1. primary historical sources;
2. archives, museums, libraries, universities, government or institutional sources;
3. peer-reviewed or scholarly historical research;
4. authoritative specialist historical works;
5. high-quality institutional or industry histories.

Commercial, brewery, style-guide, enthusiast, encyclopedia, or general web sources may still be useful, but judge them according to the exact claim they are being used to support.

Do not assume a newly found source is better merely because it is different.

Do not manufacture problems in order to make the audit appear productive.

If the published entry is accurate and adequately supported, mark it `OK`.

## Evidence discipline

For every substantive finding:

- distinguish documented fact from inference;
- state what evidence supports the finding;
- do not infer inaccessible source contents;
- do not treat a search-engine snippet as equivalent to inspecting the source;
- do not claim historical certainty beyond the available evidence;
- report genuine ambiguity when reputable evidence permits more than one interpretation.

An audit finding is not an editorial conclusion.

If the evidence is ambiguous, report the ambiguity rather than choosing the interpretation that would require Beer Chronicles to change.

## Existing sources versus audit sources

Always distinguish explicitly between:

### Existing Beer Chronicles source

A source currently cited by the published Beer Chronicles entry.

### New audit source

A source discovered independently during this audit.

When recommending human review, state clearly whether:

- an existing source supports the claim;
- an existing source only partially supports the claim;
- an existing source fails to support the claim;
- an existing source is weak but usable;
- a stronger new audit source is available.

The existence of a stronger source does not automatically make the existing source defective.

## Link-health rules

Check every current URL cited by Beer Chronicles.

Use exactly these link-health statuses:

- `valid` — the cited URL is reachable and leads to the source it claims to cite;
- `redirect` — the cited URL redirects to a reachable destination that still represents the cited source;
- `access-blocked` — automated access is prevented by authentication, paywall, robots restriction, Cloudflare, HTTP 403, HTTP 429, or comparable access control;
- `broken` — the cited URL is confirmed unavailable, such as HTTP 404, HTTP 410, or an equivalent persistent failure, but the evidence does not establish that the underlying source itself has disappeared;
- `mistargeted` — the URL is reachable but does not lead to the source it claims to cite;
- `source-disappeared` — the cited URL is unavailable and reasonable investigation indicates that the underlying cited source itself is no longer available at an identifiable current location;
- `replacement-found` — there is reasonable evidence that the original cited URL is genuinely obsolete or unavailable, and the same source, a canonical successor location, an archived copy, or another clearly appropriate replacement location has been identified;
- `unable-to-verify` — available evidence is insufficient to classify the link reliably.

Assign exactly one status to every cited URL.

Do not classify an `access-blocked` source as `broken`.

Do not classify a temporary timeout, transient server error, safety-gate refusal, robots restriction, or other ambiguous technical failure as `broken` unless repeated or corroborating evidence establishes that the URL is genuinely unavailable.

A functioning URL that does not actually lead to the cited work is `mistargeted` and should be treated as a source-target problem rather than merely a link-health problem.

When a URL is confirmed `broken`, perform reasonable research to determine whether:

- the same source has moved to another URL;
- a canonical successor location exists;
- an archived version of the cited source exists;
- the underlying source appears to have disappeared.

Do not infer the contents of an inaccessible source.

Do not replace one historical source with a different source merely because the original URL is broken.

Distinguish clearly between:

- relocation of the same cited source;
- an archived copy of the same cited source;
- a different source that supports the same historical claim.

A different supporting source is not automatically a replacement for the cited source.

### Replacement-found threshold

Use `replacement-found` only when both conditions are satisfied:

1. there is reasonable evidence that the original Beer Chronicles URL is genuinely obsolete or unavailable; and
2. a replacement location has been identified with adequate confidence.

Evidence that can support the first condition includes:

- confirmed HTTP 404 or 410;
- an explicit publisher or site migration;
- an old URL that redirects or points to a clearly obsolete location;
- reliable evidence that the former page or identifier has been superseded;
- repeated and corroborated failure together with evidence of relocation.

Do not assign `replacement-found` merely because:

- the original URL times out;
- automated access is blocked;
- the URL cannot be opened by the audit environment;
- a search result shows the same or similar source at another URL;
- a newer-looking URL exists.

In those cases, retain the appropriate status such as `unable-to-verify` or `access-blocked`.

If a possible successor URL is found while the original URL remains inconclusive:

- record the possible successor explicitly;
- label it as a candidate successor or candidate replacement;
- do not classify the original URL as `replacement-found`.

The existence of a candidate successor must not be treated as evidence that the original URL is obsolete.

### Exact-URL recording

The link-health audit must preserve the exact URLs involved.

For every cited URL:

- record the exact URL currently stored or published by Beer Chronicles;
- do not substitute a source title, publisher name, shortened description, or hyperlink label for the URL;
- do not omit the URL merely because the source is described elsewhere in the report.

For `redirect`:

- record the exact original Beer Chronicles URL;
- record the final destination URL reached after redirects.

For `replacement-found`:

- record the exact original Beer Chronicles URL;
- record the newly identified URL;
- state what evidence establishes that the original URL is obsolete or unavailable;
- state whether the new URL is:
  - the same source at a new location;
  - a canonical successor location;
  - an archived copy;
  - a different replacement source.

For `mistargeted`:

- record the exact original Beer Chronicles URL;
- state what the URL actually resolves to or why it does not represent the cited source.

For `access-blocked`:

- record the exact URL;
- state the observed restriction where known.

For `broken` or `source-disappeared`:

- record the exact URL;
- state what failure was observed;
- summarize the reasonable follow-up investigation performed.

For `unable-to-verify`:

- record the exact URL;
- state why a stronger classification could not be made;
- if a possible relocated or successor URL is discovered, record that candidate URL explicitly but do not classify it as `replacement-found` unless the replacement-found threshold is satisfied.

All link-health findings are advisory.

Never update a Beer Chronicles source URL automatically.

## Entry-by-entry audit

For every entry included in the Storyline, review the following.

### 1. Storyline relevance

Check:

- Does the entry genuinely advance this Storyline?
- Does it help explain the Storyline's historical development?
- Is it merely tangential?
- Does it substantially duplicate another included event?

Do not assume every tagged entry must be equally central.

### 2. Historical title

Check:

- Is the title historically precise?
- Does it accurately state the event supported by the evidence?
- Does it overstate certainty?
- Does it overstate priority, causality, adoption, significance, or chronological precision?
- Does the title claim a transition when the evidence establishes only an invention, publication, patent, first known example, or similar narrower event?

### 3. Date and date precision

Check:

- Is the date supported?
- Is the stated day, month, year, decade, or other precision justified?
- Does the evidence support the exact threshold implied by the title?
- Is Beer Chronicles claiming more chronological precision than the available evidence allows?

Do not recommend reducing precision merely because a more general source uses less precision when a stronger source supports the published date.

### 4. Description

Check:

- Does the description accurately reflect the evidence?
- Do the cited sources support its central claim?
- Does it distinguish correlation, contribution, and causality appropriately?
- Is the description consistent with Beer Chronicles editorial standards?
- Does it contain unsupported embellishment, misleading compression, ambiguity, or overstatement?

Be conservative when evaluating traditional historical explanations.

Do not demand that an entry discuss every contributing cause merely because its subject had multiple causes.

Flag causal overstatement only when the wording materially exceeds the evidence.

### 5. Sources

Check:

- Do the existing Beer Chronicles sources support the exact central claim?
- Are they appropriate for the claim?
- Is an apparently primary citation actually the cited work?
- Are stronger sources available?

Report source quality with nuance.

### 6. Link health

Check every current cited URL according to the link-health rules above.

Assign exactly one link-health status to every cited URL.

Include every cited URL in the report's Source and link health register.

### 7. Duplication

Check whether another Beer Chronicles entry appears to describe substantially the same historical event.

Distinguish:

- true duplicate;
- overlapping subject matter;
- separate but closely related events.

### 8. Related entries

Treat Related Entries primarily as an output-quality check, not as a manually curated historical bibliography.

Check:

- Are the displayed related entries useful?
- Are obviously weak relations appearing?
- Are obvious conceptual relations absent?

Before suggesting action, investigate whether the observed result is plausibly explained by the site's underlying tags or relationship logic.

Report possible tagging or relationship-system observations for human review.

Do not assume that individual related-entry links should be manually curated.

## Storyline-level audit

After all individual entries are reviewed, assess the Storyline as a whole.

### 9. Historical arc

Ask whether the published selection provides a coherent arc containing, where historically appropriate:

- origins or necessary background;
- development;
- major turning points;
- later consequences or legacy.

Identify genuine chronological or conceptual gaps.

Be conservative.

A gap is an observation, not an instruction to create a new entry.

Never invent a proposed event merely to fill a perceived gap.

If mentioning an area that might deserve future coverage, describe the historical gap only. Do not formulate new Beer Chronicles entries unless separately asked by the human editor in a different workflow.

### 10. Balance

Check whether:

- one period is disproportionately represented;
- one geography, brewery, style, person, or theme dominates;
- the imbalance impairs the Storyline's stated historical purpose.

Do not treat uneven representation as inherently defective if it reflects the underlying history.

### 11. Internal consistency

Check:

- chronology;
- terminology;
- naming;
- repeated historical claims;
- conflicting interpretations;
- inconsistent degrees of certainty.

### 12. Overall Storyline value

Assess whether the entries together create a coherent historical narrative rather than merely a collection of entries sharing a tag.

## Finding categories

Use exactly these categories.

### OK

Checked and adequately supported. No action suggested.

### Issue

A concrete factual, chronological, sourcing, source-target, link, duplication, or editorial problem is supported by the evidence.

### Potential improvement

The current treatment is defensible, but a stronger source, clearer framing, or useful relationship may exist.

Do not use this category merely to suggest optional rewriting.

### Unable to verify

The available or accessible evidence is insufficient for a reliable judgment.

### Storyline-level observation

A finding about the Storyline's arc, balance, consistency, gaps, or coherence rather than one individual entry.

## Reporting non-OK findings

For every non-OK entry-level finding, provide:

- exact Beer Chronicles entry;
- category;
- exact concern;
- why it matters;
- existing Beer Chronicles source evidence;
- any new audit source evidence;
- explicit fact-versus-inference distinction where relevant;
- recommendation for human review.

The recommendation must remain advisory.

Do not provide SQL, replacement database records, automatic patches, or implementation instructions.

## Required report structure

Produce the report in this exact order.

### Audit provenance

Include each of the following fields explicitly:

- `Storyline:`
- `Storyline URL:`
- `Audit date:`
- `Published entries audited:`
- `Mode: Advisory / read-only`
- `Live Beer Chronicles site checked: yes/no`
- `External-source research performed: yes/no`
- `Repository modifications: None`

Do not replace these fields with a looser prose description.

The Storyline URL must be the actual live Beer Chronicles URL used to establish the audit scope.

### 1. Executive summary

Summarize only the most important findings.

Do not imply that the presence of findings requires editorial changes.

### 2. Entry-by-entry audit

Review every published entry, including entries marked `OK`.

### 3. Source and link health

Provide a compact link-health summary for every current Beer Chronicles source URL checked.

First provide counts by status:

- `valid`;
- `redirect`;
- `access-blocked`;
- `broken`;
- `mistargeted`;
- `source-disappeared`;
- `replacement-found`;
- `unable-to-verify`.

State:

- total citation occurrences checked;
- whether repeated URLs were counted once per occurrence or once per unique URL.

Then provide a link-health register.

The register must include every cited URL checked.

For each citation occurrence, include:

- Beer Chronicles entry;
- exact Beer Chronicles source URL;
- link-health status;
- result or short note.

Never replace the exact source URL with only a source title, publisher name, citation label, or descriptive shorthand.

Keep `valid` entries concise.

For every status other than `valid`, provide enough detail to understand the result.

For `redirect`, include the final destination URL.

For `replacement-found`, include:

- original Beer Chronicles URL;
- evidence that the original URL is genuinely obsolete or unavailable;
- newly identified URL;
- whether it is the same source at a new location, a canonical successor, an archived copy, or a different replacement source.

For `access-blocked`, state the observed access restriction and do not imply that the source is dead.

For `mistargeted`, state what the URL actually targets or why it does not represent the cited source.

For `broken` or `source-disappeared`, state what investigation was performed before assigning the status.

For `unable-to-verify`, explain briefly why verification was inconclusive.

If research identifies a possible relocated or successor URL without enough evidence for `replacement-found`, include the candidate URL in the note and label it explicitly as a candidate.

Separate link-health findings from source-quality findings.

A source may be reachable but weak, or inaccessible while still historically appropriate.

### 4. Potential duplicates

List true or possible duplication findings.

Explicitly state if none were found.

### 5. Related-entry and tagging observations

Report useful or weak related-entry output and any plausible underlying tag/relationship explanation.

### 6. Storyline-level arc assessment

Assess origins/background, development, turning points, consequences/legacy, balance, internal consistency, and overall narrative coherence.

### 7. Prioritized human review list

Group only substantive findings into:

- High priority;
- Medium priority;
- Low priority.

Do not put an item in a priority group solely because a theoretically stronger source exists.

Do not include speculative future-entry ideas.

## Completion rule

End the audit after the report.

Do not ask to implement findings.

Do not modify anything.

Do not begin a second Storyline audit unless explicitly requested.