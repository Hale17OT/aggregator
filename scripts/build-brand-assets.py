"""Local, deterministic vector identity exports. No network or generated media."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
from fontTools.pens.basePen import BasePen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/targeted-closeout-20261016/brand'
OUT.mkdir(parents=True, exist_ok=True)
GOLD, INK, CREAM = '#D8B963', '#18201E', '#F6F3ED'
# Original redrawing: retain the masthead's open bowl, diagonal return and upright.
PATH = 'M 79 29 C 40 24 25 60 40 80 C 45 87 53 89 54 98 C 35 91 23 81 23 62 C 23 35 45 17 70 17 C 100 17 114 38 108 64 C 104 84 88 104 66 121 C 80 118 91 139 105 136 C 114 134 123 127 130 118 L 130 49 C 130 41 128 38 120 36 L 161 17 L 153 45 L 153 120 C 153 137 159 140 175 132 L 151 158 C 137 156 131 146 130 133 C 117 146 106 159 94 159 C 79 159 64 139 52 139 L 37 143 L 37 134 C 68 113 88 86 88 63 C 88 46 84 36 79 29 Z'
ALT = PATH.replace('L 161 17 L 153 45', 'L 163 25 L 153 45')
TINY = 'M79 29 C40 24 25 60 40 80 L54 98 C33 91 23 80 23 62 C23 35 45 17 70 17 C100 17 114 38 108 64 C104 84 88 104 66 121 C80 118 91 139 105 136 C114 134 123 127 130 118 L130 43 L120 36 L161 17 L153 45 L153 120 C153 137 159 140 175 132 L151 158 C137 156 131 146 130 133 C117 146 106 159 94 159 C79 159 64 139 52 139 L37 143 L37 132 C68 111 88 86 88 63 C88 46 84 36 79 29 Z'

def svg(path=PATH, bg=None, fg=INK, size=192):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 176" width="{size}" height="{size*176/192:g}" role="img" aria-label="The Aggregator"><path fill="{fg}" d="{path}"/></svg>' if bg is None else f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="{bg}" d="M0 0h256v256H0z"/><g transform="translate(29 40)"><path fill="{fg}" d="{path}"/></g></svg>'

class RasterPen(BasePen):
    def __init__(self, draw, scale, offset, color):
        super().__init__(None); self.draw=draw; self.scale=scale; self.offset=offset; self.color=color
    def _moveTo(self,p): self.points=[p]
    def _lineTo(self,p): self.points.append(p)
    def _curveToOne(self,a,b,c):
        p=self.points[-1]
        for i in range(1,33):
            t=i/32; u=1-t
            self.points.append((u**3*p[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t**3*c[0],u**3*p[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t**3*c[1]))
    def _closePath(self):
        self.draw.polygon([(x*self.scale+self.offset[0], y*self.scale+self.offset[1]) for x,y in self.points],fill=self.color)
    def _endPath(self): self._closePath()

def icon(size, path=PATH, bg=GOLD, fg=INK):
    n=size*4; im=Image.new('RGBA',(n,n),bg if bg else (0,0,0,0))
    parse_path(path,RasterPen(ImageDraw.Draw(im),n/256,(n*29/256,n*40/256),fg))
    return im.resize((size,size),Image.Resampling.LANCZOS)

font_path=ROOT/'apps/mobile/assets/fonts/Masthead.ttf'
font=TTFont(font_path); glyphs=font.getGlyphSet(); cmap=font.getBestCmap()
def word_paths(text, x, baseline, height):
    scale=height/font['head'].unitsPerEm; paths=[]
    for char in text:
        name=cmap[ord(char)]; pen=SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen,(scale,0,0,-scale,x,baseline)))
        paths.append(pen.getCommands()); x+=font['hmtx'][name][0]*scale
    return ''.join(paths)

for name,path in [('mark',PATH),('favicon-mark',TINY)]:
    (OUT/f'{name}.svg').write_text(svg(path),encoding='utf8')
(OUT/'mark-inverse.svg').write_text(svg(fg=GOLD),encoding='utf8')
(OUT/'app-icon.svg').write_text(svg(bg=GOLD),encoding='utf8')
(OUT/'splash-logo.svg').write_text(svg(),encoding='utf8')
lockup=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 192" role="img" aria-label="The Aggregator"><g transform="translate(0 8)"><path fill="{INK}" d="{PATH}"/></g><path fill="{INK}" d="{word_paths("The Aggregator",220,126,96)}"/></svg>'
(OUT/'wordmark-lockup.svg').write_text(lockup,encoding='utf8')
for n in [16,32,48,180,192,512,1024]: icon(n,TINY if n<=48 else PATH).convert('RGB').save(OUT/f'icon-{n}.png')
icon(512,bg=None).save(OUT/'mark-transparent.png')
icon(512,bg=None,fg=GOLD).save(OUT/'mark-inverse.png')
icon(48,TINY).save(OUT/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])

# Compare three genuinely different treatments, including the unchanged source glyph.
sheet=Image.new('RGB',(1200,630),CREAM); d=ImageDraw.Draw(sheet)
plain=ImageFont.truetype(str(ROOT/'apps/mobile/assets/fonts/Manrope.ttf'),22)
for i,(label,path) in enumerate([('01 · Masthead fidelity',None),('02 · Open-bowl / selected',PATH),('03 · Blunt terminal',ALT)]):
    x=30+i*400; d.text((x,25),label,font=plain,fill=INK)
    if path:
        sheet.paste(icon(300,path),(x,80))
    else:
        tile=Image.new('RGB',(300,300),GOLD); td=ImageDraw.Draw(tile)
        td.text((32,-12),'A',font=ImageFont.truetype(str(font_path),280),fill=INK)
        sheet.paste(tile,(x,80))
    for j,n in enumerate([16,32,48]):
        if path: tiny=icon(n,path)
        else:
            tiny=tile.resize((n,n),Image.Resampling.LANCZOS)
        sheet.paste(tiny,(x+j*90,420)); d.text((x+j*90,480),str(n)+'px',font=plain,fill=INK)
sheet.save(OUT/'directions-comparison.png')

preview=Image.new('RGB',(1200,630),GOLD); d=ImageDraw.Draw(preview)
preview.paste(icon(300),(450,65)); d.line((120,400,1080,400),fill=INK,width=2)
wf=ImageFont.truetype(str(font_path),100); d.text((600,480),'The Aggregator',font=wf,fill=INK,anchor='mm')
d.text((600,555),'Read. Listen. Watch.',font=plain,fill=INK,anchor='mm'); preview.save(OUT/'social-preview.png')
(OUT/'social-preview.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><path fill="{GOLD}" d="M0 0h1200v630H0z"/><g transform="translate(487.5 112) scale(1.172)"><path fill="{INK}" d="{PATH}"/></g><path stroke="{INK}" stroke-width="2" d="M120 400H1080"/><path fill="{INK}" d="{word_paths("The Aggregator",285,505,100)}"/></svg>',encoding='utf8')
splash=Image.new('RGB',(390,844),GOLD); splash.paste(icon(180),(105,270)); ds=ImageDraw.Draw(splash)
ds.text((195,475),'The Aggregator',font=ImageFont.truetype(str(font_path),36),fill=INK,anchor='mm'); splash.save(OUT/'splash-preview.png')
surfaces=Image.new('RGB',(1200,720),CREAM); dd=ImageDraw.Draw(surfaces)
surfaces.paste(icon(256),(50,65)); dd.text((50,340),'Square launcher',font=plain,fill=INK)
circle=Image.new('RGB',(256,256),CREAM); mask=Image.new('L',(256,256)); ImageDraw.Draw(mask).ellipse((0,0,255,255),fill=255)
circle.paste(icon(256),(0,0),mask); surfaces.paste(circle,(350,65)); dd.text((350,340),'Circular crop',font=plain,fill=INK)
surfaces.paste(splash.resize((234,506)),(900,65)); dd.text((900,600),'Splash',font=plain,fill=INK)
for j,n in enumerate([16,32,48]): surfaces.paste(icon(n,TINY),(50+j*100,430)); dd.text((50+j*100,500),str(n)+'px',font=plain,fill=INK)
surfaces.paste(icon(192,bg=INK,fg=GOLD),(600,430)); surfaces.save(OUT/'usage-surfaces.png')
print(str(OUT))
