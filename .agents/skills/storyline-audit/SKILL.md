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

Check the current URLs cited by Beer Chronicles.

Distinguish between:

- working;
- working after redirect;
- dead, such as a confirmed 404 or equivalent;
- access-blocked, such as authentication, paywall, robots restriction, Cloudflare, or HTTP 403;
- mistargeted, where the URL works but does not lead to the source it claims to cite;
- unable to verify.

Do not classify an access-blocked source as dead.

A functioning URL that does not actually lead to the cited work is a source-target problem and should be reported separately.

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

Produce the report in this order.

### Audit provenance

Include:

- Storyline name;
- Storyline URL;
- audit date;
- number of published entries audited;
- mode: `Advisory / read-only`;
- live Beer Chronicles site checked: yes/no;
- external-source research performed: yes/no;
- repository modifications: `None`.

### 1. Executive summary

Summarize only the most important findings.

Do not imply that the presence of findings requires editorial changes.

### 2. Entry-by-entry audit

Review every published entry, including entries marked `OK`.

### 3. Source and link issues

Separate:

- dead links;
- redirects;
- access-blocked sources;
- mistargeted sources;
- unable-to-verify sources;
- source-quality observations.

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