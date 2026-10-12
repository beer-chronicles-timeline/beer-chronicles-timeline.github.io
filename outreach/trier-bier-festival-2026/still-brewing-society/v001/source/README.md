# Still Brewing Society — editable campaign source

The approved renderer, layout and font lock are copied unchanged from Schmelzer Brauhaus v001. Only content.json and the supplied original logo differ. Hook and caption approved by the user with “Go”. Fonts remain on the licensed host; no font files bundled.

Run from this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/still-brewing-render-check
```

Engine and font hashes are enforced by the renderer. Inspect exported files and synchronize post.json/qa.json after any change. Source evidence is retained in evidence/. Internal QA previews are not additional public images.
