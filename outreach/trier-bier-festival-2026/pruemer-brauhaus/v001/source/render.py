#!/usr/bin/env python3
"""Offline, deterministic campaign renderer. Fonts stay on the licensed host."""
import argparse
import hashlib
import json
import platform
from pathlib import Path
import PIL
from PIL import Image, ImageDraw, ImageFont, PngImagePlugin, features

ROOT = Path(__file__).resolve().parent
SCALE = 3

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def engine():
    return {'python': platform.python_version(), 'pillow': PIL.__version__,
            'freetype': features.version_module('freetype2'), 'supersampling': SCALE,
            'layout_engine': 'Pillow BASIC', 'resampling': 'LANCZOS'}

def render(out):
    layout = json.loads((ROOT / 'layout.json').read_text())
    data = json.loads((ROOT / 'content.json').read_text())
    lock = json.loads((ROOT / 'render-lock.json').read_text())
    if engine() != lock['engine']:
        raise RuntimeError('Rendering engine differs from lock; review before changing it.')
    for font in lock['fonts']:
        if sha(Path(font['path'])) != font['sha256']:
            raise RuntimeError('Font differs from lock: ' + font['path'])
    logo_path = ROOT / data['logo_path']
    if sha(logo_path) != data['logo_sha256']:
        raise RuntimeError('Original logo differs from saved provenance')
    logo = Image.open(logo_path).convert('RGBA').crop(data['logo_crop'])
    out.mkdir(parents=True, exist_ok=True)
    results = {}
    for kind in ('feed', 'story'):
        spec = layout[kind]
        canvas = Image.new('RGB', (1080*SCALE, spec['height']*SCALE), layout['background'])
        draw = ImageDraw.Draw(canvas)
        bounds = []

        def rule(x1, x2, y):
            draw.line((x1*SCALE, y*SCALE, x2*SCALE, y*SCALE), fill=layout['copper'], width=3)

        def text(value, y, size, width, tracking=0, italic=False, copper=False):
            font_path = lock['fonts'][int(italic)]['path']
            def measure(size):
                font = ImageFont.truetype(font_path, round(size*SCALE), layout_engine=ImageFont.Layout.BASIC)
                length = draw.textlength(value, font=font) + tracking*SCALE*(len(value)-1)
                return font, length
            font, length = measure(size)
            while length > width*SCALE:
                size -= .25
                if size < 20:
                    raise ValueError('Text exceeds controlled fitting range')
                font, length = measure(size)
            box = font.getbbox(value)
            x = (1080*SCALE-length)/2
            top = y*SCALE-box[1]
            color = layout['copper'] if copper else layout['ink']
            if tracking:
                for ch in value:
                    draw.text((x,top), ch, font=font, fill=color)
                    x += draw.textlength(ch,font=font)+tracking*SCALE
            else:
                draw.text((x,top), value,font=font,fill=color)
            bounds.append({'text':value,'top':y,'height':(box[3]-box[1])/SCALE,'width':length/SCALE,'font_size':size})

        text(data['presenter'], spec['header'], 30, 520, tracking=8)
        rule(196,268,spec['header']+13)
        rule(812,884,spec['header']+13)
        for line, item in zip(data['series_lines'], spec['title']):
            text(line, item['y'], item['size'], item['width'], tracking=item.get('tracking',0))
        # Keep the established square logo area's height; fit this wide logo
        # proportionally inside the available horizontal canvas space.
        logo_box_height=spec['logo']['width']
        logo_max_width=920 if kind=='feed' else 950
        logo_width=min(logo_max_width, round(logo_box_height*logo.width/logo.height))
        logo_height=round(logo_width*logo.height/logo.width)
        resized=logo.resize((logo_width*SCALE,logo_height*SCALE),Image.Resampling.LANCZOS)
        logo_y=spec['logo']['y']+(logo_box_height-logo_height)//2
        canvas.paste(resized,((1080-logo_width)*SCALE//2,logo_y*SCALE),resized)
        text(data['date'],spec['date'],60,230,tracking=7,copper=True)
        rule(237,434,spec['date']+26)
        rule(646,843,spec['date']+26)
        hook=data['hook_lines']
        if len(hook)>2: raise ValueError('At most two hook lines permitted')
        for index,line in enumerate(hook):
            text(line,spec['hook']+index*64,60,spec['hook_width'],tracking=-1.1)
        rule(68,1012,spec['divider'])
        text(data['footer'],spec['footer'],23,940,tracking=3.2)
        if kind=='story':
            text(data['ticket_note'],spec['ticket'],35,730,italic=True,copper=True)
            rule(68,152,spec['ticket']+17)
            rule(928,1012,spec['ticket']+17)
        text(data['website'],spec['signature'],29,350,tracking=.6,italic=True)
        rule(339,403,spec['signature']+14)
        rule(677,741,spec['signature']+14)
        canvas=canvas.resize((1080,spec['height']),Image.Resampling.LANCZOS)
        pnginfo=PngImagePlugin.PngInfo()
        pnginfo.add(b'sRGB',b'\x00')
        path=out/(kind+'.png')
        canvas.save(path,pnginfo=pnginfo,compress_level=9)
        results[path.name]={'sha256':sha(path),'pixel_sha256':hashlib.sha256(canvas.tobytes()).hexdigest(),
                            'dimensions':list(canvas.size),'mode':canvas.mode,'text_bounds':bounds}
    (out/'render-results.json').write_text(json.dumps(results,indent=2)+'\n')
    return results

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=ROOT.parent)
    args=parser.parse_args()
    render(args.output.resolve())
