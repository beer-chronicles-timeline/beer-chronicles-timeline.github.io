# Tough Love — editable campaign source

Renderer, layout and font lock are copied byte-for-byte from the approved Sisters Brewery package. Only approved text and original logo inputs differ. Full-image crop [0,0,400,400] removes nothing.

Run from this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/tough-love-render-check
```

The renderer enforces exact Python, Pillow, FreeType and font hashes. Font files remain on the licensed host and are not bundled. content.json contains editable text and logo inputs. Internal previews and rendering metadata are in source/qa, not additional public assets.
