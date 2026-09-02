# Beer Chronicles

[Beer Chronicles](https://beer-chronicles.org) is a curated, source-based interactive timeline and connected knowledge graph of beer history. It combines permanent historical event pages with chronological exploration, thematic Storylines, tags, related entries, source references, and editorial context.

The live website is the canonical view of currently published content.

## Technology

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS
- Supabase as the published-data source
- Static export hosted on GitHub Pages

## Repository structure

- `src/app/` — routes, metadata, sitemap, and static-export endpoints
- `src/components/` — timeline, filters, event cards, modals, and shared UI
- `src/lib/` — data access, types, URL helpers, and Storyline/domain utilities
- `tests/` — chronology and event-URL tests
- `.agents/skills/` — task-specific Codex workflows
- `AGENTS.md` — repository governance and editorial safeguards

Generated build output is written to `out/` and is not committed.

## Local development

Use Node.js 20 and npm, matching the deployment workflow.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application reads published timeline data from Supabase. A production build therefore requires network access and availability of the live data source. No private Supabase credentials are required for the current public read-only application setup.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox
npm run test:e2e
npm run check:timeline-payload
git diff --check
```

`npm run build` creates the statically exported site in `out/`.
`npm run test:e2e` builds the site and runs the accessibility interaction suite
in Chromium and Firefox. Its local server uses port `4173` by default; set
`PLAYWRIGHT_PORT` to a free port when needed. CI sets
`PLAYWRIGHT_USE_EXISTING_BUILD=1` to test the export already created by its
build step.
`npm run check:timeline-payload` reports the timeline event count, raw and
gzip-equivalent sizes, and compressed bytes per event. It fails when the
generated payload exceeds its regression budgets.

`npm run check:source-links` reads the currently published timeline data,
checks its unique external citation URLs, and writes advisory Markdown and JSON
reports to `artifacts/source-link-report/`. Link findings do not modify
editorial data and do not cause the command to fail; automated blocking,
rate-limiting, and transient errors are reported separately from definite
`404` and `410` responses.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. installs dependencies with `npm ci`;
2. runs ESLint, TypeScript checks, and all tests;
3. builds the static export with `npm run build`;
4. checks the generated timeline payload against its size budgets;
5. uploads `out/`; and
6. deploys it to GitHub Pages.

Do not push solely to test a change: verify locally first because a push to `main` publishes the site.

The separate `.github/workflows/source-link-audit.yml` workflow runs on the
first day of every month and can also be started manually. It checks the public
timeline without Supabase credentials and uploads its reports as a workflow
artifact retained for 90 days. When definite `404` or `410` responses are
present, it creates or updates one GitHub issue; a later clean run closes that
issue. Other response categories remain in the report only. The notification
step is non-blocking, the audit is independent of deployment, and neither can
change or remove a citation or interrupt the live website.

## Editorial and contribution safeguards

Beer Chronicles is curated. Historical entries, dates, sources, tags, Storylines, and relationships require human editorial review. Automated tooling must not directly create, change, delete, or publish editorial records in Supabase.

For complete repository rules and task routing, read [`AGENTS.md`](./AGENTS.md). Relevant reusable workflows are maintained under [`.agents/skills/`](./.agents/skills/).
