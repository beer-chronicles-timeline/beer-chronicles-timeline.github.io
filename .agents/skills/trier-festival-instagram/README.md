# Beer Chronicles · Trier 2026 Codex skill

## Install

Place this entire folder at the following location inside the Beer Chronicles repository:

```text
.agents/skills/trier-festival-instagram/
```

The actual skill entry point is `.agents/skills/trier-festival-instagram/SKILL.md`. Keep `assets/`, `references/`, `scripts/`, and `agents/` beside it. Codex's local skill format uses YAML front matter with a name and description; repository skills are discovered under `.agents/skills`. If the new skill does not appear, restart Codex.

Official documentation checked on 25 September 2026:
https://developers.openai.com/codex/skills/
(This currently redirects to the official skill-building documentation.)

## First run

In Codex, use:

```text
$trier-festival-instagram

Reproduce the Blech.Brut example using the bundled brief, original logo,
and final serif reference images. Apply the documented factual correction.
Create the complete post package and its reusable editable template.
Preserve the approved design; do not redesign it.
```

The saved example already contains the brewery, selected entry, exact Story URL, personal connection and original logo, so those questions need not be asked again for this explicit reproduction. A new subject requires its own inputs.

## What is included

- `SKILL.md`: complete workflow and fixed campaign contract.
- Final serif feed/Story PNG references and the actual original logo sheet.
- Reference provenance/checksums and the saved Blech.Brut intake.
- Design calibration notes, editorial schedule, post-manifest schema, and regression cases.
- A standard-library Python file/manifest checker and Codex display metadata.

There are no font files, external service credentials, auto-publishing steps, or already-approved replacement renderer. The original images were generated, so an editable original template/font cannot honestly be claimed. The first Codex run calibrates a deterministic template against the actual references. After visual approval, later posts reuse that renderer. Repeating a valid unchanged final master can be byte-for-byte; newly reconstructed art is not automatically pixel-identical.

## Important correction

The earlier artwork says **2019**, but the selected Beer Chronicles entry says **2018**, checked on 25 September 2026:
https://beer-chronicles.org/?string=Blech.Brut

The reference images are therefore design references, **not ready-to-publish masters**. The skill requires the corrected factual date and the original logo rather than the model-redrawn representation in those references. Ticket availability must also be checked again; it is never inferred from the archived Story.

## Local checks

Verify the bundled assets after extraction:

```bash
python3 .agents/skills/trier-festival-instagram/scripts/check_package.py --references
```

Check a post package after Codex has created it:

```bash
python3 .agents/skills/trier-festival-instagram/scripts/check_package.py \
  --output social/trier-2026/blech-brut/v001
```

Use `--ready` only when publication-day facts, ticket checks, visual review and user approvals are complete. The checker is not a substitute for those reviews.

The bundle's metadata, reference checksums, and checker regression cases were tested during preparation. The skill has **not** been run inside your Codex installation or your repository, and no new production images have been silently approved.
