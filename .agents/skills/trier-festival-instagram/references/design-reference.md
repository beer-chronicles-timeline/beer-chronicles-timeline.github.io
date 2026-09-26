# Approved visual direction and reproduction limits

## Actual references

Open these files; do not substitute remembered or newly generated examples:

- `../assets/references/blech-brut-feed-serif.png` — the final serif feed reference, 1122 × 1402 pixels.
- `../assets/references/blech-brut-story-serif.png` — the final, less-empty serif Story reference, 941 × 1672 pixels.
- `../assets/originals/blech-brut-and-atelier-vrai.png` — the user-supplied original, 400 × 400 pixels.

These are the existing files from the design discussion, not reconstructions. Their hashes are in `../assets/reference-manifest.json`.

The user preferred the serif versions after comparing them with sans-serif alternatives. The user rejected the large blank section in an earlier Story. Preserve the final reference's character and hierarchy, with a modest sticker slot, not the earlier oversized gap.

## Two necessary distinctions

**Visual reference is not factual approval.** The references show 2019, which was an assistant error. The selected Beer Chronicles entry says 2018 as observed on 25 September 2026. New production artwork and captions must use the verified date. Do not silently change the archived references, and do not publish them as final artwork.

**Generated representation is not original logo art.** The earlier references were generated images. Their apparent logo and lettering are not proof of pixel fidelity to the user's original. For production, place the actual supplied logo; never extract the model's redrawn version from the reference. If preserving the original mark creates a small visual difference, preserve authenticity and report the difference.

The original file contains two separate marks. Blech.Brut is the upper-left black circle; Atelier Vrai is the lower-right mark. For this Blech.Brut feature, the complete upper-left logo fits within `(left=0, top=0, right=240, bottom=242)` in the 400 × 400 original. Verify that crop visually. Do not include the other brand, crop inside the selected mark, or regenerate its edge/letters. Record the original and crop hashes. Its opaque white background is not permission for automatic background removal; a clean white logo area is acceptable. A better source file can be requested if enlargement proves inadequate, but missing high resolution must not lead to invented artwork.

## Visual contract

Centred, symmetrical, quiet, editorial. Warm off-white background, nearly black text, fine copper rules. No photographic imagery, ornate beer motifs, shadows, gradients added for decoration, panels full of logos, or festival logo. Do not put the exact entry title in an unreadably small type size simply to avoid rephrasing a hook.

The main series title uses this wording and preferred break:

```text
The Stories Behind the
Trier Beer Festival 2026
```

The presenter above it is a smaller, widely spaced `BEER CHRONICLES`, with one short fine rule on each side. It is not a newly invented logo.

The subject logo is the central visual. Under it, the selected event's date appears in copper, flanked by rules; the hook is in dark serif type. The footer uses:

```text
TRIER BEER FESTIVAL · 2–3 OCTOBER 2026 · BLESIUS GARTEN
```

The website is a small serif italic signature with short copper rules. In the Story, the truthful ticket note is also a restrained copper italic line.

## First template calibration

There is no recovered editable source or identified font for the image-generated prototypes. Do not claim otherwise. A text prompt is not a pixel-perfect reproduction recipe. The bundle deliberately contains no substitute font files and no unapproved replacement design.

Create an editable deterministic template in the actual Codex workspace, using available tools. Match these real references and show the first calibrated result. Once approved, save the template, layout data, engine version, exact locally available font identity/hash, and render command. Later posts are data substitutions in this locked template, not new design exercises.

Suggested **starting** tokens, not recovered original source values:

| Token | Calibration starting value |
|---|---|
| Background | `#FEFCF7` |
| Main type | `#191919` |
| Copper | `#B8642B` |
| Canvas | 1080 × 1350 feed; 1080 × 1920 Story |
| Horizontal margins | Approximately 60–75 px |
| Rule thickness | Approximately 1–2 px |
| Primary font | A locally available, approved high-contrast editorial serif |
| Small copy | Serif small capitals/tracking; website and ticket note serif italic |

Tune against the references once. Do not change these tokens per brewery after template approval. Never silently substitute a fallback font. If no sufficiently similar installed serif exists, say so and ask for a font choice; do not distribute font files as part of a post package.

Visual structure, not inflexible coordinates:

- Feed: header and title in the upper quarter; substantial central logo; date and hook below; divider and compact footer/signature at the bottom.
- Story: same sequence, vertically balanced, with one compact sticker area between hook and footer.
- At 1080 × 1920, a starting sticker reservation is roughly 480–600 px wide and 100–140 px tall. Keep a little surrounding clearance, not several hundred pixels of unused height.
- Use roughly the top/bottom 160–200 px as provisional interface-safety bands when feasible, not as a claimed Instagram guarantee. Validate against the actual publishing UI; do not push the signature into controls to preserve an arbitrary reference coordinate.
- Keep the headline and footer legible at about 360–390 px preview width. Split long footer text cleanly rather than shrinking it into a hairline.
- Fit hooks to at most two readable lines. Fit the logo proportionally within its box; optical size may vary for a wide or unusually shaped mark, but never stretch it.

A corrected date, authentic original logo, and necessary interface clearance take priority over copying a known defect. Explicitly describe these changes in the first calibration review.

## Repeatability and comparison

For an unchanged approved master, exact reproduction means byte-for-byte copy and checksum verification. For a newly rendered post, exact repeatability means identical decoded pixels with the same data, fonts, assets, template and rendering stack.

A reference-comparison image can be generated privately for QA; it is not a third social asset. Compare type, alignment, spacing and logo placement at equal dimensions. Do not call a similarity check “pixel-identical” when the date, original logo, font, or canvas dimensions differ.

Source records: the images and logo were provided in the conversation; the date correction was checked against `https://beer-chronicles.org/?string=Blech.Brut` on 25 September 2026.
