# Local integration delivery — 17 October 2026

This is a working partial delivery, not completion of the full Google acceptance gate or production approval. Current register:36PASS,31PARTIAL,5BLOCKED. The72-case register is `docs/engineering/real-news-google-profile/acceptance.json`. Existing performance failures, the historical media incident and the intermittent protected503 remain open.

## Running product

- Web: http://127.0.0.1:3000/ —13 actual publisher reports,8 Global Voices and5 NASA;12 feed items withheld by exact-item review.
- Profile: http://127.0.0.1:3000/profile ; Google/captured-mail entry: http://127.0.0.1:3000/sign-in . Mailbox: http://127.0.0.1:8025 (example.test only).
- Science/search: http://127.0.0.1:3000/?topic=science&q=Marshall . Filters the full eligible collection before pagination.
- Example original-report detail: http://127.0.0.1:3000/articles/publisher-29f45459-1969-4eca-a5f5-a1e890b45bca . Full selectable SSR text, author/publisher, licence, transformation disclosure and exact original link. No unrelated Watch/Listen action.
- Normal Android app installed on emulator-5554, package `test.example.aggregator.aggregator_mobile.localdemo`. Native Home, article attribution, code completion and Profile inspected. Google uses an official Credential Manager adapter, not website handoff. Actual app-button input reached Google Play services native MinuteMaidActivity; no account selection or provider screen capture by the agent. Its real provider success is still unverified.
- APK: `output/real-news-google-profile-20261017/main/aggregator-real-news-google-profile-r4.apk`.
- APK and pulled installed APK SHA256: `a60c15ecbab741e8c228f3093c03595ff9440a6d8e54605bacc251babb2efa31`. Normal `lib/main.dart`, localDemo debug; not instrumentation, profile or release build. Original493da1/48806f artifacts preserved.
- Signing certificate SHA1 `65:4C:4B:3B:38:E5:A5:91:63:D1:16:18:4E:18:A0:91:53:EC:03:9B`; certificate SHA256 `0C:28:A7:D4:2E:A0:3E:97:BB:00:BF:1B:0B:92:E0:F3:99:91:B1:43:5D:03:E9:3E:C9:D5:60:93:02:2E:4E:FB`. Verified with apksigner on delivered r4, not confused with file hash.

## Implemented and checked

Retained PostgreSQL55441 advanced through0021 via private backup, actual populated restored clone, fresh install/reapply, rollback, role and eight-member-table checks. All prior checksums preserved. Retained startup verifies its exact ledger and skips seeding/mutation. No owner/member deletion tests ran on retained data; disposable members only.

Google public clients were created in the already-open Aggregator Console project. Official server token verification, per-attempt nonce/transport binding, provider+subject identity, session exchange and cancellation are implemented. Provider network verification is outside member database transactions. Isolated tests establish same-subject continuity, no email-only merge, no staff/MFA elevation, simultaneous first-registration serialization, deleted-subject denial and rejected-final-recheck rollback. These are not live Google account proof.

Web/native Profile reuse member preferences, interests, bookmarks and history. Display names synchronize; the real web UI retained `Unsaved conflict draft` after a409 from a concurrent revision change. Native captured-code completion reached Profile in the installed normal app. Session survived r4 in-place installation and API/supervisor restart. Code expiry, resend rotation, binding, failed-attempt quotas and deletion privacy checks use isolated SQL; actual captured mailbox HTTP exchange is separately checked.

Three connected actual-service runs passed after the owned restart, then three again after0021: captured-code native session, captured-link web session for the same fictional member, CSRF denial, display-name synchronization/stale409, shared dark preference, Science following edition5, typed source save visible cross-client, safe bounded export and logout denial. No Google token was substituted by these local tests.

