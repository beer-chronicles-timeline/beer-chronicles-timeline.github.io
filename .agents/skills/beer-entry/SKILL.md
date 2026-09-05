---
name: beer-entry
description: Research and prepare a new or updated Beer Chronicles timeline entry, including research, conceptual duplicate checks, dates, tags, Beer Map integration, and copy-paste SQL proposals for human review. Never execute SQL or mutate editorial data.
---

# Beer Chronicles Entry Research and Proposal

Research and prepare an evidence-based entry or update. The user retains final editorial and database authority.

Follow all repository `AGENTS.md` instructions.

## Hard boundary

This is a research-and-proposal workflow. Never execute SQL, call Supabase mutation APIs, or directly insert, update, delete, or publish Beer Chronicles data.

Any SQL is an **unexecuted proposal for human review and manual execution by the user**. Generating it does not authorize running it.

Never invent historical facts, sources, relationships, or significance. Distinguish evidence, inference, and uncertainty. If reliable evidence is insufficient, stop rather than completing the entry speculatively.

## Workflow

### 1. Establish the request and current state

- Determine whether the user wants a new entry, an update, or research without SQL.
- Inspect the current live Beer Chronicles site as the canonical published state.
- For an update, recover or request the complete current record and sources before proposing changes that could overwrite verified work.
- Use local `out/` only as a read-only fallback when live rendering does not expose needed published details. Disclose staleness or conflicts.

### 2. Check duplicates and overlap

Before proposing any new entry, search the complete current published timeline, not just a search-results page, title list, or selected Storyline. Inspect the live timeline payload or another complete read-only source, check pagination/completeness, and record when it was retrieved. A database export is not required. If coverage is incomplete, disclose that limitation and do not label the candidate duplicate-cleared.

- Search titles, full descriptions, and sources for the event’s subject, mechanism, purpose, people, organizations, places, synonyms, translations, former names, and date variants. A different title, company, date precision, or vocabulary does not establish a distinct historical event.
- Read the complete records of plausible matches and inspect relevant Storylines. Look for the proposed development already explained inside another event, even when it is not in that event’s title or tags.
- Compare every candidate with the other entries in the proposed batch. Distinguish invention, patent grant, first practical installation, later adoption, and a product application only when sources establish genuinely different milestones. Do not split one development merely to increase the entry count.
- Record each credible overlap by existing UUID/title and decide: leave unchanged, enrich/correct in place, retag/link if justified and within scope, merge proposed coverage, or create a demonstrably distinct entry. Explain the historical distinction for retained near-matches.
- If an existing entry covers the essential event, do not insert another. Assess whether it should be extended; when SQL is requested, include the justified in-place update in that proposal, preserving verified text, sources, identity, and tags. If no extension is warranted, report why it stays unchanged.
- Repeat the duplicate check after research changes the candidate’s date or scope, and refresh live state before final SQL if the corpus may have changed. SQL title/UUID guards prevent accidental reruns; they do not detect conceptual duplicates.
- When a user identifies a missed duplicate, inspect both full records and correct the affected proposal before reusing it. If already published, prepare an explicit human-reviewed correction proposal; never silently delete or mutate records.

### 3. Research and evaluate sources

Prefer, where available:

1. primary historical sources;
2. archives, libraries, museums, universities, government and institutional sources;
3. peer-reviewed scholarship and scholarly monographs;
4. authoritative specialist historical works;
5. reliable industry or organizational histories appropriate to the claim.

Reliable sources need not be freely accessible online. Books, monographs, archival publications, and paywalled scholarship may be valid when publicly identifiable and verifiable. However:

- never claim to have inspected inaccessible content;
- bibliographic existence alone does not support a specific claim;
- disclose access limitations;
- do not infer contents from search snippets, metadata, abstracts that omit the claim, or secondary citations;
- use only claims supported by evidence actually inspected or reliably supplied by the user.

Make a serious effort to obtain independent corroboration. Do not add weak sources merely to reach an arbitrary count. If only one sufficient source is available, say so and assess whether it is adequate for the claim.

### 4. Prepare the editorial proposal

Write in American English for a broad public audience. Use factual but engaging historical prose without curator notes or invented narrative embellishment. A normal entry will often use two paragraphs, but evidence and clarity determine the appropriate length.

Propose the strongest precision the evidence supports:

- exact date;
- month;
- year;
- decade;
- century.

For prehistoric or other chronology outside ordinary database dates, inspect current repository behavior and verified schema before proposing fields. Never invent schema details.

Clearly present:

- proposed title;
- proposed date or historical year and precision;
- proposed description;
- proposed category;
- sources and what each supports;
- uncertainties or competing interpretations;
- proposed tags.

### 5. Tags and knowledge-graph context

- Prefer existing canonical tags.
- Keep tags sparse, reusable, central to the event, and supported by reliable evidence.
- Do not infer factual tag relationships from incidental words or loose associations.
- Consider relevant Storylines, people, breweries, laws, technologies, places, communities, and related entries.
- Report justified related-entry or broader knowledge-graph opportunities separately. Do not silently expand the SQL scope to implement them unless the user explicitly requested them.

### 6. Preserve verified work in updates

- Preserve supported existing facts and suitable existing sources.
- Explain proposed removals or changed certainty explicitly.
- Prefer an in-place update proposal when the record identity is verified.
- Never propose deletion merely for convenience. A user request to consider deletion still requires evidence and human approval.

