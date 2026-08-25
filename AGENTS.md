# Beer Chronicles Repository Governance

## Project identity

Beer Chronicles is a curated, source-based interactive timeline and connected knowledge graph of beer history. AI may assist with research, auditing, proposals, and implementation, but final editorial and database authority always remains human.

## Technology and repository map

- The website is a Next.js 16, React 19, TypeScript, and Tailwind CSS application in `src/`.
- `src/app/` contains routes, `src/components/` UI, and `src/lib/` data and domain utilities. Tests are in `tests/`.
- The application reads published data from Supabase and is statically exported to `out/` for GitHub Pages.
- Project-specific Codex workflows live in `.agents/skills/`.

## Non-negotiable factual integrity

**Never invent historical facts.** Never fabricate, guess, fill gaps, or present unsupported claims as facts, including dates, events, people, breweries, beer styles, quotations, sources, causal or geographical relationships, historical interpretations, factual tag relationships, or chronology.

Distinguish evidence, inference, and uncertainty. If reliable evidence is insufficient, say so and stop rather than completing historical content speculatively. Accuracy always beats completeness.

## Editorial and database governance

- Never autonomously create, edit, delete, publish, or otherwise modify historical entries, sources, tags, Storylines, related-entry data, or other Beer Chronicles editorial records.
- Never directly mutate Beer Chronicles editorial data in Supabase: do not execute `INSERT`, `UPDATE`, or `DELETE` statements, run SQL against Supabase, call editorial-data mutation APIs, alter production historical records, or apply backend taxonomy changes.
- The `beer-entry` and `tag-cleanup` skills may prepare safe, copy-paste-ready SQL proposals. These are unexecuted proposals for human review and manual execution by the user; generating SQL never authorizes executing it.
- Content and taxonomy audits are advisory. The user makes every final editorial and database decision.

## Repository safety

- Inspect Git status before editing and preserve unrelated user work, including dirty or untracked files.
- Do not clean, reset, overwrite, revert, or otherwise disturb unrelated changes. Avoid destructive actions.
- Keep changes within the requested scope. Do not claim a change or check was completed unless it actually was.

## Development discipline

- Preserve established naming, architecture, layout patterns, Tailwind style, wording, and UX unless a change is explicitly requested.
- Pure refactoring must not change behavior, appearance, wording, or UX.
- Use coherent, scoped changes and proportionate verification. Detailed implementation procedure belongs in `website-development`.
- Do not modify historical/editorial data as a side effect of application development.

## Git and deployment

- Do not stage, commit, push, or deploy unless explicitly requested.
- If a push is requested, push only after the requested unit of work is complete and verified.
- A push to `main` triggers the repository's GitHub Pages workflow, which builds and deploys the static `out/` export.

## Live and local state

- The live Beer Chronicles website is canonical for the currently published state.
- Local generated material such as `out/` is a potentially stale, read-only fallback where a task-specific skill permits it. Report conflicts instead of silently preferring local output.
- The static build reads live Supabase data and therefore depends on network and live-data availability.

## Skill routing

- Implementation, bugs, refactoring, UI/UX, accessibility, SEO implementation, performance, and application tests: `website-development`.
- Research and proposals for new or updated timeline entries, including SQL proposals: `beer-entry`.
- Read-only complete or targeted website audits: `website-review`.
- Instagram images and captions plus Bluesky content: `instagram-bluesky-content`.
- Read-only taxonomy/tag audits, cleanup proposals, and SQL proposals: `tag-cleanup`.
- Independent read-only audit of exactly one published Storyline: `storyline-audit`.

Task-specific skills may refine workflows and report formats but may never weaken this file's safety, factual-integrity, human-authority, or database rules.

## Completion and reporting

Report concisely what changed, files changed, checks actually run and their outcomes, unresolved issues or risks, and any user decisions still required. Review-only tasks must stop after reporting and must not silently become implementation work.
