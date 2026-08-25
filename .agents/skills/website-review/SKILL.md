---
name: website-review
description: Perform a read-only complete or targeted audit of the Beer Chronicles website across product, content, UX, design, accessibility, technical, SEO, and growth concerns. Report evidence and recommendations without implementing findings.
---

# Beer Chronicles Website Review

Audit the website as a long-term, curated beer-history project. Inspect, evaluate, and recommend; never implement findings as part of the review.

Follow all repository `AGENTS.md` instructions.

## Role and scope

You are a reviewer, not an implementer. Do not edit code, content, data, repository files, or deployment state. End after the report.

Support two modes:

- **Complete review:** assess all nine dimensions below and rate each from 1 to 10.
- **Targeted review:** assess only the requested pages, features, viewports, or concerns. Do not force irrelevant dimensions or ratings into a narrow audit.

A normal website review may evaluate visible historical reliability and sourcing presentation, but it must not become a deep audit of one historical Storyline. Route that work to `storyline-audit`.

## Provenance and current state

Before reviewing, attempt to inspect the newest visible live state of `https://beer-chronicles.org` rather than relying on old observations or cached outputs. Reopen relevant pages and use a cache-busting query parameter when useful, while recognizing that this cannot guarantee deployment freshness.

Record what matters to reproducing and interpreting the review:

- review date;
- live or local environment;
- URLs and pages inspected;
- viewport/device sizes where relevant;
- visible current event count when available and useful;
- browser, client-rendering, cache, authentication, or tooling limitations;
- any local/static fallback used and possible staleness.

If the user reports current behavior from their browser that Codex cannot independently verify, label it exactly in substance as **user-confirmed current state; not independently verified by Codex**. It may inform scope, but do not present it as independent objective evidence.

## Evidence discipline

For every substantive finding, provide the affected page or feature and enough evidence to understand or reproduce it. Use observed behavior, screenshots, DOM/semantic inspection, measurements, or repeatable steps as appropriate. Separate observation from inference and state confidence when uncertainty matters.

Do not invent problems to make the review appear useful. Say when something is good enough. Distinguish current high-impact needs from lower-priority future opportunities.

## Complete-review dimensions

Rate each dimension from **1 to 10** and briefly justify the score. Ratings enable comparison over time; they are not issue severities.

### 1. Concept and distinctiveness

Assess whether the site immediately communicates its purpose as an interactive, curated beer-history timeline; whether Beer Chronicles has a recognizable identity; and whether its value is distinct from a general beer blog, encyclopedia clone, or hobby archive.

### 2. Content substance

Assess the relevance, historical significance, chronological breadth, international breadth, and balance of well-known milestones with less familiar but meaningful material. Do not equate quantity with quality.

### 3. Storytelling and thematic paths

Assess whether entries form coherent Storylines with origins, development, turning points, and later consequences; whether tags and related entries help readers follow themes; and whether the timeline tells connected history rather than storing isolated facts.

### 4. Source quality and historical reliability

Assess whether important claims are supportable, source targets are useful, date precision matches visible evidence, uncertainty is represented honestly, and myths or unsupported claims are avoided. Do not claim to have verified source content that was inaccessible.

### 5. UX and usability

Assess timeline comprehension, filtering, tags, categories, sorting, event detail views, discovery paths, mobile use, navigation between entries, feedback/correction flows, and whether exploration feels intuitive and inviting.

### 6. Design and visual identity

Assess typography, color, spacing, card and page layouts, consistency, readability, restraint, and whether the visual system supports a serious historical chronicle without becoming sterile, kitschy, or distracting.

### 7. Scalability

Assess current and near-term growth pragmatically. Look for concrete evidence that navigation, performance, filtering, tags, or overview will suffer. Do not recommend premature architecture for hypothetical 500- or 1,000-entry problems when the current structure and roughly the next 100 entries remain well served.

### 8. SEO potential

Assess discoverability of individual events and Storylines, titles, metadata, canonical/indexing behavior, sitemap and structured data where relevant, filtered/tag views as possible landing pages, search intent, and technical evidence. Distinguish potential from verified search performance.

### 9. Community and contribution potential

Assess curated ways to submit entries, suggest sources, report errors, and address open historical questions. Favor useful, maintainable participation over unnecessary accounts, forums, or uncontrolled publishing.

## Cross-cutting checks

Where relevant to the requested review, include:

- keyboard navigation, focus visibility/order, semantic structure, labels, contrast, zoom/reflow, and assistive-technology considerations;
- responsive behavior at representative mobile and desktop widths;
- performance evidence and user-perceived cost;
- broken links, errors, metadata, structured data, and static-export limitations;
- source and historical-integrity presentation without inventing historical conclusions.

## Findings and prioritization

Assign individual issues one severity, separate from dimension ratings:

- **Critical:** blocks core use or creates severe accessibility, data, security, or publication harm;
- **High:** materially harms key users, trust, discoverability, or a core workflow;
- **Medium:** meaningful but non-blocking degradation;
- **Low:** limited-impact defect or polish issue.

Include confidence when useful. Prioritize by impact and evidence, not cosmetic ease. Recommendations remain advisory.

## Optional post-review task prompts

The review itself remains read-only. Create or update repository files only when the user explicitly asks for post-review handoff prompts or similar artifacts.

When requested, turn the selected recommendations into separate, self-contained Markdown task prompts in the user-specified location. Each prompt should:

- route the future task to the appropriate project skill;
- preserve the finding's evidence, scope, and uncertainty without presenting unverified assumptions as facts;
- define concrete requirements, exclusions, and proportionate verification;
- restate relevant repository safeguards, including no editorial-data mutation and no commit, push, or deployment unless separately authorized;
- be usable in a fresh conversation without depending on the original review report.

Generating handoff prompts does not authorize implementing their recommendations. After creating them, stop unless the user separately requests implementation.

## Report structure

For every review, provide:

1. provenance, scope, and limitations;
2. executive assessment;
3. the single most important current priority;
4. prioritized findings with severity, evidence, and confidence where useful;
5. strengths and areas that are already good enough;
6. for complete reviews, all nine 1–10 ratings with concise justification;
7. exactly three concrete next actions with the greatest overall impact;
8. lower-priority future opportunities, only when useful.

Be honest, direct, and proportionate. Do not silently implement recommendations or ask to begin implementation. Stop after the report.
