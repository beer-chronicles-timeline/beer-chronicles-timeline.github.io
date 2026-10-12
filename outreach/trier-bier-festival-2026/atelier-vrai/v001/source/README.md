# Atelier VRAI · approved Trier serif template

From this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/prepare-logo.py
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/atelier-vrai-reproduction
```

Renderer, layout and font lock are unchanged from the approved Blech.Brut v001 template. Only approved copy and logo inputs differ. The renderer rejects changed engine or font hashes. Fonts remain on the licensed host and are not bundled.

prepare-logo.py deterministically extracts the complete Atelier mark from the supplied sheet in two adjoining rectangles. Their original coordinates are recorded in assets/crop-provenance.json. The upper-left excluded region belongs to Blech.Brut; white padding preserves the original Atelier background. Every retained source pixel is verified unchanged. No redrawing, retouching or background removal.

The 185 × 185 crop is enlarged proportionally. Its native softness cannot be repaired without a higher-resolution original. content.json and the original sheet are preserved; no web application or database access is needed to reproduce.

qa/ holds internal phone previews and render metadata, not additional public posts. evidence/ stores read-only source snapshots. No fonts, credentials or website deployment files are included.
