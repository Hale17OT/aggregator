import {readFileSync,writeFileSync} from 'node:fs';
const path='docs/engineering/real-news-google-profile/acceptance.json';
const register=JSON.parse(readFileSync(path));
const groups=[
 ['PASS','CFG-01 CFG-02 CFG-03 CFG-04 CFG-05 CFG-06','docs/execution/GOOGLE_CONFIGURATION.md; actual existing Console inspection and derived client/certificate configuration; iOS source only'],
 ['PASS','CFG-08 FINAL-02','preservation-after-r4.json; retained-upgrade-r7.json; original migration checksums, member row digests and23/93 media unchanged'],
 ['PASS','AUTH-04 AUTH-06 AUTH-09 AUTH-12','identity-db.json and google-identity.test.ts; isolated server/SQL checks, no live Google claim'],
 ['BLOCKED','AUTH-03 CLIENT-01 CLIENT-04','Owner contact/test-user setup and real account consent/sign-in pending; no provider success claimed'],
 ['PARTIAL','AUTH-01 AUTH-02 AUTH-05 AUTH-10 AUTH-11','Implemented verification/attempt/session contracts; unit and isolated SQL evidence. Live Google, comprehensive simultaneous registration and transport-fault tests not completed; old503 remains open'],
 ['PARTIAL','AUTH-07 AUTH-08','No email-only merge. Captured-mail identity cannot link real Google. Deliberate Google link SQL exists, but connected link/unlink UI and live fresh-proof journey remain incomplete; no last-method removal action exposed'],
 ['PASS','CLIENT-02 CLIENT-07','Existing preauth CSRF/exact Origin checks retained; no owner password/MFA/account-chooser recording'],
 ['PARTIAL','CLIENT-03 CLIENT-05 CLIENT-06','Official Credential Manager adapter installed; captured-code session survives in-place update and app restart. Google selector/cancel/account switch success not owner-verified'],
 ['BLOCKED','CLIENT-08','Official iOS9.0.0 SDK/config source exists; no macOS/Xcode/iPhone verification'],
 ['PASS','EMAIL-01 EMAIL-02 EMAIL-04','native-code-db.json, native-code-http.json, installed r3 app input sequence reached Profile; captured example.test only, no external delivery'],
 ['PASS','EMAIL-03','Separate concurrent SQL redemptions issue exactly one session; HMAC HTTP exchange/code non-disclosure checked. Ambiguous COMMIT transport fault matrix remains separate and incomplete'],
 ['PASS','PROFILE-01 PROFILE-02 PROFILE-11','Actual web/native Profile and reused contracts; local initials only, no remote avatar fetch/upload'],
 ['PARTIAL','PROFILE-03 PROFILE-04 PROFILE-05 PROFILE-06 PROFILE-07 PROFILE-08 PROFILE-09 PROFILE-10','connected-http.json three actual service passes; native/web display-name observation; isolated deletion/tombstone checks. Google fields/live cross-account races, large export pagination and full concurrent history clear not fully verified; session list capped100 and export refuses boundary'],
 ['PARTIAL','PROFILE-12','Full-viewport desktop Home/native Profile inspected; complete themes/large-text/keyboard/Profile error-state matrix not completed'],
 ['PASS','NEWS-01 NEWS-02 NEWS-03 NEWS-04 NEWS-05 NEWS-07 NEWS-12','REAL_NEWS_SOURCE_RIGHTS_REVIEW.md; actual HTTPS intake reports; exact reviewed text representation projection.13accepted/12held; no synthesis/media grant'],
 ['PARTIAL','NEWS-06 NEWS-08 NEWS-09 NEWS-10 NEWS-11','live-fetch.test.ts and live-db.json: destination classifier, bounded fetch/parser, concurrent idempotence, A→B→A denial/restoration, raw/body forgery and revocation. Full controlled socket/redirect/rate-limit fault matrix and publisher correction notices not completed'],
 ['BLOCKED','NEWS-13','No reviewed synthesis purpose grant or qualifying same-development three-item/two-origin set. Private pipeline remains private; unrelated reports not combined'],
 ['PASS','NEWS-14','Existing owned worker integration and explicit local config implemented; see final worker health for actual supervised execution'],
 ['PASS','READ-01 READ-03 READ-04 READ-06 READ-07','Actual native/web live13collection and source details; connected-http.json typed source save seen cross-client; sample media retained separately and no live Watch/Listen mapping'],
 ['PARTIAL','READ-02 READ-05 READ-08','Live SSR/category/search and shared Science preference checks; actual detail inspection. Complete browser pagination/history/offline/withdrawal journey matrix not completed'],
 ['PARTIAL','FINAL-01 FINAL-03 FINAL-05 FINAL-06 CFG-07','See current handoff: actual local checks separated from unverified Google/provider/device gates; secret scan passed after documented historical hash false-positive classification;11high dependency findings remain'],
 ['PASS','FINAL-04','New normal lib/main.dart localDemo r4 APK installed-r without data clearing; pulled installed APK matches A60C15ECBAB741E8C228F3093C03595FF9440A6D8E54605BACC251BABB2EFA31'],
];
for(const [status,ids,evidence] of groups)for(const id of ids.split(' ')){const c=register.cases.find(c=>c.id===id);if(!c)throw Error(id);c.status=status;c.evidence=[evidence];}
register.updatedAt=new Date().toISOString();register.scope='No blanket completion: implementation, local verification and owner acceptance remain separate.';
writeFileSync(path,JSON.stringify(register,null,2)+'\n');
console.log(register.cases.reduce((r,c)=>(r[c.status]=(r[c.status]||0)+1,r),{}));
