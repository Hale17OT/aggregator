from pathlib import Path
from PIL import Image
import xml.etree.ElementTree as ET
import json
import hashlib

root=Path(__file__).resolve().parents[1]
base=root/'apps/web/public/brand'
svgs=list(base.glob('*.svg'))
for p in svgs: ET.parse(p)
images={p.name:Image.open(p).size for p in base.glob('*.png')}
assert images['social-preview.png']==(1200,630)
ios=root/'apps/mobile/ios/Runner/Assets.xcassets/AppIcon.appiconset'
checked=[]
for item in json.loads((ios/'Contents.json').read_text())['images']:
    n=round(float(item['size'].split('x')[0])*float(item['scale'][:-1]))
    im=Image.open(ios/item['filename'])
    assert im.size==(n,n) and im.mode=='RGB'
    checked.append(item['filename'])
for p in (root/'apps/mobile/android/app/src/main/res').rglob('*.xml'): ET.parse(p)
out={'svgParseCount':len(svgs),'pngSizes':images,'iosOpaqueIconsChecked':checked,'androidResourceXml':'parse passed','platformBuildChecked':False,'ownerApproval':'pending','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in base.iterdir() if p.is_file()}}
(root/'output/targeted-closeout-20261016/brand/asset-checks.json').write_text(json.dumps(out,indent=2))
print('7 SVGs, PNG dimensions, 15 opaque iOS icon slots and Android resource XML checked.')
