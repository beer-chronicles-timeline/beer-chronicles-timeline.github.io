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

Verified package commands are:

- `npm run lint` — ESLint with Next.js core-web-vitals and TypeScript rules;
- `npm run build` — Next.js static build/export;
- `npm run dev` — local development server when interactive browser verification is needed.

The repository currently has no package-level `npm test` script. Tests exist under `tests/`; do not invent or document a test invocation without verifying it for the current repository. Do not change testing infrastructure as part of an unrelated task.

The build reads live Supabase data and needs network/live-data availability. Do not run it as ceremony when it is irrelevant; when it is relevant but unavailable, report the limitation accurately.

Use browser checks for visual, responsive, keyboard, or interaction changes when they materially verify the result. Never claim a check was run if it was not.

## Completion

Report the implemented outcome, files changed, checks and results, and remaining risks or manual verification. Do not stage, commit, push, or deploy unless explicitly requested.
