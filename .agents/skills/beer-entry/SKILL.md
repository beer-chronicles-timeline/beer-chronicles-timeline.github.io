---
name: beer-entry
description: Research and prepare a new or updated Beer Chronicles timeline entry, including evidence, date precision, category, tags, and an optional copy-paste SQL proposal for human review. Never execute SQL or mutate editorial data.
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

Search the live site for:

- title and title variants;
- central people, breweries, organizations, laws, competitions, publications, and places;
- the proposed date and nearby dates;
- entries that may describe the same historical event.

Distinguish a true duplicate from overlapping subject matter or a separate related event. Prefer an update proposal over a duplicate when the evidence shows one event. Do not require a database export for routine duplicate checking.

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

## Self-check and output

Before answering, verify:

- every factual claim is supported and fact is separated from inference;
- source access and limitations are represented honestly;
- duplicate checking was completed or its limitation disclosed;
- title, description, category, and date precision do not overstate evidence;
- tags are sparse, canonical where possible, and supported;
- existing verified work is preserved;
- related opportunities are separate from requested SQL scope;
- SQL, if included, matches verified schema, is complete, safe, and explicitly unexecuted.

Return the editorial proposal, source assessment, separate related opportunities, and—when justified—the SQL proposal with a brief change summary. Then stop for human review.

If evidence is insufficient, do not generate speculative entry text or SQL. State: “The available sources are insufficient to create or update a Beer Chronicles entry,” and explain what is missing.
