# Brewderschaft Trier — reusable campaign template

The approved Blech.Brut renderer, layout and font lock are byte-identical here. Only content.json and the supplied logo differ. The user approved this hook/caption and rendering with “Go”.

## Reproduce

From this package directory:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output /private/tmp/brewderschaft-render-check
```

Exact Python, Pillow, FreeType and font hashes are locked in render-lock.json. This environment is already installed. On another computer, provision matching versions and legitimately licensed font files before rendering. Fonts are never bundled. A differing engine/font hash causes the renderer to stop.

## Editable inputs

content.json contains the original logo path/hash and full-image crop, year, hook, series, footer, website and ticket note. layout.json fixes the approved positions/colours/sizes. render.py composes real text and the original image with 3× supersampling and LANCZOS downsampling. It writes two opaque RGB PNGs with an explicit sRGB chunk and render-results.json with pixel/file hashes.

For another post, create a new subject/version directory and substitute only approved copy and logo inputs. Keep the layout/font lock fixed; visually review controlled logo or longer-hook fitting. Preserve the user-supplied Story URL in the manifest and handoff. Do not reuse this post's personal notes, ticket evidence or approval flags for another subject.

For revisions, create a new version rather than overwrite approved masters. Synchronize caption/Story/alt text with post.json, inspect both actual exports at full and phone size, render twice to separate directories and compare decoded hashes. Run the bundled campaign package checker after updating output hashes. The public images are feed.png and story.png only; source/qa previews are internal.

post.json contains user intake notes. Keep this package out of public website assets and do not commit without review. No application dependencies, network or backend access are needed to render.
