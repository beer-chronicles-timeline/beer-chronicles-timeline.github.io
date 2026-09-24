# Technical maintenance

This routine operates the existing site. It does not authorize backend reads,
content changes, new tracking, commits or deployment; follow AGENTS.md.

## Release diagnostics

Use Node 24. `npm run measure:timeline-mobile` tests the existing local export;
it never builds or accesses Supabase. It runs three cold-browser samples for
each of timeline, map, histogram and the 1516 event page. Set
`TIMELINE_PERFORMANCE_RUNS=1` for a smoke check, not a reliable baseline.

The profile is 390 x 844 CSS pixels, DPR 2, 4x CPU slowdown, 150 ms latency,
1.6 Mbps download and 750 Kbps upload. The local server gzips responses. External
requests are blocked; map rendering uses a synthetic background style and the
real application markers/worker. It excludes remote basemap tile costs. A
missing map canvas or failed/unsupported measurement is reported as an error,
not a fast successful sample. Remaining routes are still measured.

Saved under `artifacts/performance/`:

- `performance.json`: all samples, script paths/sizes, route medians, profile,
  browser/host, commit, dirty-working-tree state, errors and baseline comparison.
- `performance.md`: readable diagnostic summary.
- `capacity.json`: current payload sizes, hard limits and linear forecasts for
  750, 1,000 and 1,500 events, produced by `npm run check:timeline-payload`.
- `build.json`: snapshot mode/count, preparation time, Next build time, exported
  file count and total uncompressed export bytes, produced by the build wrapper.

LCP and CLS describe the observed lab window. CLS uses the largest session
window, excluding recent-input shifts. Interactions cover timeline typing,
histogram range selection, map place selection/zoom, and opening the event-page
menu. `interactionMaxMs` is the maximum recorded Event Timing duration for those
samples, **not field INP**; zero means no event above the 16 ms collection floor.
`readyMs` is the route's tested readiness condition, not completion of every
asset. Encoded JS sizes are response bodies, not complete wire sizes or the
worker's complete memory/rendering cost. Approximate blocking time covers the
load observation window and is not a Lighthouse score.

The deploy workflow restores the preceding cached baseline, runs diagnostics,
retains all reports as a commit-labelled artifact for 90 days, then saves the
new baseline only after successful measurement. Comparisons require the same
schema, full browser version, host/profile and publication mode. Changed
profiles start a new baseline. `PERFORMANCE_BASELINE_PATH=/path/performance.json`
selects an explicit comparison locally; `PERFORMANCE_OUTPUT_DIR` changes the
report destination. Reports from dirty working trees are clearly labelled.

Timing warnings remain advisory. Review increases beyond both 20% and 300 ms
for LCP/readiness; 20% and 32 ms for sampled event duration; 20% and 50 ms for
approximate blocking; 10% and 16 KiB for compressed JS; 10% and 64 KiB for decoded
JS; 15% and 3 requests; or a CLS increase over 0.02. These are review triggers,
not user-experience guarantees. Retain the current hard payload ceilings.
Do not automatically raise them to make a failing build pass.

## Capacity and scale

Below 100 estimated additional entries, review the payload contract before the
next large content batch. Forecasts assume current average bytes per event;
they are not a prediction of future text length or actual compressed fixtures.
Inspect the saved script list and decoded sizes to locate changes first.
Consider separating detail-only fields only after checking search and modal
requirements. Do not remove source access or full-text search to meet a budget.

After meaningful loader/rendering changes, run offline fixtures:

```sh
npm run build:offline -- 750
npm run build:offline -- 1000
npm run build:offline -- 1500
```

Each build validates exact exported counts, routes and links. Archive each
build report before the next build overwrites it. Run the browser/performance
suite against each size when rendering or interaction scale is the concern.
Synthetic fixtures are structural stress tests; their short repeated text is
not a realistic bandwidth forecast. A saved public payload can be used for a
more representative local test without querying the backend. Never deploy a
fixture export; the live-publication gate rejects it.

## Monthly owner review

1. In Cloudflare's existing RUM dashboard, review mobile and desktop separately,
   the observation window/sample counts and p75 LCP, INP and CLS. Record dates,
   route groups and any inconclusive low-traffic result. Targets are LCP <=2.5 s,
   INP <=200 ms and CLS <=0.1. A lab pass cannot establish this field result.
2. In Search Console, inspect indexed/submitted events and Storylines, selected
   canonicals, new 404s and recent title changes. Check representative old URL
   aliases after publication. Compare meaningful time windows for clicks and
   impressions instead of reacting to isolated changes.
3. Review the existing monthly source-link issue/artifact. Distinguish confirmed
   404/410s from blocks/rate limits and redirects to generic landing pages.
   Editorial corrections remain human decisions.
4. Read the latest performance artifact and capacity forecast. Record the
   finding, evidence, next check and owner in the normal project issue process.
   Use actual feedback or observed friction before adding interface controls.

No dashboard credentials, new telemetry or analytics events were introduced by
this implementation. Standard Cloudflare Web Analytics does not record query
strings or custom events; it cannot explain every filtering/search problem.
Any additional instrumentation needs a specific question and privacy decision.

Primary references:
- https://web.dev/articles/vitals
- https://web.dev/articles/cls
- https://developers.cloudflare.com/speed/observatory/rum-beacon/
- https://developers.cloudflare.com/web-analytics/faq/