## Beer Map is part of every new entry

Treat every new timeline entry, whether requested individually or in a batch, and its Beer Map coverage as one package. When geographical evidence is sufficient, prepare the actual matching map assignment in the same task without waiting for a separate map request. For an updated entry, check whether its assignment needs revision. Research-only requests receive map recommendations rather than implementation.

- Inspect `src/lib/mapLocations.ts` and the current map workflow. Reuse supported places and follow the existing coordinate, precision, and location-role conventions.
- Research the location of the actual historical milestone. Distinguish invention, patent jurisdiction, supplier base, brewery installation, and later adoption. Never infer an installation site from a company’s modern headquarters. Use a supported city/region/country scope when exact-site evidence is unavailable; if even that is unsupported, report the unresolved map location instead of inventing a pin.
- When preparing any new entry with SQL, prepare reviewable local map-assignment changes using `website-development`, keyed to the same fixed event UUIDs as the unexecuted SQL. Preserve existing assignments unless the research justifies a change. Database execution remains exclusively human; use the publication completion steps below for authorized repository changes.
- Verify that every retained new event produces its intended map assignment when supplied to the map builder, and that absent proposed events produce no markers. Check precision, location role, date label, and event link; run proportionate existing checks.
- Report timeline, tags/Storylines, and map readiness together. State that publication requires the user’s manual SQL execution and a subsequent authorized build/deployment containing both the data and map code. SQL alone cannot publish map assignments.

## SQL proposal

Produce SQL only when the evidence is sufficient and the current schema and record state have been verified. If necessary schema details are unavailable, identify what must be supplied instead of guessing.

The proposal must:

- be clearly labeled `UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED`;
- be copy-paste-ready for the verified Supabase/PostgreSQL schema;
- use an appropriate `BEGIN`/`COMMIT` transaction;
- use precise identifiers and `WHERE` clauses;
- preserve paragraph breaks and source formatting;
- preserve verified existing content during updates;
- avoid deletion unless explicitly requested and justified;
- prevent duplicate event-tag relationships;
- create or upsert only justified missing tags before linking them;
- assign or safely retain a new event UUID and link by that UUID, never only by title;
- ensure intended tags, including newly proposed tags, are linked within the transaction;
- avoid SQL structures that assume newly inserted rows are visible through an unsafe separate scan inside the same data-modifying CTE;
- include useful read-only verification queries for the user to run after manual execution.

Do not bundle unrelated corrections or related-entry opportunities into the transaction without explicit user scope.

### Local SQL proposal file

Whenever SQL is produced, also save the complete proposal in the repository at `sql/<descriptive-name>-proposal.sql`.

- Use a concise, lowercase, hyphenated name that identifies the entry or update.
- Put `-- UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED` at the top of the file.
- Include the transaction and read-only verification queries in the saved file, not only in the response.
- Never execute the saved SQL.
- Report the file path in the final response.

## Publication completion: build, commit, and push

For a publication task with map/code changes, use `website-development` and carry the authorized work through build, commit, and push rather than stopping at local edits. Honor build/commit/push authorization already given in the conversation; do not ask again. These instructions do not independently authorize Git publication when the user requested only research or a proposal, and never authorize SQL execution.

- Prepare and validate the complete editorial and map package before publication. After the user manually applies SQL, read the resulting live records to confirm UUIDs, content, and tags; use observed state rather than assuming execution from elapsed time or a local file.
- Run the relevant checks and `npm run build` before pushing code/map changes. When new data is present, verify the new entries in the generated timeline and map, and check the timeline payload budget. If data is still absent, report that the prepared map assignments cannot yet appear publicly; do not claim the entries are live.
- If commit/push is authorized, stage only reviewed task files, commit, and push after the required checks pass. Preserve unrelated work and respect ignored local SQL proposals and editor backups. Report the commit hash and push outcome.
- Inspect the GitHub Pages workflow triggered by the push. Distinguish pushed, deployment running, deployment successful, and live verification completed. When deployment succeeds, verify the expected entries on the published timeline and Beer Map before claiming publication is complete.
- If this is only a skill/documentation change, validate the skill and diff; application builds are needed only when requested or relevant. Never report checks or publication steps that were not performed.

## Self-check and output

Before answering, verify:

- every factual claim is supported and fact is separated from inference;
- source access and limitations are represented honestly;
- complete-corpus and within-batch conceptual duplicate checks were completed, with explicit decisions for credible overlaps; incomplete coverage is disclosed;
- title, description, category, and date precision do not overstate evidence;
- tags are sparse, canonical where possible, and supported;
- existing verified work is preserved;
- related opportunities are separate from requested SQL scope;
- SQL, if included, matches verified schema, is complete, safe, and explicitly unexecuted;
- Beer Map coverage, matching UUIDs, location evidence, and any unresolved map exclusions are included in the entry package.

Return the editorial proposal, source assessment, separate related opportunities, and—when justified—the SQL proposal with a brief change summary. For a proposal-only request, then stop for human review. For an authorized publication task, complete the publication steps above and report any remaining data or deployment dependency.

If evidence is insufficient, do not generate speculative entry text or SQL. State: “The available sources are insufficient to create or update a Beer Chronicles entry,” and explain what is missing.
