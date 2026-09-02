# Homepage Timeline Performance and Progressive-Rendering Plan

## Purpose

Implement a performance and resilience refactor of the Beer Chronicles homepage timeline in a fresh Codex session.

The recurring problem is that the live homepage initially serves a six-entry preview and only requests the complete interactive timeline after React has hydrated. On a constrained mobile connection, the real timeline therefore becomes available late. The same boundary leaves JavaScript-disabled visitors with only the six-entry sample.

This task is an application-architecture change. It is **not** an editorial task.

## Mandatory skill and repository rules

- Use the repository's `website-development` skill.
- Read and follow `AGENTS.md` before acting.
- Inspect `git status --short` before editing and preserve all unrelated work.
- Do not stage, commit, push, deploy, or mutate Supabase unless separately and explicitly requested.
- The live Supabase data read by the build is read-only for this task.

## Hard constraints

These requirements override optimization convenience:

1. **No visible change on desktop.** The hydrated homepage must retain the current layout, typography, colors, spacing, timeline geometry, controls, event cards, modal, floating random-event control, footer, and responsive breakpoints.
2. **No visible change on mobile.** The hydrated homepage must retain the current 320 px and 390 px layouts, ordering, wrapping, controls, cards, modal behavior, and absence of horizontal overflow.
3. **No content changes.** Do not add, remove, rewrite, reorder, correct, or otherwise modify historical entries, dates, descriptions, sources, categories, tags, Storylines, related-entry relationships, metadata copy, page copy, or navigation wording.
4. Preserve all current filtering, URL-state, sorting, searching, incremental rendering, random-event, modal, related-event, sharing, correction-link, keyboard, focus-management, and browser-history behavior.
5. Preserve the static-export architecture (`output: "export"`) and GitHub Pages compatibility.
6. Preserve permanent event pages, Storyline pages, canonical URLs, sitemap behavior, structured data, and the public `/timeline-data.json` artifact unless a later, separately approved cleanup proves it is safe to remove.
7. Do not trade a better synthetic score for slower first content, layout instability, lost crawlability, excessive HTML, or delayed interactivity.

## Current verified baseline

Record a new baseline at the beginning of the implementation session; do not rely only on these numbers. As of 2 September 2026:

- Live timeline: 467 events, 166 total tags, 105 visible filter tags.
- `/timeline-data.json`: 895,140 raw bytes and approximately 280,714 gzip-equivalent bytes.
- Live homepage HTML: approximately 41 KB raw before transfer compression.
- Lighthouse mobile sample: performance 77, FCP 1.6 s, LCP 5.5 s, Speed Index 3.9 s, TBT 30 ms, CLS 0.
- PageSpeed Insights reported by the user: approximately 81 mobile and 98 desktop; other categories approximately 100.
- The existing `scripts/measure-timeline-mobile.mjs` test uses a 390 × 844 viewport, 1.6 Mbps download, 150 ms latency, and 4× CPU slowdown.
- The live hydrated timeline initially renders 60 events and incrementally adds batches of 60.
- The current no-JavaScript homepage exposes six representative permanent event links and a Storylines link.

## Root cause

The homepage server component already calls `getHomeTimelineData()` at build time, but sends only six selected events to `TimelinePreview`.

`TimelineDataLoader` mounts in the browser and starts fetching `/timeline-data.json` inside `useEffect`. This creates a waterfall:

1. download HTML and critical assets;
2. download and execute the client bundle;
3. hydrate `TimelineDataLoader`;
4. initiate the 895 KB JSON request;
5. parse the JSON;
6. mount the real timeline and replace the preview.

Simply passing the complete dataset into `Timeline` is not sufficient. A preliminary prototype did that and produced an approximately 918 KB raw `out/index.html`, but the timeline still failed to appear as server-rendered HTML. `useSearchParams` in `Timeline` and `TimelineFilters`, combined with the client-only dynamic filter wrapper, causes Next to move that subtree behind a client-rendering boundary during static export. That prototype was reverted and must not be repeated without addressing the rendering boundary.

## Chosen primary architecture

