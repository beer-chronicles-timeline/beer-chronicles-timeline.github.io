# Zum WØL BrauArt — editable campaign source

The previously approved serif renderer, layout and font lock are copied byte-for-byte from Blech.Brut v001. Only content.json and the original logo differ. The user approved the hook/caption with “Approve and render”. Final artwork has been rendered and visually inspected at original resolution and 390px preview width; repeated rendering produced identical decoded pixels and PNG bytes.

Render after approval with the exact existing environment:

```sh
/private/tmp/zagreb-pdf-venv/bin/python source/render.py --output .
```

The renderer requires Python 3.11.11, Pillow 11.1.0 and FreeType 2.12.1, with the exact local Times New Roman Regular/Italic font hashes in render-lock.json. Fonts are referenced, never distributed. No application dependencies or backend access.

The full 400 × 400 supplied logo retains its background, all marks and original aspect ratio. source/evidence contains read-only public-page snapshots. source/qa is internal QA, not a third social image. Re-render to a separate temporary directory and compare decoded pixel hashes; inspect both actual exports at full resolution and phone width before delivery.
