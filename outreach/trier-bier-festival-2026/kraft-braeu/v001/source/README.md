# Kraft Bräu · approved Trier serif template

This package reuses the user-approved `trier-serif-v1.0.0-calibration` layout, renderer, and Times New Roman font lock from the Blech.Brut package. The Kraft Bräu logo and copy are new inputs. The user approved the hook and caption with “Approve and finalise” before rendering.

Render from the repository root:

```sh
/private/tmp/zagreb-pdf-venv/bin/python social/trier-2026/kraft-braeu/v001/source/render.py --output social/trier-2026/kraft-braeu/v001
```

The renderer checks exact engine and local font hashes, preserves the original logo’s full 400 × 400 image and black background, composes real text, and exports opaque sRGB PNGs. It has no network or database access. Font files are not bundled.

`content.json` contains editable copy and logo provenance. `layout.json`, `render.py`, and `render-lock.json` are unchanged from the approved master. `assets/original-logo.jpg` retains the exact supplied bytes. `evidence/` contains public HTTP snapshots, not executable input. `qa/` will contain internal phone-size previews and rendering records; these are not extra public social images.

To verify repeatability, render once into the package and again into a separate scratch directory, then compare decoded pixel SHA-256 hashes. Inspect both actual images at full resolution and phone size. Record the actual results in `qa.json` and `post.json`, and run:

```sh
python3 .agents/skills/trier-festival-instagram/scripts/check_package.py --references --output social/trier-2026/kraft-braeu/v001
```

Personal intake notes and source snapshots belong in this private working package. Do not move them into website assets or commit them without review.
