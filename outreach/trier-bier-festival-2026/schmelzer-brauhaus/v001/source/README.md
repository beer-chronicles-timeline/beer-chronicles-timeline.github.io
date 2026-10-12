# Schmelzer Brauhaus — reusable editable template

Approved campaign renderer, layout and font lock reused byte-for-byte. The user approved this hook/caption and final rendering with “Go” Only content.json and the original logo differ from the Blech.Brut template.

## Render

From this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/schmelzer-render-check
```

The existing environment provides the exact Python/Pillow/FreeType versions in render-lock.json. On another host, provision the same versions and legitimately licensed font files. Fonts are not bundled; mismatched engine/font hashes stop rendering. No app dependencies, network or backend needed.

## Edit and reuse

content.json contains editable text, image path/hash and full-image crop. layout.json fixes approved colours, sizes, positions and tracking. render.py composes real text and the original image, with controlled text fitting, 3× supersampling and LANCZOS downsampling. It outputs feed.png, story.png and render-results.json; PNGs have opaque RGB pixels and explicit sRGB metadata.

For a new participant, create a new subject/version directory and change only approved text/logo inputs. Keep fonts/layout/engine fixed. Do not reuse personal notes, ticket evidence or approval flags for a different subject. Never overwrite an approved master version. Preserve each user's exact Story URL in the manifest and handoff.

Synchronize copy and manifest; inspect actual exports at full resolution and phone width; render twice to separate directories and compare decoded hashes. Update post.json output hashes and run the campaign check_package.py script. Internal source/qa previews are not social outputs. Keep private input notes out of public website assets and do not commit without review.
