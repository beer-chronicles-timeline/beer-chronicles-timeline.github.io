# Trier serif template — calibrated v1.0.0

Editable production source for one feed and one Story. This version was approved by the user on 25 September 2026; source hashes are frozen in post.json. It reproduces the supplied design direction; it does not recover an unavailable original font/source.

## Render

From this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/trier-render-check
```

The current Python environment already provides the exact Pillow/FreeType versions in render-lock.json. On another host, provision a legitimately licensed copy of the recorded fonts and the same engine before rendering. Fonts are not bundled. The renderer refuses mismatched engine/font hashes; no network, app dependencies or Supabase access is required.

## Editable inputs

- content.json: presenter, series line breaks, year, hook (at most two lines), footer, ticket note, website, original logo path/hash and crop.
- layout.json: fixed canvas, colours, coordinates, type sizes, tracking and modest Story sticker area. Coordinates are output pixels; text y values specify the ink's top edge.
- render-lock.json: exact Python/Pillow/FreeType identities and font file hashes.
- render.py: deterministic text and image composition with 3× supersampling, BASIC text layout and LANCZOS downsampling; writes RGB PNGs with an explicit sRGB chunk.
- assets/original-logo-sheet.png: unchanged supplied original. selected-logo-crop.png is a provenance/inspection copy; render.py derives the same crop from the original.

To reuse after approval, copy this source folder into a new subject/version package. Change only approved content/logo inputs; update the input logo hash and crop. Keep layout/font/engine fixed. A long hook or differently shaped logo needs controlled fitting and visual review; the two-line hook option does not automatically move the footer. Never overwrite an approved output version.

A render creates feed.png, story.png and render-results.json. For a new package, synchronize post.json, all copy files and publishing notes, inspect both images, rerender to a separate scratch directory and compare decoded pixel hashes. Do not copy old ticket evidence, dates or approval flags. Freezing this candidate means recording explicit approval against the content/layout/renderer hashes in post.json, without changing the rendered inputs.

Internal qa/ previews and comparisons are not public social outputs. evidence/ contains readable source snapshots, not executable page code. post.json contains intake/personal notes: keep the package out of public website assets and do not commit it without review.
