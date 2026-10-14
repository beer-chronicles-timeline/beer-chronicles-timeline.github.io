---
name: website-development
description: Implement, debug, refactor, test, or improve the Beer Chronicles Next.js application, including UI/UX, accessibility, SEO, performance, and maintenance. Do not use for editorial data changes or review-only requests.
---

# Beer Chronicles Website Development

Implement the requested application change while preserving Beer Chronicles conventions and editorial boundaries.

Follow all repository `AGENTS.md` instructions.

## Scope

Use this skill for:

- feature implementation and maintenance;
- bug diagnosis and fixing;
- behavior-preserving refactoring;
- UI, responsive, and UX work;
- accessibility improvements;
- SEO implementation;
- performance work;
- implementation-related tests.

Do not use it to create or revise historical entries, apply taxonomy changes, prepare social posts, or implement findings from a review-only request.

## Before editing

1. Inspect Git status and preserve unrelated work.
2. Inspect the relevant code, configuration, tests, and existing patterns. Do not ask the user to provide files available in the workspace.
3. Diagnose the cause or identify the correct change point before editing.
4. For a substantial refactor or architectural change, state the intended architecture and why the selected change points are appropriate.

## Change principles

- Keep the change coherent and limited to the requested outcome. Use targeted patches; do not replace whole files merely as a conversational convention.
- Preserve established naming, component boundaries, layout patterns, Tailwind style, wording, and UX where reasonable.
- A pure refactor must preserve behavior, appearance, wording, and UX. Separate requested behavior changes from refactoring work.
- Do not modify historical content, tags, Storylines, sources, or Supabase editorial records as a side effect of code work.
- Respect the static-export architecture. Check that new behavior is compatible with `output: 'export'` and unoptimized Next.js images where relevant.
- Check mobile and responsive behavior for user-facing changes.
- Consider semantics, keyboard access, focus behavior, labels, contrast, and reduced-motion or assistive-technology needs where relevant.
- Consider metadata, crawlability, structured data, performance, and asset cost when the requested work affects SEO or runtime behavior.
- Preserve local/live data boundaries. Do not use application access as authority to mutate editorial data.

## Verification

Run the smallest meaningful check after each coherent patch, then broader checks in proportion to risk.

Use the installed Node version matching `.nvmrc` before running commands. Reuse completed checks until relevant code changes or a failure warrants another run. Check existing command approvals before requesting a sandbox override; if an essential command fails because of the sandbox, explain that observed system restriction without asking again for already authorized task work.

Verified package commands are:

- `npm run lint` — ESLint with Next.js core-web-vitals and TypeScript rules;
- `npm run typecheck` — TypeScript without emitting output;
- `npm test` — the existing Node unit tests through `tsx`;
- `npm run build` — Next.js static build/export;
- `npm run build:offline` — synthetic fixture build without Supabase access;
- `npm run test:e2e` — existing browser tests, when relevant;
- `npm run dev` — local development server when interactive browser verification is needed.

Verify current `package.json` commands rather than inventing invocations. For focused unit tests, `node --import tsx --test tests/<relevant-file>.test.ts` avoids the `tsx` CLI's extra IPC socket. Do not change testing infrastructure as part of an unrelated task.

The build reads live Supabase data and needs network/live-data availability. Do not run it as ceremony when it is irrelevant; when it is relevant but unavailable, report the limitation accurately.

Use browser checks for visual, responsive, keyboard, or interaction changes when they materially verify the result. Never claim a check was run if it was not.

For entry publication limited to literal map data and canonical event paths, use the existing map and URL tests locally and let CI run the broader checks. Run a local production build once if explicitly requested or needed for a specific concern; otherwise CI supplies it. Do not run a full local audit or browser suite for a data assignment. CI compares against the published commit and defaults to full checks when classification is uncertain. Weekly browser/performance checks use synthetic data and do not deploy or access Supabase.

For skill/documentation or workflow changes, validate the edited files and any decision logic. A live build is unnecessary unless requested or needed to resolve a specific concern; use fixtures when export verification is warranted.

## Completion

Report the implemented outcome, files changed, checks and results, and remaining risks or manual verification. Do not stage, commit, push, or deploy unless explicitly requested.

Honor concrete backend and Git authorization already given for the current unit of work; do not reopen it. When publication is requested, monitor the resulting workflow and verify the expected release over public HTTP once after deployment. Report completion and stop. Repeat verification only for a new change, failure, or reported issue.