Actual HTTPS intakes persisted13 eligible immutable reports. Exact URL/raw hash/displayed-body digest/title/author/date/endpoint policy is checked again by the SQL public projection. Changed unreviewed known items receive a denied observation without storing the replacement body. Isolated tests cover A→denied B→A, concurrent imports, forged-body rejection, exact permission removal and full-grant revocation. Conditional cache support and source quotas are separate from this SQL evidence.

The existing owned worker now reads `.cache/live-source-poll.json`; enabled polling requires an interval900–86400seconds. Its first supervised run honored existing backoff. No OS task, public fetch endpoint, new supervisor or arbitrary source URL was added. New/changed items outside the reviewed policy remain withheld. Raw reviewed policy expires after seven days; no automatic rights renewal.

Final actual conditional batch `intake-1792198033667.json`: NASA returned304 and reused five durable reviewed versions; Global Voices failed with `SOURCE_NETWORK_FAILURE`.13permitted reports remained available without fiction substitution. No quota bypass or immediate retry. `live-observations.json` records actual persisted200/304 statuses. Full owned restart against the final21-migration ledger and subsequent SSR checks passed.

CI static validation passed; no hosted run. Final root tests47/47; Flutter59/59; typecheck, lint, Flutter analyzer and normal web/APK builds passed. Secret canary/redaction, worktree and available history scan passed after exact historical fingerprint false positives were documented; no global suppression. License review covered878 locked records. Dependency audit still reports11 high findings,0critical. No forced framework downgrade, release readiness or hosted CI pass claimed.

## Evidence and limitations

Evidence root: `output/real-news-google-profile-20261017/`. Actual full-viewport captures: `web-home-final.png`, `native-home-final-r4.png`, `native-profile-final-r4.png`, `native-article-final-r4.png`. Native r4 Profile/article captures were inspected. The web Home capture predates the final header label change to Profile. Final Profile/current article were DOM-inspected;320px Profile had no horizontal overflow. A browser screenshot request stalled and another returned an unrelated active tab despite the supplied tab ID; neither counts as product evidence. No new uncut media recording or normal-speed listening acceptance is claimed.

Sanitized reports: `docs/engineering/real-news-google-profile/{connected-http,reader-http,identity-db,native-code-db,live-db,final-artifact}.json`. Preservation: `output/real-news-google-profile-20261017/preservation-after-r5.json` confirms all23renditions/93files and all baseline member rows. Final artifact manifest has source/build fingerprints. Independent source reviews R1–R5 are under `docs/execution/REAL_NEWS_GOOGLE_SECURITY_REVIEW*.md`; latest narrow review found no new blocking defect in its reviewed repair scope, not blanket approval.

Remaining product/review gates:

- Owner-assisted actual web/native Google authentication, cancel/retry/account switch and cross-client continuity. Branding contact fields only if the provider requires them; basic identity scopes do not require a Testing allowlist entry. Official native selector implementation is not a provider success result.
- Deliberate connected-method link/unlink UI/fresh-proof journey remains incomplete. Local captured-mail ownership cannot establish real Google ownership. No last-working-method removal action is offered.
- Export is bounded to100records per collection and refuses larger exports (also refuses session cap boundary). Full pagination is not implemented. Profile shows at most100active sessions. Private backup cleanup policy remains an operator follow-up; deletion does not erase existing backups immediately.
- Full provider socket/redirect/rate-limit fault matrix, concurrent deletion/old-web-redemption lock-order matrix and uncertain-COMMIT transport injection are incomplete. Existing protected503 is unexplained; a later successful retry is not its resolution.
- The latest Global Voices conditional fetch failed; its exact transport cause is not established. Its prior permitted reporting remains visible under unchanged expiry. NASA304 success is not a Global Voices conditional pass.
- Full Profile theme/large-text/accessibility/device matrix is incomplete. Physical device, TalkBack, subjective listening, owner visual acceptance, native Figma edits, Xcode/iOS and release/store gates are unverified.
- No same-development qualifying three-item/two-origin synthesis set and no reviewed synthesis-purpose grant were found. Private engine drafts remain private. No unrelated reports were combined to manufacture a draft or audiovisual programme.

