---
name: tag-cleanup
description: Audit the Beer Chronicles taxonomy and prepare evidence-based tag cleanup mappings, SQL proposals, and verification queries for human review. Never execute taxonomy or database changes.
---

# Beer Chronicles Tag Cleanup

Perform a read-only taxonomy audit and prepare proposals. The user retains final editorial and database authority.

Follow all repository `AGENTS.md` instructions.

## Hard boundary

Never execute SQL, call Supabase mutation APIs, or directly add, remove, rename, merge, reparent, or relink tags. Never alter timeline-entry titles, descriptions, dates, categories, sources, or other historical content during tag cleanup.

Any SQL is an **unexecuted proposal for human review and manual execution by the user**.

Never invent a factual tag association. If a semantic relationship is uncertain, report it and obtain an explicit user decision before including it in a mutation proposal.

## Establish current state

Use verified current data and schema information. Inspect the live published state where relevant and request or use read-only query results when exact backend relationships, identifiers, constraints, or parent representation are needed.

Before proposing SQL:

- verify the actual relevant tables, columns, identifiers, uniqueness constraints, and active/deleted semantics;
- verify current tag names, usage counts, relationships, and category coverage;
- never invent parent columns, foreign keys, constraints, or record IDs;
- disclose any local/static-export staleness or incomplete visibility.

The established editorial invariant is that every active entry retains the tag matching its category: `Laws`, `Breweries`, `Events`, `People`, `Science`, `Styles`, or `Community`. Optional TypeScript typing alone does not invalidate this rule. If actual live schema or data contradicts it, stop and ask the user before proceeding past that conflict.

## Taxonomy principles

### Preserve useful structure

- Preserve every valid tag. Rarity alone is not a reason to remove or merge it.
- Allow one- and two-entry tags to grow when they represent useful future Storylines.
- Keep hidden tags attached to entries; public-filter visibility must not delete tags or relationships.
- Preserve existing sources and historical entry content. A separate editorial workflow is required to change them.
- Transfer all valid relationships before proposing deletion of an obsolete tag.
- Never delete entries during tag cleanup.

### Serve discovery, not completeness

- Keep the taxonomy sparse and navigation-useful.
- Add a tag only when it represents a central historical connection. A matching word or incidental concept is insufficient.
- Automated searches may identify candidates, but each assignment requires evidence and editorial judgment.
- Prefer existing canonical tags and avoid unnecessary new ones.

### Naming and distinctions

- Prefer concise, natural English canonical names and established forms such as `USA`, `United Kingdom`, `Czech Republic`, `Modern Craft Beer`, and `Wheat Beer`.
- Remove unnecessary prefixes only when the result remains unambiguous. Retain meaningful qualifiers; for example, `Beer Gardens` must not become the vague `Gardens`.
- Avoid collisions with mandatory category names. Use a distinct name when a Storyline concept would otherwise reuse a category name with another meaning.
- Merge overlapping concepts only when separation adds no navigational or historical value and the meaning is preserved.
- Preserve meaningful distinctions such as `Temperance` and `Prohibition`.

### Hierarchies and geography

- Parent relationships must represent genuine conceptual hierarchy, not textual association.
- Apply style hierarchies consistently when supported. Established examples include `Pils` → `Lager`, `Cold IPA` and `New England IPA` → `IPA`, `Imperial Stout` → `Stout`, `Witbier` → `Wheat Beer`, `Berliner Weisse` → `Wheat Beer` and `Sour Beer`, and `Gueuze` → `Lambic`.
- Treat these examples as established editorial mappings to verify against current data, not permission to invent unsupported schema or assignments.
- Apply city, region, and country relationships consistently when historically relevant. A city tag requires genuinely local relevance, not an incidental brewery or brand mention.

### Visibility, activity, and uniqueness

- A tag appears in the main public selector only when assigned to at least three distinct active entries; current application code implements this threshold.
- Soft-deleted entries do not contribute to public visibility, usage totals, hierarchy checks, or public statistics.
- Hiding an immature tag does not remove it or its event relationships.
- Every event-tag pair must be unique.

### Milestone

- Treat `Milestone` as a selective designation for major turning points across beer history, not merely important entries within one Storyline.
- Keep the set reasonably balanced across eras and themes when the historical record supports it.
- Avoid marking two successive stages of the same development unless both are independently transformative.

## Audit and proposal workflow

1. Define the requested taxonomy scope.
2. Inventory relevant tags, assignments, counts, active/deleted status, category coverage, and hierarchy data.
3. Identify exact duplicates, near-duplicates, weak or overly broad assignments, naming inconsistencies, orphaned/unused legacy tags, hierarchy issues, and missing central relationships.
4. Distinguish factual/data defects from semantic editorial choices.
5. For each proposal, show the observed state, evidence, affected tags and entries, impact/counts, proposed canonical mapping, and uncertainty.
6. Group compatible changes into a consolidated review batch without silently expanding into unrelated cleanup.
7. Obtain user decisions for uncertain semantic merges before preparing them for execution.
8. When requested and safe, prepare SQL and read-only verification queries; never run them.

## SQL proposal requirements

Label every block `UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED`.

The proposal must:

- match the verified current schema and exact identifiers;
- use an appropriate `BEGIN`/`COMMIT` transaction;
- use precise `WHERE` clauses and duplicate protection;
- preserve valid tags and relationships;
- transfer relationships before proposing removal of an obsolete tag;
- avoid duplicate event-tag pairs;
- respect active/deleted semantics and mandatory category coverage;
- avoid modifying entry content or deleting entries;
- include read-only verification queries for affected assignments/counts, parents, category coverage, duplicates, formatting, and unused tags;
- explain impact and any rollback considerations useful to the human executor.

Do not imply that verification queries were run unless the user executes the proposal and supplies results.

## Report and stop

Return:

1. scope and data/schema provenance;
2. current-state findings;
3. proposed canonical mapping and impact;
4. decisions requiring human judgment;
5. the unexecuted SQL proposal when requested and sufficiently verified;
6. verification queries and expected invariants;
7. limitations and risks.

Stop after the proposal. Do not apply any taxonomy or database change.
