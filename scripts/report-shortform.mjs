import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const dir='docs/engineering/shortform-rebuild';mkdirSync(dir,{recursive:true});
const source={};
function walk(p){for(const e of readdirSync(p,{withFileTypes:true})){if(['node_modules','build','.dart_tool','.gradle','.nuxt','.output'].includes(e.name))continue;const f=join(p,e.name);if(e.isDirectory())walk(f);else if(/\.(vue|dart|ts|kt|xml|json|yaml|lock|kts|properties)$/.test(f))source[f.replaceAll('\\','/')]=hash(f);}}
for(const p of ['apps/web/app','apps/mobile/lib','apps/mobile/android/app/src','packages'])walk(p);
for(const p of ['package-lock.json','apps/mobile/pubspec.lock','apps/mobile/pubspec.yaml'])source[p]=hash(p);
const apk='output/shortform-rebuild/aggregator-shortform-local-demo.apk';
const buildFiles={};function buildWalk(p){for(const e of readdirSync(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())buildWalk(f);else buildFiles[f.replaceAll('\\','/')]=hash(f);}}buildWalk('apps/web/.output');
const manifest={at:new Date().toISOString(),apk:{path:apk,sha256:hash(apk),bytes:statSync(apk).size,entrypoint:'lib/main.dart',flavor:'localDemo debug'},webBuild:{fileCount:Object.keys(buildFiles).length,sha256:createHash('sha256').update(JSON.stringify(Object.entries(buildFiles).sort())).digest('hex'),files:buildFiles},source,limits:'Source fingerprints do not make instrumentation and main APK bytes identical. Baseline and intermediate candidates are preserved separately.'};
writeFileSync(dir+'/final-artifact.json',JSON.stringify(manifest,null,2));
const notes=[
'P Actual baseline inspection performed; final capture phase mistake overwrote initial web shots. Preserved earlier closeout web captures are labelled; original native main APK captures remain.',
'V Independent published-reference matrix with dates and authenticated-live limitations.',
'V Original APK hash and 23 renditions / 93 original asset bytes match preservation baseline.',
'V Verified retained target, same system identifier and 12 migration checksums; prior member-row digests retained. New fictional test accounts added; sessions/progress excluded.',
'V Seven web sizes report zero centre error; native widget centre and actual full-frame captures inspected.',
'V Complete 1280×640 canvas and all four actions fit without a controls column.',
'V No newspaper masthead or permanent settings stack on Clips; Home/articles retained.',
'V Item rail and item-navigation controls separate from timeline; actual pointer/keyboard/native tests.',
'V Mixed journeys verify paused sheet return and controller/element continuity.',
'P Six source files sampled at opening/middle/end and kept contained. All-frame motion/readability acceptance is not established.',
'V Actual web and main Flutter route-specific shells captured.',
'P Tall/compact/landscape inspected; very small pictures remain on short and enlarged-text screens.',
'V Contained original portrait without source cropping; native centred picture remains nonzero in new landscape test.',
'V Web 56×48 targets and native action semantics/48px tests; enlarged labels yield to named icons.',
'V Fixed concise metadata and readable More/details sheet; long title uses ellipsis.',
'P Normal tall long caption repaired. Compact/enlarged/landscape use scrollable captions and transcript; universal all-cue readability remains owner review.',
'P Actual native enlarged text/landscape inspected and hit-test repair tested. Tiny original text and complete theme/screen-reader coverage remain limited.',
'V Actual picture-tap pause and subsequent playback; no permanent central icon while playing.',
'P Native real vertical gesture and 20 item transitions pass; exhaustive rapid reversal/cancellation matrix is incomplete.',
'V Actual seek gestures and reviewer cancellation oracle pass; preview preserves prior intent.',
'P Paused sheet/story return and identity tests pass; exhaustive theme/background matrix not rerun.',
'P Explicit supported mute control retained; hardware loudness/listening not established.',
'P Browser rejected-play injection passes. Main capture hit transient media/caption load failure; actual Retry recovered same clip. Cause unresolved; full native network matrix not rerun.',
'P Three web Save/Unsave/readback/failure journeys and native owner/late-response tests pass. Native real-member result is listed separately in execution report.',
'P Web cancellation distinguished. Native chooser reports only opened with delivery unverified; selection versus cancellation not distinguished.',
'V Three web/native mixed journeys verify same eligible Clip and paused article Back restoration.',
'P Sixth-item end verified on web; full empty/expired rendition matrix not repeated.',
'V Four supported item actions, captions/speed/copy/transcript only; no social counters or invented downloads.',
'P Native actionable semantics and web named controls tested. TalkBack remains unrun.',
'V Named buttons, keyboard/slider and More previous/next provide alternatives to swipe.',
'P Browser modal/Escape and native source/More Back exercised; complete platform focus/assistive audit pending.',
'P Caption visibility retained; real screen-reader announcement cadence not tested.',
'P Reduced-motion web capture context and existing native unit checks; no new physical reduced-motion recording.',
'V Anonymous sources and exact original links; public detail SSR without JavaScript verified.',
'V Native and web ownership checks preserve Radio on entry and transfer on deliberate playback.',
'P Guest native and web programme-handoff checks pass; no subjective competing-soundtrack listening claim.',
'P Real main-app chooser/Back exercised; physical lifecycle and all background combinations remain pending.',
'P Web 20 item/20 route counts and native 20 item transitions pass; static native subtree still rebuilds on progress.',
'F Long-form controls retained; refreshed Newsroom regression fails its existing 320px overflow assertion.',
'V Existing direct Radio face pointer/touch/keyboard regressions pass; no cabinet redesign.',
'P Matched profile artifacts and timing limits recorded; diagnostic entries are distinct from main APK. No whole-product performance clearance.',
'V Prior 7ms callback, CPU4 popup and mixed native raster failures remain open.',
'V Failed attempts retained and concrete repairs documented; 30fps assets are not used as UI timing evidence.',
'P Root/web/native checks listed individually; Newsroom reflow failure and platform gaps remain visible.',
'P Three fresh core mixed runs and bounded final reviewers; this is not three repetitions of every acceptance row or a blanket full-platform review.',
'V Separately named main APK installed with -r, no clear/uninstall; actual main captures and installed hash supplied.',
'P Full viewport captures and uncut actual recordings supplied. Tool-policy limitation prevented normal-speed playback inspection/listening.',
'V Owner, physical Android, TalkBack, listening, Figma, iOS and production gates remain pending and separate.'
];
const checklist=readFileSync('docs/next-build/shortform-rebuild/03_ACCEPTANCE_CHECKLIST.md','utf8');
const cases=[...checklist.matchAll(/\*\*(SF\d+)\*\* ([^\r\n]+)/g)].map((m,i)=>({id:m[1],criterion:m[2],status:{V:'VERIFIED IN STATED SCOPE',P:'PARTIAL',F:'FAIL'}[notes[i][0]],evidence:notes[i].slice(2)}));
if(cases.length!==48||notes.length!==48)throw Error('Acceptance register must contain 48 rows');
writeFileSync(dir+'/acceptance.json',JSON.stringify({at:manifest.at,artifact:manifest.apk,cases,ownerApproval:'PENDING',production:'NOT AUTHORIZED'},null,2));
writeFileSync('docs/execution/SHORTFORM_ACCEPTANCE.md','# Short-form acceptance — actual scope\n\nNo blanket visual approval or release authorization. Partial rows remain partial even when component tests pass. See SHORTFORM_REBUILD.md for commands, logs and artifact identity.\n\n| Case | Status | Evidence / limitation |\n| --- | --- | --- |\n'+cases.map(c=>`| ${c.id} | ${c.status} | ${c.evidence} |`).join('\n')+'\n');
console.log({apk:manifest.apk,rows:cases.length});
