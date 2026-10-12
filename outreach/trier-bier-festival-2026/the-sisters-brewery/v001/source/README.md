# The Sisters Brewery — editable campaign source

Renderer, layout and font lock are copied byte-for-byte from the approved White Dog Brewery campaign package. Only approved copy and the supplied logo inputs differ. Full-image crop [0,0,400,400] removes nothing.

Run from this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/sisters-render-check
```

The renderer enforces exact Python, Pillow, FreeType and font hashes. Font files remain on the licensed host and are not bundled. content.json contains editable copy and logo inputs. Internal previews and rendering metadata are in source/qa; they are not additional public assets.
