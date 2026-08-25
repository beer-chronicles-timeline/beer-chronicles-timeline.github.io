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
node --test --experimental-strip-types tests/*.test.ts
npm run build
git diff --check
```

`npm run build` creates the statically exported site in `out/`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. installs dependencies with `npm ci`;
2. builds the static export with `npm run build`;
3. uploads `out/`; and
4. deploys it to GitHub Pages.

Do not push solely to test a change: verify locally first because a push to `main` publishes the site.

## Editorial and contribution safeguards

Beer Chronicles is curated. Historical entries, dates, sources, tags, Storylines, and relationships require human editorial review. Automated tooling must not directly create, change, delete, or publish editorial records in Supabase.

For complete repository rules and task routing, read [`AGENTS.md`](./AGENTS.md). Relevant reusable workflows are maintained under [`.agents/skills/`](./.agents/skills/).
