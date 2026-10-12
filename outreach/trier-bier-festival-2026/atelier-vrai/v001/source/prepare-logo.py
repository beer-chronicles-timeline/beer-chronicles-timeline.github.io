"""Isolate the complete lower-right mark from the supplied two-logo sheet.
A stepped crop excludes Blech.Brut while retaining every Atelier pixel and
its white background. No logo retouching, background removal or redrawing.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parent
original=Image.open(root/'assets/original-logo-sheet.png').convert('RGB')
assert hashlib.sha256((root/'assets/original-logo-sheet.png').read_bytes()).hexdigest()=='077ee8e7ec69cce2eba9fd4d301c7795dd171f7b76b53ae9e3ed0a632096f764'
bounds=(160,198,345,383)
crop=Image.new('RGB',(185,185),'white')
# Upper tile contains the full bird; lower tile contains its feet and lettering.
regions=[(240,198,345,242),(160,242,345,383)]
for rect in regions:
 crop.paste(original.crop(rect),(rect[0]-bounds[0],rect[1]-bounds[1]))
for rect in regions:
 local=(rect[0]-bounds[0],rect[1]-bounds[1],rect[2]-bounds[0],rect[3]-bounds[1])
 assert crop.crop(local).tobytes()==original.crop(rect).tobytes()
crop.save(root/'assets/selected-logo-crop.png')
(root/'assets/crop-provenance.json').write_text(json.dumps({'original_bounds':bounds,'retained_rectangles':regions,'omitted_area':'Upper-left region contains only the unrelated Blech.Brut mark and surrounding white; padded white to make square.','retained_pixels':'byte-identical before proportional resizing','sha256':hashlib.sha256((root/'assets/selected-logo-crop.png').read_bytes()).hexdigest(),'pixel_sha256':hashlib.sha256(crop.tobytes()).hexdigest()},indent=2)+'\n')
