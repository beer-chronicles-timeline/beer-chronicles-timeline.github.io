# White Dog Brewery — editable campaign source

The approved serif renderer, layout and font lock are reused byte-for-byte from the existing Totenhopfen package. Only approved content and the original supplied logo differ. The original 400 × 400 PNG and white background are preserved; the full-image crop [0,0,400,400] removes nothing. Source URL and checksum are in post.json.

Render from the package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/white-dog-render-check
```

The renderer enforces exact Python/Pillow/FreeType versions and font hashes from render-lock.json. Font files remain on the licensed host and are not bundled. content.json holds text and logo inputs. layout.json holds the fixed geometry and colours. Final PNGs are opaque RGB with sRGB metadata. source/qa contains internal previews and render metadata, not extra social assets.