Make the existing timeline genuinely server-renderable and hydratable for the default homepage state.

### Server-render the existing timeline, not a second visual implementation

- Pass the existing `HomeTimelineData` obtained by `src/app/page.tsx` directly to the existing `Timeline` component.
- Render the same first 60 event cards, controls, count, search, sorting control, and timeline structure that appear after hydration today.
- Do not create a separate approximation whose desktop or mobile markup can drift from the interactive timeline.
- Retain the current 60-event render window and 60-event incremental batches.

### Remove the static-rendering bailout

- Remove `useSearchParams` from the server-rendered timeline subtree, including `Timeline` and `TimelineFilters`.
- Remove the `ssr: false` boundary around `TimelineFilters` if it prevents the real controls from being emitted in static HTML.
- Centralize URL parsing and synchronization in a small client-side utility or hook that uses `window.location.search` only after mount and subscribes to `popstate`.
- The server and first client render must use the same default, unfiltered, newest-first state so hydration has no mismatch.
- After hydration, reconcile query-string state and preserve the exact existing behavior for `category`, `from`, `to`, `tags`, `tagMode`, `string`, and `order`.
- Continue to use `router.replace(..., { scroll: false })` or an equivalent existing-history-safe mechanism for user changes.
- Avoid update loops and avoid deleting unrelated recognized filter parameters.

### Preserve URL and filtered-view semantics

The project is statically exported. Arbitrary query strings cannot produce different server HTML at request time. Therefore:

- Do not claim that this refactor makes `/?tags=...` a separately server-rendered SEO landing page.
- Do not add mass-generated tag pages as part of this task.
- Preserve filtered URLs for users, sharing, browser back/forward navigation, and links from event pages and Storylines.
- Treat curated Storyline pages as the existing crawlable thematic landing pages.

### Preserve the public JSON endpoint

- Keep `/timeline-data.json` during this task even if the homepage no longer requests it.
- It is a public static artifact and may have external or diagnostic consumers.
- Removing it is out of scope unless the user separately approves that cleanup after usage has been checked.

## Performance risk and mandatory decision gate

Passing the entire dataset through the server-rendered client component will enlarge `index.html`. Transfer compression should make the increase closer to the current compressed JSON cost than the raw size suggests, while eliminating a late request and rendering useful timeline HTML immediately. This is a hypothesis, not a guaranteed win.

After the first working implementation:

1. Measure raw and gzip-equivalent sizes of `out/index.html` and `out/timeline-data.json`.
2. Run `scripts/measure-timeline-mobile.mjs` for at least five runs before and after, using clean builds and the same environment.
3. Run at least three mobile Lighthouse samples against the local static export and compare medians, not the best run.
4. Record FCP, LCP, Speed Index, timeline-controls-ready time, transfer size, decoded size, long tasks, TBT, and CLS.

Accept the primary architecture only if all of the following are true:

- median timeline-controls-ready time improves materially;
- median mobile LCP improves or is no worse within normal run variance;
- FCP does not regress materially;
- CLS remains 0 or effectively 0;
- no new long-task or TBT regression appears;
- the initial document does not exceed a reasoned transfer budget;
- the server HTML contains the real timeline controls, the total event count, and the first 60 real event cards.

If the larger initial document materially worsens FCP/LCP or transfer cost, do **not** keep it merely because it improves no-JavaScript output. Revert that implementation and proceed to the fallback architecture below.

## Fallback architecture if the primary gate fails

Use a two-tier data model while retaining the same rendered components:

1. Define a compact timeline index containing only fields required for cards, chronology, categories, tags, filtering, sorting, and search.
2. Establish field usage from code before deleting anything. Current search includes both title and description; card previews require descriptions; date formatting requires all relevant precision/year/date fields; Milestone presentation requires tags.
3. Exclude fields not needed for initial timeline rendering, especially sources and record-management fields, only after tests demonstrate that no initial behavior uses them.
4. Server-render the same first 60 timeline cards and controls from the compact index.
5. Design detail loading so opening a modal still produces the same complete modal on the same user action. Do not introduce a visible empty source section, content pop-in, disabled card, spinner, or perceptible second click.
6. Permanent event pages must remain fully server-rendered with complete sources.
7. Re-run the complete performance and parity gates. Keep this design only if it beats both the current production baseline and the rejected primary prototype.

