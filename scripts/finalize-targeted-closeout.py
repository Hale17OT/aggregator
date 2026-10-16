from pathlib import Path
import json, re
root = Path(__file__).resolve().parents[1]
run = root / 'output/targeted-closeout-20261016'
sha = 'ed68ceb0f00cbddb5e33a8983aaac6d1141567b8e276dba1fe2e370be0eaa8e1'
status = root / 'docs/PROJECT_STATUS.md'
history = status.read_text(encoding='utf-8').split('# Project status — 16 October 2026', 1)[1]
summary = f'''# Canonical current summary — 16 October 2026 targeted defect closeout

The authorized bounded repair pass has reached delivery with explicit open defects. STOP here; staff/MFA remains paused. Older next-task paragraphs are historical. Read [repair ledger and verified commands](execution/TARGETED_CLOSEOUT.md), [48-case register](execution/SHORTFORM_ACCEPTANCE.md), [independent review](execution/targeted-independent-web-review.md) and [single owner/device packet](../output/review/shortform-rebuild.html).

Working owned routes: http://127.0.0.1:3000/clips and /newsroom (Home and Radio remain available). Final normal lib/main.dart localDemo debug APK: output/targeted-closeout-20261016/main/aggregator-targeted-local-demo-r2.apk, SHA256 {sha}. Installed in place on Aggregator_Local emulator-5554; pulled installed bytes match. Both original493da1 and48806fb artifacts remain unchanged. Instrumentation and profile binaries are separate artifacts.

Repaired: item/revision/attempt-bound native video/caption readiness, cancellation and ownership races; bounded fresh-connection retry for the separately reproduced pre-header read failure; Newsroom320px open-settings reflow; static Clips progress rebuild isolation; dark-surface Retry contrast. Original normal-main load incident remains OPEN and unexplained. A later protected account request hit a PostgreSQL account-row lock timeout; final assisted member journey passed, but intermittency is not declared resolved.

Verified: root41 tests/types/lint/build, native59 unit/widget tests and analyzer, three stronger targeted and three mixed native journeys, bounded guest/member and web regressions. These repetitions predate final minor diagnostic/error-color changes; not three repetitions of all48 cases or of the final APK. Final main recordings cover actual inputs and induced network failure/Retry; still-image inspection is separate from normal-speed watching/listening. The48-case register retains partial/unavailable gates.

Matched profile playback diagnostic: median UI p95 1.464→0.786ms; raster p95 3.236→3.658ms, an adverse +0.422ms. One focused candidate retained for UI benefit; no raster improvement claim. Six matched repeats had zero observed interruptions and met16.7ms only in this narrow diagnostic. Historical mixed-native raster, web7ms callback and CPU4 popup failures remain open.

Preservation audit: all23 renditions/93 original asset hashes,12 migration checksums, retained PG55441 identity and all pre-existing member-row digests preserved. Owned fictional test records are additive. No programme media bundled in APK. Source/served-build fingerprints and installed identity audited. Final capacity C80.12GiB/E197.64GiB free. No reset, migration, media regeneration, duplicate supervisor, upload, commit, push or deployment.

Raw secret scan remains FAIL with8 classified fingerprint-metadata findings; no suppression added. Prior dependency findings remain unresolved. Physical Android, TalkBack, same-device Chrome sign-in, subjective listening, normal-speed motion inspection, owner acceptance, native Figma and iOS remain pending. Actual Android launcher/splash assets inspected; iOS source assets are not an iOS build. Release unauthorized; private drafts stay private. Next action is owner/device review of this packet and explicitly open defects only, not an automatic new feature phase.

'''
status.write_text(summary + '# Project status — 16 October 2026' + history, encoding='utf-8')
ledger = root / 'docs/execution/TARGETED_CLOSEOUT.md'
text = ledger.read_text(encoding='utf-8').replace('In progress. This ledger', 'Delivered at the bounded checkpoint, with open defects and review gates below. This ledger', 1)
text = text.replace('Three matched baseline profile runs exist; candidate measurements pending. Original raster gate remains failed.', 'Three matched repeats per artifact completed: median UI p95 1.464→0.786ms, raster3.236→3.658ms. Candidate1 retained for UI benefit; raster worsened0.422ms. Original mixed raster gate remains failed.')
text += f'''

## Final delivery and unchanged-candidate review

Final normal `lib/main.dart` localDemo debug APK: `output/targeted-closeout-20261016/main/aggregator-targeted-local-demo-r2.apk`, SHA256 `{sha}`. In-place install and pulled installed APK match; no data clearing. Final preservation and artifact audits are `preservation/preservation-after-r2.json`, `final-fingerprints-r2.json` and `final-artifact-audit.json`. All23/93,12 migration checksums, prior member-row digests and493/488 APKs preserved. API catalogue IDs match; APK contains no programme media. Capacity at closeout: C80.12GiB/E197.64GiB free.

Final full-viewport native recordings: `evidence/native-after-r2/interaction-uncut.mp4`110.9294s and `evidence/native-retry-after-r2/interaction-uncut.mp4`59.984856s. Both have no audio track. Explicitly induced loss of owned4000 loopback forwarding produced a visible error; restoring forwarding and real Retry recovered the same item paused, then deliberate Play advanced it. Forwarding restored. This does not reproduce or explain the original493 incident.

Fresh desktop journey: `evidence/web-journey-after-r2/`41.84s uncut1280×720 WebM with actual Play, picture pause, next, drag seek, Sources/Back, article/Back, More and final paused state. Assertions and full-viewport PNGs are in that folder. The earlier4.24s recording is retained and is not labelled a full walkthrough. Recordings are not normal-speed watching or subjective listening; tool-policy limitation remains. Actual source modal still and prior full-frame states inspected.

Final review sweep1: parent read-only installed/source/build/catalogue/asset audit and test-log review. Sweep2: independent reviewer inspected r2 installed identity and actual failure/recovery/2× transcript stills, confirming the prior dark-on-dark Retry defect repaired; parent also inspected final desktop still. Source/security reviewer independently reviewed transport/member evidence. These are bounded reviews, not repeated complete device journeys or owner acceptance. See adjacent independent review files.

### Verified build, install and local launch commands

Run from repository root in PowerShell. Owned services are already running; do not start a duplicate supervisor.

```powershell
. ./scripts/flutter-env.ps1
Push-Location apps/mobile
flutter test
flutter analyze
flutter build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub
Pop-Location
./scripts/mobile-loopback.ps1 -Device emulator-5554
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 install -r output/targeted-closeout-20261016/main/aggregator-targeted-local-demo-r2.apk
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 shell am start -n test.example.aggregator.aggregator_mobile.localdemo/test.example.aggregator.aggregator_mobile.MainActivity
```

Root tests/typecheck/lint/build ran through `./scripts/npm.ps1`; `run demo:restart-web` replaced only the owned web after its build. Browser checks never ran while replacing the served build. `.cache/run-targeted-main-r2.ps1` records the actual build/copy/install/capture sequence. Named immutable browser runs use `node scripts/run-targeted-check.mjs check-shortform.mjs 1` (existing run1 now intentionally refuses overwrite). Final desktop recording command: `. ./scripts/stability-env.ps1; & $aggregatorNode scripts/capture-targeted-web-journey.mjs after-r2` (also refuses overwrite). Profile command uses `scripts/measure-targeted-native.ps1 -PlaybackWindow -Series playback-noidle`; diagnostic APKs and failed setup attempts remain distinct. No rendering command was run in this pass.

Stop at this checkpoint. Original unexplained incident, account lock-timeout intermittency, historical performance gates, raw classified scan findings and unavailable human/platform reviews remain open. No production release or owner acceptance is implied.
'''
ledger.write_text(text, encoding='utf-8')
matrix = root / 'docs/execution/SHORTFORM_ACCEPTANCE.md'
text = matrix.read_text(encoding='utf-8').replace('native57 units/widgets/analyzer', 'native59 units/widgets/analyzer')
text = text.replace('Matched profile artifacts and timing limits recorded;', 'Three matched profile repeats each: UI median p95 1.464→0.786ms; raster3.236→3.658ms (worse);')
text = text.replace('actual main captures and installed hash supplied.', f'final r2 actual main captures and installed SHA256 {sha} supplied.')
text = text.replace('Full viewport captures and uncut actual recordings supplied.', 'Full viewport captures and uncut actual recordings supplied: desktop41.84s; native110.93s and59.98s, silent.')
text = text.replace('Media repetitions predate only final fresh-write/diagnostic adjustments;', 'Media repetitions predate final fresh-write/diagnostic and error-foreground adjustments;')
matrix.write_text(text, encoding='utf-8')
rows = {m[0]: (m[1], m[2]) for m in re.findall(r'^\| (SF\d+) \| ([^|]+) \| ([^|]+) \|$', text, re.M)}
old = json.loads((root/'docs/engineering/shortform-rebuild/acceptance.json').read_text(encoding='utf-8'))
assert len(rows) == len(old['cases']) == 48
for case in old['cases']:
    case['status'], case['evidence'] = rows[case['id']]
old['artifact'] = {'path': str((run/'main/aggregator-targeted-local-demo-r2.apk').relative_to(root)), 'sha256': sha, 'entrypoint': 'lib/main.dart', 'flavor': 'localDemo debug'}
old['at'] = '2026-10-16 targeted closeout'
old['scope'] = 'Same48 criteria; current evidence and carried partial coverage distinguished. Not every case repeated on final APK.'
(run/'acceptance.json').write_text(json.dumps(old, indent=2), encoding='utf-8')
brand = root/'docs/design/BRAND_SYSTEM.md'
brand.write_text(brand.read_text(encoding='utf-8') + '\n\nTargeted closeout: actual Android launcher and splash inspected in evidence/brand-installed. Captures are from first targeted candidate; unchanged asset sources fingerprinted in r2. ready.png is a splash capture, not a ready reader. iOS build and owner acceptance remain pending.\n', encoding='utf-8')
print('Canonical summary, ledger and48-case register updated')
