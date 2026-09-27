-- UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND EXPLICIT EXECUTION APPROVAL REQUIRED
-- Prepared 2026-09-27. Scope: ONE new event and FIVE existing tag links.
-- No changes to existing events, tag definitions, or related-entry records.
-- Schema inspected in the local 2026-09-24 PostgreSQL backup; no backend access.
-- Published state refreshed 2026-09-27: 592 entries, unchanged since full review.
-- Research: sql/oktoberfest-early-local-beer-rule-editorial-proposal.md.
-- Fixed event UUID is shared with the prepared src/lib/mapLocations.ts assignment.
--
-- Date precision is DECADE: 1820-01-01 stores "1820s", not an exact start date.
-- Accounts differ between 1824 and 1825. This early rule is not claimed to have
-- continued unchanged into the modern six-brewery admission policy.
-- The original ordinance and cited Gerda Möhler study have not been inspected.
--
-- Run the complete file in Supabase SQL Editor only after editorial approval.
-- It aborts if the UUID/title already exists or any expected canonical tag differs.
-- Reruns do not overwrite an existing entry, including a soft-deleted entry.
-- UUID/title guards do not replace the conceptual duplicate review.
-- SQL execution alone does not update the statically published website or map;
-- publication also requires a separately authorized build/deployment.

BEGIN;

DO $proposal$
DECLARE
  proposed_id CONSTANT uuid := 'd3718567-2b7c-4cad-a8c7-5fcb67eae41e';
  proposed_title CONSTANT text := 'Early Oktoberfest Rules Reserve Beer Service for Munich';
  expected_tag_ids CONSTANT uuid[] := ARRAY[
    '241c6c12-eba4-4a03-8f06-cbf2786e96b9'::uuid, -- Laws
    '415c52c3-e5e9-4f06-9ebd-ab0272839b3e'::uuid, -- Festivals
    '6301da56-242c-4d1a-90a8-afcef6d3b1b7'::uuid, -- Germany
    'db8ae2ca-d5a9-4416-9391-fa9e3ee24378'::uuid, -- Oktoberfest
    'dfb38998-7fca-40ae-bdd9-e06617528198'::uuid  -- Munich
  ];
  expected_tag_names CONSTANT text[] := ARRAY[
    'Laws', 'Festivals', 'Germany', 'Oktoberfest', 'Munich'
  ];
  matched_tags integer;
  linked_tags integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.events
    WHERE id = proposed_id OR lower(btrim(title)) = lower(proposed_title)
  ) THEN
    RAISE EXCEPTION 'Proposed Oktoberfest event UUID or title already exists. No changes made; inspect the existing record before proceeding.';
  END IF;

  SELECT count(*) INTO matched_tags
  FROM unnest(expected_tag_ids, expected_tag_names) AS expected(id, name)
  JOIN public.tags AS t ON t.id = expected.id AND t.name = expected.name;

  IF matched_tags <> 5 THEN
    RAISE EXCEPTION 'Expected all five canonical tags with their verified UUIDs and names; matched %. No changes made.', matched_tags;
  END IF;

  INSERT INTO public.events (
    id, title, description, event_date, historical_year,
    date_precision, category, sources
  ) VALUES (
    proposed_id,
    proposed_title,
    $description$In the 1820s, Munich restricted admission to Oktoberfest's beer stalls to eighteen local publicans. The wooden stalls formed a ring on the festival grounds, where beer service was becoming an increasingly important part of the celebration.

An early municipal rule, in force until 1850, reserved beer service at the festival for these Munich publicans and beer from local breweries. Four publicans from the surrounding area who wanted to sell beer from Tölz were directed instead to the Sendlinger Höhe outside the festival. This provides an early example of Oktoberfest's preference for Munich beer, well before the later restriction to established Munich breweries reviewed by a court in 1990.$description$,
    DATE '1820-01-01',
    NULL,
    'decade',
    'Laws',
    $sources$Eymold, Ursula. “Oktoberfest.” Historisches Lexikon Bayerns. Section “Bewirtung”; dates the restriction to eighteen Munich publicans to 1825.
https://www.historisches-lexikon-bayerns.de/Lexikon/Oktoberfest

Münchner Zeitensprünge. “Die Zahl der auf dem Oktoberfest zugelassenen Bierwirte wird festgelegt.” Chronology entry dated August 6, 1824. This differs from the 1825 dating above; the entry therefore uses decade precision.
https://muenchner-zeitenspruenge.de/fakten/index.php?search=Magistrat

European Commission. Publication of the application for “Oktoberfestbier,” 2022/C 252/08. Official Journal C 252, July 1, 2022, pp. 21–25, section 5. Historical account of the municipal restriction in force until 1850 and the exclusion of Tölz beer from the festival, citing Gerda Möhler's study.
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52022XC0701(03)

Landeshauptstadt München. Rathaus Umschau, September 17, 2010, p. 11. Account of the separate judicial review of brewery admission restrictions on January 17, 1990.
https://ru.muenchen.de/pdf/2010/ru-2010-09-17.pdf$sources$
  );

  -- Separate statement: the newly inserted event is visible before linking tags.
  INSERT INTO public.event_tags (event_id, tag_id)
  SELECT proposed_id, tag_id
  FROM unnest(expected_tag_ids) AS expected(tag_id)
  ON CONFLICT (event_id, tag_id) DO NOTHING;

  GET DIAGNOSTICS linked_tags = ROW_COUNT;
  IF linked_tags <> 5 THEN
    RAISE EXCEPTION 'Expected five new tag links; inserted %. Transaction rolled back.', linked_tags;
  END IF;
END
$proposal$;

COMMIT;

-- Read-only verification after approved execution:
-- Expect ONE active event, 1820-01-01, historical_year NULL, decade, Laws,
-- and exactly Festivals, Germany, Laws, Munich, Oktoberfest.
SELECT e.id, e.title, e.event_date, e.historical_year, e.date_precision,
       e.category, e.description, e.sources, e.deleted_at,
       count(t.id) AS tag_count, array_agg(t.name ORDER BY t.name) AS tags
FROM public.events AS e
LEFT JOIN public.event_tags AS et ON et.event_id = e.id
LEFT JOIN public.tags AS t ON t.id = et.tag_id
WHERE e.id = 'd3718567-2b7c-4cad-a8c7-5fcb67eae41e'::uuid
GROUP BY e.id;