The fallback is intentionally more complex. Do not adopt it before measuring the simpler primary architecture.

## Expected change points

Inspect these files first; adjust the list when evidence requires it:

- `src/app/page.tsx`
- `src/components/Timeline.tsx`
- `src/components/TimelineFilters.tsx`
- `src/components/TimelineFiltersWrapper.tsx`
- `src/components/TimelineDataLoader.tsx`
- `src/components/TimelinePreview.tsx`
- `src/lib/homeTimelineData.ts`
- `src/app/timeline-data.json/route.ts`
- `src/components/timelineFiltering.ts`
- `e2e/accessibility.spec.ts`
- `e2e/timeline-resilience.spec.ts`
- `scripts/measure-timeline-mobile.mjs`
- `scripts/check-timeline-payload.mjs`

Do not delete now-unused components casually. First search for all consumers and decide whether retaining them provides fallback or compatibility value. Any cleanup must remain part of the same verified change and must not broaden the behavior change.

## Implementation sequence

### Phase 1 — Establish reproducible baselines

- Capture `git status --short` and preserve unrelated files.
- Build the current branch against live Supabase data.
- Save desktop screenshots at 1440 × 1000 and mobile screenshots at 390 × 844 and 320 × 800.
- Capture screenshots for the homepage top, timeline controls, representative left/right desktop cards, mobile cards, tag dropdown, event modal, and footer.
- Record element bounding boxes and computed styles for key regions where pixel comparison alone could be ambiguous.
- Run the existing mobile performance script for at least five runs.
- Record output artifact sizes and the existing no-JavaScript DOM.
- Exercise unfiltered and representative filtered URLs.

### Phase 2 — Refactor URL state without changing behavior

- Introduce a focused URL-state parser/serializer with unit tests for every supported parameter and invalid/clamped values.
- Remove `useSearchParams` from the timeline rendering boundary.
- Preserve popstate restoration, copied filtered links, Storyline/tag deep links, clearing behavior, hidden selected tags, tag modes, date clamping, search debounce, and sort order.
- Verify there are no hydration warnings and no router-replacement loop.
- Run targeted tests before proceeding.

### Phase 3 — Server-render the real initial timeline

- Replace the preview/loader swap with the actual timeline data already available to the homepage server component.
- Ensure static HTML contains the existing controls, total count, ordered-list semantics, and 60 event cards.
- Preserve lazy loading of the modal component if it remains beneficial and does not block timeline SSR.
- Preserve `HomepageStructuredData` and its existing representative-event selection.
- Keep `/timeline-data.json` available.

### Phase 4 — Performance decision gate

- Build a production static export.
- Measure artifacts and run the repeated performance suite.
- Compare medians against Phase 1.
- If the primary architecture fails the gate, revert only that architecture cleanly and implement the compact-index fallback.
- Do not weaken performance tests or acceptance thresholds to make the implementation pass.

### Phase 5 — Full parity and regression verification

- Update resilience tests so they test the new progressive-rendering contract instead of expecting the obsolete six-card loader state.
- Add assertions that the server HTML contains real timeline content without JavaScript.
- Verify all existing timeline and accessibility behaviors.
- Perform screenshot comparison at all required viewports and states.

## Functional acceptance matrix

Verify at minimum:

| Area | Required result |
| --- | --- |
| Default homepage | Same hydrated appearance and newest-first ordering |
| Category filter | Same selected state, count, URL, and results |
| Single tag | Same visible/hidden tag resolution and results |
| Multiple tags | Same `all`/`any` semantics and URL serialization |
| Year range | Same clamping, ordering, and URL state |
| Search | Same title-and-description token matching and debounce |
| Sort order | Same oldest/newest behavior and URL state |
| Copy filtered view | Same URL and feedback behavior |
| Browser history | Back/forward restores all relevant state |
| Storyline deep link | Opens the same filtered timeline |
| Event-tag deep link | Opens the same filtered timeline |
| Incremental rendering | Starts at 60 and adds 60 without duplicates |
| Random event | Same animation, availability, and modal content |
| Event modal | Same content, sources, Storylines, tags, related events, and permanent link |
| Modal keyboard behavior | Focus trap, Escape, previous/next, and focus restoration unchanged |
| No JavaScript | Real scale and useful timeline content are present; permanent links remain available |
| Failure behavior | Define and test behavior for a failed optional follow-up request, if any remains |

