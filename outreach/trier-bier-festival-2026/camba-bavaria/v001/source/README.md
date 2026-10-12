# Camba Bavaria — editable campaign source

The approved layout, font lock, typography and colours are retained. render.py has only the necessary alpha-compositing adjustment: load the original RGBA logo and use its alpha channel when placing it on the opaque cream canvas. This preserves supplied transparency without removing any background. Original 400 × 400 PNG bytes are unchanged; full-image crop [0,0,400,400] removes nothing.

Render from the package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/camba-render-check
```

The engine and font hashes are enforced by render-lock.json. Fonts remain on the licensed host; none are bundled. content.json contains approved text and logo input; layout.json fixes geometry and colours. Final PNGs are opaque RGB with explicit sRGB metadata. source/qa contains internal phone previews and render metadata, not additional public assets. post.json records provenance, hashes, evidence and approvals.
