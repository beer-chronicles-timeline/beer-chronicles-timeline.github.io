# Prümer Brauhaus — editable campaign source

The user approved the 2021 opening hook and caption. This package uses the previously approved serif layout, colours, Times New Roman font lock and export sizes. `layout.json` and `render-lock.json` are byte-identical to the existing campaign template.

The supplied 1024 × 330 PNG is stored unchanged at `assets/original-logo.png`. Unlike the earlier opaque logos, it has transparent pixels. `render.py` therefore composites its existing alpha channel onto the cream canvas. The logo is fitted proportionally within the established central logo area, with a wider maximum width for this wide mark. No logo marks, lettering or colours are redrawn or removed.

Re-render on the same host with:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output .
```

The renderer requires Python 3.11.11, Pillow 11.1.0 and FreeType 2.12.1. The exact local Times New Roman Regular and Italic font files and SHA-256 hashes are in `render-lock.json`; fonts are referenced, not distributed. `source/qa` contains internal review artefacts, not additional public social images.
