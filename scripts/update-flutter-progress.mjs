import {readFileSync,writeFileSync} from 'node:fs';
const file='docs/engineering/flutter-closeout/acceptance.json';
const report=JSON.parse(readFileSync(file));
function set(ids,status,evidence,limitations=[]){for(const id of ids.split(' ')){const row=report.criteria.find(r=>r.id===id);if(!row)throw Error(id);Object.assign(row,{status,evidence,limitations});}}
set('BASE-01','VERIFIED',['baseline.json','../../execution/FLUTTER_CLOSEOUT_PLAN.md']);
set('BASE-03','VERIFIED UPGRADE',['upgrade.json','retained-upgrade.json'],['Final retained-state comparison remains pending']);
set('AUTH-02 AUTH-04 AUTH-05 AUTH-11 BASE-04','VERIFIED ISOLATED SERVICES',['native-auth.json','native-auth-adversarial.json'],['Actual device/browser journey separate; no staff/MFA completion']);
set('AUTH-09','PARTIAL',['../../../apps/mobile/test/auth_lifecycle_test.dart','../../../apps/mobile/test/listening_sync_test.dart'],['Deterministic fake-platform/HTTP race tests plus isolated SQL concurrency; full device account switch pending']);
set('WEB-01 WEB-02 WEB-03 WEB-04 WEB-05 WEB-06 WEB-07 WEB-08','VERIFIED LOCAL',['../../execution/flutter-closeout-web-review.md','../../../output/playwright/flutter-closeout/web-final/'],['Owner visual/motion acceptance remains separate']);
set('WEB-09','FAILED',['../../../output/playwright/flutter-closeout/web-final/performance-gate.json'],['Unchanged 7ms p95 gate failed; CPU4 popup issue remains open; idle emulator present']);
set('APP-01 APP-03 APP-04 APP-05','IMPLEMENTED / PARTIAL INSPECTION',['../../../apps/mobile/lib/','../../../output/flutter-closeout/android/'],['Native connected critical journeys and final review still underway']);
set('APP-09','INSTALLED INTERMEDIATE',['../../../apps/mobile/build/app/outputs/flutter-apk/app-localdemo-debug.apk'],['Debug localDemo emulator install; final main-entry APK hash not frozen; test build can replace intermediate path']);
set('APP-08','PARTIAL',['native-dependencies.json','npm-audit.json'],['Dart Pub OSV query found no matches; native transitive audit pending; web npm reports 11 high findings']);
set('APP-07 MEDIA-02','PARTIAL',['../../../apps/mobile/test/native_motion_test.dart','../../execution/flutter-closeout-web-review.md'],['Nine isolated widget cases pass after three reproduced repairs; actual native motion/audio inspection pending']);
set('QA-06','PARTIAL',['../../../apps/mobile/test/native_accessibility_test.dart'],['Four synthetic layout/semantics cases passed after three overflow repairs; no TalkBack claim']);
set('AUTH-01 AUTH-10','BLOCKED DEVICE BROWSER',['../../execution/FLUTTER_CLOSEOUT_DEFECTS.md'],['Fresh emulator Chrome first-run terms require owner action; SDK licences separately accepted']);
set('HUMAN-01 HUMAN-02 HUMAN-03 HUMAN-04 HUMAN-05 HUMAN-06 HUMAN-07','NOT VERIFIED',[],['Separate owner/platform gate; Android emulator and source are not substitutes']);
report.at=new Date().toISOString();report.candidate='ACTIVE, not frozen or complete';
writeFileSync(file,JSON.stringify(report,null,2));
