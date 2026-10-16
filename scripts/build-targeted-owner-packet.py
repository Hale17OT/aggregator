from pathlib import Path
from html import escape
import hashlib,json
root=Path(__file__).resolve().parents[1]
run=root/'output/targeted-closeout-20261016'
apk=run/'main/aggregator-targeted-local-demo-r2.apk'
assert apk.exists(), 'Final main artifact required'
preserve=json.loads((run/'preservation/preservation-after-r2.json').read_text(encoding='utf-8'))
profile=json.loads((run/'profile/playback-noidle/comparison.json').read_text(encoding='utf-8'))
old=root/'output/review/shortform-rebuild.html'
backup=run/'baseline/prior-owner-packet.html'
if not backup.exists(): backup.write_bytes(old.read_bytes())
sha=hashlib.sha256(apk.read_bytes()).hexdigest()
base='../targeted-closeout-20261016/'
def image(path,label):
    assert (run/path).exists(),path
    return f'<figure><img src="{base}{path}" alt="{escape(label)}"><figcaption>{escape(label)}</figcaption></figure>'
body='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>The Aggregator — targeted repair review</title><style>body{max-width:1100px;margin:2rem auto;padding:0 1rem;background:#f6f3ed;color:#18201e;font:17px/1.5 system-ui}h1,h2{font-family:Georgia}code{overflow-wrap:anywhere}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem}img{max-width:100%;max-height:780px;object-fit:contain}figure{margin:0}table{border-collapse:collapse;width:100%}td,th{padding:.6rem;text-align:left;border-bottom:1px solid #aaa}a{color:#205d70}video{max-width:100%;max-height:700px}</style><h1>Targeted repair review — 16 October 2026</h1><p>This is a local-demo repair candidate, not owner acceptance or release clearance. Staff/MFA stays paused.</p>'''
body+=f'<p><a href="http://127.0.0.1:3000/clips">Web Clips</a> · <a href="http://127.0.0.1:3000/newsroom">Newsroom</a> · <a href="{base}main/aggregator-targeted-local-demo-r2.apk">New normal main APK</a><br>SHA256 <code>{sha}</code></p>'
body+='''<h2>What to review</h2><ol><li>Play a Clip, tap the picture to pause, change items, seek, open Sources, and return. It should remain on the same item and paused after external actions.</li><li>Open Newsroom settings at a narrow width. Controls wrap below the picture and remain readable.</li><li>On Android, try More/transcript, Share and Back, large text, and the new launcher mark. Sharing reports opening the chooser, not delivery.</li></ol><p>Original normal-main load incident remains unexplained. Separately reproduced lifecycle races are repaired. The detailed ledger retains later failed attempts and exact coverage; successful retries are not proof of the original cause.</p>'''
body+=f'<p>Preservation: {preserve["renditions"]} renditions / {preserve["assetCount"]} original assets, retained migration history and previous member-row digests verified.</p>'
body+='<h2>Matched Newsroom reflow</h2><div class="grid">'+image('evidence/reflow-before/320-light-1.png','Before: 320px, light, settings open')+image('evidence/reflow-after-3/320-light-1.png','After: matched 320px, light, settings open')+'</div>'
body+='<h2>Normal Android main candidate</h2><div class="grid">'+image('evidence/native-before/picture-paused.png','Preserved 493 main baseline, ready paused')+image('evidence/native-after-r2/picture-paused.png','New main candidate, picture-tap pause')+image('evidence/native-after-r2/sources.png','New main candidate, Sources')+image('evidence/native-after-r2/compact-2x-more.png','New main candidate, compact screen and 2× text')+'</div>'
body+='<h2>Actual recordings</h2><p>Uncut input recordings. Recording, frame inspection, normal-speed watching and subjective listening are separate. Available tool policy prevented normal-speed watching/listening; no such approval is claimed.</p>'
for path,label in [('evidence/native-after-r2/interaction-uncut.mp4','Native main interaction'),('evidence/native-retry-after-r2/interaction-uncut.mp4','Deliberately induced network failure and Retry')]:
    if (run/path).exists():body+=f'<p>{label}</p><video controls preload="metadata" src="{base}{path}"></video>'
body+='<h2>Matched profile diagnostic</h2><pre>'+escape(json.dumps(profile['summary'],indent=2))+'</pre><p>'+escape(profile['gate'])+'. UI and raster are separate; emulator results do not certify a physical phone. The original mixed-workload raster and web callback/CPU4 failures remain visible.</p>'
body+='<p>Final assisted captured-mail member journey passed. Earlier pre-handoff failures and a protected request account-row lock timeout remain recorded; same-device Chrome is not verified.</p>'
body+='<p>Final review also repaired dark-on-dark Retry/icon contrast. Both paper-theme widget regressions pass; the first candidate and its failed-contrast capture are retained.</p>'
body+='<h2>Review boundaries</h2><p>Physical Android, TalkBack, subjective listening, owner visual/motion approval, Figma and iOS remain pending. All original videos are unchanged, including small embedded source graphics. No production release is authorized.</p><p><a href="../../docs/execution/TARGETED_CLOSEOUT.md">Commands, attempts and defect results</a> · <a href="../../docs/execution/SHORTFORM_ACCEPTANCE.md">Original 48-case acceptance register</a> · <a href="../../docs/design/BRAND_SYSTEM.md">Brand assets and usage</a></p></html>'
web_recordings=list((run/'evidence/web-journey-after-r2').glob('*.webm'))
if web_recordings:
    path=web_recordings[0].relative_to(run).as_posix()
    body=body.replace('<h2>Matched profile diagnostic</h2>',f'<p>Full desktop journey, 41.84 seconds, no audio track. Native recordings above: 110.93 and 59.98 seconds, no audio tracks.</p><video controls preload="metadata" src="{base}{path}"></video><h2>Matched profile diagnostic</h2>')
old.write_text(body,encoding='utf-8')
print(old)
