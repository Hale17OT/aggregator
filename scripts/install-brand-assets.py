"""Install reviewed local vector exports into existing platform asset slots."""
from pathlib import Path
import runpy
_exports = runpy.run_path(str(Path(__file__).with_name('build-brand-assets.py')))
OUT, ROOT, PATH, GOLD, INK, icon = (_exports[k] for k in ['OUT', 'ROOT', 'PATH', 'GOLD', 'INK', 'icon'])
import json
import shutil

web=ROOT/'apps/web/public/brand'; mobile=ROOT/'apps/mobile/assets/brand'
web.mkdir(parents=True,exist_ok=True); mobile.mkdir(parents=True,exist_ok=True)
for name in ['mark.svg','mark-inverse.svg','favicon-mark.svg','wordmark-lockup.svg','app-icon.svg','splash-logo.svg','social-preview.svg','social-preview.png','favicon.ico','icon-16.png','icon-32.png','icon-48.png','icon-180.png','icon-192.png','icon-512.png','icon-1024.png','mark-transparent.png','mark-inverse.png']:
    shutil.copyfile(OUT/name,web/name)
for name in ['mark.svg','mark-inverse.svg','splash-logo.svg','mark-transparent.png','wordmark-lockup.svg']:
    shutil.copyfile(OUT/name,mobile/name)
shutil.copyfile(ROOT/'apps/mobile/assets/fonts/unifrakturmaguntia-LICENSE.txt',web/'masthead-font-OFL.txt')
res=ROOT/'apps/mobile/android/app/src/main/res'
vector=f'<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="256" android:viewportHeight="256"><group android:translateX="29" android:translateY="40"><path android:fillColor="{INK}" android:pathData="{PATH}"/></group></vector>'
(res/'drawable/aggregator_mark.xml').write_text(vector,encoding='utf8')
(res/'drawable/aggregator_icon.xml').write_text(vector.replace('<group',f'<path android:fillColor="{GOLD}" android:pathData="M0,0h256v256H0z"/><group'),encoding='utf8')
for density,n in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    icon(n).save(res/f'mipmap-{density}/ic_launcher.png')
(res/'mipmap-anydpi-v26').mkdir(exist_ok=True)
(res/'mipmap-anydpi-v26/ic_launcher.xml').write_text('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/brand_gold"/><foreground android:drawable="@drawable/aggregator_mark"/></adaptive-icon>',encoding='utf8')
(res/'values/brand.xml').write_text(f'<resources><color name="brand_gold">{GOLD}</color></resources>',encoding='utf8')
launch='<layer-list xmlns:android="http://schemas.android.com/apk/res/android"><item android:drawable="@color/brand_gold"/><item android:width="144dp" android:height="144dp" android:gravity="center" android:drawable="@drawable/aggregator_mark"/></layer-list>'
for folder in ['drawable','drawable-v21']:
    (res/folder/'launch_background.xml').write_text(launch,encoding='utf8')
p=res/'values-v31/styles.xml'; p.write_text(p.read_text().replace('#F7F3E8',GOLD).replace('@drawable/aggregator_icon','@drawable/aggregator_mark'),encoding='utf8')
p=ROOT/'apps/mobile/android/app/src/main/AndroidManifest.xml'; p.write_text(p.read_text().replace('android:icon="@drawable/aggregator_icon"','android:icon="@mipmap/ic_launcher"'),encoding='utf8')
ios=ROOT/'apps/mobile/ios/Runner/Assets.xcassets'
for item in json.loads((ios/'AppIcon.appiconset/Contents.json').read_text())['images']:
    n=round(float(item['size'].split('x')[0])*float(item['scale'][:-1]))
    icon(n).convert('RGB').save(ios/'AppIcon.appiconset'/item['filename'])
for item in json.loads((ios/'LaunchImage.imageset/Contents.json').read_text())['images']:
    icon(180*int(item['scale'][0]),bg=None).save(ios/'LaunchImage.imageset'/item['filename'])
p=ROOT/'apps/mobile/ios/Runner/Base.lproj/LaunchScreen.storyboard'
p.write_text(p.read_text().replace('red="1" green="1" blue="1"','red="0.847059" green="0.725490" blue="0.388235"').replace('width="168" height="185"','width="180" height="180"'),encoding='utf8')
print('Installed existing launcher/splash slots and web/mobile brand assets. Platform build inspection remains separate.')