## Visual parity protocol

“Looks similar” is insufficient. Compare the baseline and candidate at identical viewport, font, and data states.

- Required viewports: 1440 × 1000, 390 × 844, and 320 × 800.
- Disable animations for deterministic screenshots, but separately verify reduced-motion and ordinary interaction behavior.
- Compare full-page and focused-region screenshots.
- Check header geometry, Storylines promotion, filter rows, range control, count/search/order row, timeline spine, card widths, alternating desktop positions, mobile indentation, category and Milestone badges, Show more control, floating random control, modal, and footer.
- Any intentional screenshot difference requires user approval. This task currently authorizes none.
- Verify no horizontal overflow at all required widths and at 200% zoom/reflow where practical.

## Required automated verification

Run and report the actual result of:

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run check:timeline-payload
TIMELINE_PERFORMANCE_RUNS=5 npm run measure:timeline-mobile
npm run test:e2e
```

Notes:

- `package.json` currently does contain `npm test`, implemented as `tsx --test tests/*.test.ts`; use that verified command.
- The build reads live Supabase data and may require network permission.
- Use the existing Playwright projects for Chromium, Firefox, mobile Chromium, and WebKit. Do not silently skip a failing browser.
- Re-run an axe scan on representative pages and the event modal.
- Check the browser console for hydration errors, page errors, and unexpected failed requests. Do not treat errors caused solely by test-injected headers as production defects.

## SEO and static-output verification

- Confirm all current permanent URLs remain in the sitemap.
- Confirm homepage and representative event/Storyline titles, descriptions, canonicals, Open Graph data, and JSON-LD are unchanged.
- Confirm `/timeline-data.json` still returns valid complete data if retained as required.
- Inspect the exported `out/index.html` directly rather than inferring SSR from a JavaScript-enabled browser.
- Confirm the initial HTML exposes the total event count, timeline semantics, and permanent event links.
- State explicitly that filtered query strings remain client-applied under static hosting; do not misrepresent them as separately indexed landing pages.

## Editorial integrity verification

- Review `git diff --name-only` and confirm no editorial-data files were changed.
- Compare the built timeline dataset before and after. Event IDs, titles, descriptions, dates, sources, categories, tag assignments, and ordering inputs must be identical.
- Changes to TypeScript shapes or transport representations must not alter the underlying values.
- Never write to Supabase or execute editorial SQL.

## Stop and reassess conditions

Stop the chosen implementation path and reassess if any of the following occurs:

- the timeline remains absent from exported HTML;
- `index.html` grows without eliminating the delayed client boundary;
- mobile median LCP or FCP materially regresses;
- visual screenshots differ after hydration;
- filtered URLs, back/forward navigation, modal content, or focus behavior regress;
- sources or other historical fields become temporarily absent in visible UI;
- hydration warnings or duplicated timeline content appear;
- static export or a supported Playwright browser fails.

Do not paper over these failures with loading indicators or copy/layout changes, because those violate the hard constraints.

## Completion report required from the implementation session

The final report must include:

- the architecture implemented and why it passed the decision gate;
- every file changed;
- confirmation that no historical/editorial content or Supabase data changed;
- before/after raw and compressed artifact sizes;
- before/after median mobile performance measurements and Lighthouse samples;
- all lint, typecheck, unit, build, payload, E2E, accessibility, browser, no-JavaScript, and visual-parity checks actually run;
- any limitations or residual risk;
- confirmation that nothing was staged, committed, pushed, or deployed unless separately requested.

The implementation is not complete merely because it builds. It is complete only when performance improves and hydrated desktop/mobile presentation and content remain unchanged.