## Verified commands

From `E:\Hale\Coding\Personal\aggregator`:

```powershell
./scripts/npm.ps1 test
./scripts/npm.ps1 run typecheck
./scripts/npm.ps1 run lint
./scripts/npm.ps1 run build
./scripts/npm.ps1 run check:licenses
./scripts/npm.ps1 run check:secrets
./scripts/npm.ps1 run demo:restart-api
./scripts/npm.ps1 run demo:restart-web
```

The demo is already running. Only when stopped: `./scripts/npm.ps1 run demo:start`. Owned shutdown: `./scripts/npm.ps1 run demo:stop`. Never start a duplicate. A full owned stop/start was verified without resetting retained data.

```powershell
.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-reader-connected.mjs
.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-live-reader.mjs
.cache/runtime/node-v22.22.3-win-x64/node.exe --import tsx scripts/test-google-identity-db.mjs
.cache/runtime/node-v22.22.3-win-x64/node.exe --import tsx scripts/test-native-code-db.mjs
.cache/runtime/node-v22.22.3-win-x64/node.exe --import tsx scripts/test-live-source-db.mjs
.cache/runtime/node-v22.22.3-win-x64/node.exe --import tsx scripts/live-news.mjs import
```

Do not rerun applied upgrade scripts: they require exact prior-ledger state and fresh backup/clone attestation. Import respects quotas and the current exact-item policy; it does not grant permissions to newly discovered items.

From `apps/mobile`:

```powershell
. ../../scripts/flutter-env.ps1
C:/flutter/bin/flutter.bat analyze
C:/flutter/bin/flutter.bat test --reporter expanded
C:/flutter/bin/flutter.bat build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub
```

Scoped emulator forwarding: `C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 reverse tcp:3000 tcp:3000` and the same for4000. Install in place from repository root:

```powershell
C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 install -r output/real-news-google-profile-20261017/main/aggregator-real-news-google-profile-r4.apk
```

## Owner continuation

Keep the existing Console project Aggregator / `resonant-prism-511822-m0` in Testing. Perform real Google sign-in on web and the Android app, including any provider login/MFA/consent yourself. Complete truthful Branding contacts only if the provider requires them; do not add test users merely for basic identity scopes. Do not send passwords, codes or tokens in chat. No owner account will be deleted/disconnected for tests. Staff/MFA, public deployment, external email and real-media generation remain paused/unauthorized.

Scope-specific correction: Google official app-state guidance (https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) exempts basic openid/email/profile from the Testing allowlist requirement. Zero listed test users is observed configuration, NOT proof that this identity-only flow is blocked. Do not require test-user creation or production publishing merely to test it. The actual remaining owner gate is interactive Google login/MFA/consent on the emulator and web; truthful Branding contacts only if Console/provider requires them. Earlier requests treating test users as a prerequisite were overly broad.

Independent saved-capture visual review: docs/execution/REAL_NEWS_GOOGLE_PROFILE_VISUAL_REVIEW.md. It identified raw timestamps, singular source grammar, dense opening controls, faint secondary text and Profile/Library context concerns. Web edition timestamps and singular grammar were repaired in final web build r8; native timestamp/style concerns remain open. No emulator interaction was performed during the owner-pending provider screen. The review is separate from owner acceptance.


Final r8 verification: web build completed, owned web restarted, served SSR Home/category-search/article checks passed, and lint passed after the timestamp/source-grammar repairs. Refreshed source digest `574d507f7053df3408a108d9e9127b5467f7ea4e875f9e909db0fb49310ecf4e`; served-build digest `37aa0cd7df66d217cc9549855ae2005b525abae8867458274c4873b12645aba5`. APK r4 unchanged. No interaction with the pending Google provider screen was performed in this final verification.
