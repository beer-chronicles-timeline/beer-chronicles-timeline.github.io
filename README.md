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
`npm run test:e2e` builds synthetic offline fixtures and runs the regression
suite in Chromium, Firefox, mobile Chromium and WebKit. No backend reads are
performed by the default test command. Its local server uses port `4173` by default; set
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

## Consolidated publication and URL preservation

Use Node 24 (`.nvmrc`). Both deployment and source audits use this supported LTS
runtime. Pull requests run `.github/workflows/validate.yml`: offline validation
and a synthetic export, with no Supabase access and no deployment.

`npm run build` and `npm run dev` prepare a shared publication snapshot. They
**read Supabase and require the explicit conversational approval described in
AGENTS.md**. Preparation paginates events, tags and event_tags with exact counts
and stable ordering, validates required records and references, then writes the
ignored `.cache/publication.json`. Every exported route consumes that same file.
A missing page, changed row count or validation error stops publication. This
freezes the data used by the export; it is not a database transaction across
three tables, so avoid simultaneous editorial edits during capture.

`npm run build:offline -- 1500` creates a synthetic 1,500-event export without
backend access (default: 750). A saved public timeline payload can be used via
`npx tsx scripts/build-publication.ts --public-fixture /path/to/timeline-data.json`.
Both are marked as fixtures; the deployment gate rejects fixture exports.
Synthetic descriptions and dates must never be published as historical content.

`npm run check:publication` verifies the payload, event routes, canonicals,
Storyline event links and internal links against the prepared snapshot.
`npm run check:publication -- --require-live` additionally rejects fixture mode.
Browser tests serve extensionless routes like Pages, block external requests,
and intercept contribution submissions. A short real-device / screen-reader
pass remains useful before releasing interaction changes.

`src/data/published-event-paths.json` is an append-only technical URL registry,
seeded from the 590-event public release reviewed on 23 September 2026 plus three
verified earlier paths. Keep every previous slug when a title changes. Existing
aliases are statically exported with the current canonical, a visible link and
a client-side replacement preserving query strings and fragments. They are not
HTTP 301/308 responses; this is the portable GitHub Pages fallback. Canonical
URLs alone appear in the sitemap.

A newly published or renamed event must be registered before the next export.
If an approved live preparation reports an unregistered path, its validated
snapshot is retained. Review it, then run `npm run register:event-paths` to append
paths **locally with no backend access**, review the diff and retain all old
paths. A subsequent `npm run build` reads Supabase again and requires approval
for that concrete read bundle. Registration never edits editorial records.

The live workflow validates the export before upload and performs public URL
smoke checks after deployment. Browser tests cover historical aliases, sharing,
correction error/retry, search/history, map search, histogram keyboard use,
separated year controls, and WCAG 2.2 scans of additional pages and open states.

For release performance artifacts, baseline comparisons, scale fixtures and the
monthly field-performance / Search Console / source-integrity routine, see
[technical maintenance](docs/technical-maintenance.md). These procedures use
existing telemetry; no new tracking is added. `npm run measure:timeline-mobile`
now measures four representative routes, retaining its existing command name.
