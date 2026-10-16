# Short-form candidate: independent review 1

2026-10-16, read-only source/artifact and raw-result review. No product edit, test rerun, build, browser or device operation. Source hashes are recorded in `docs/engineering/shortform-review1-source.json`. This is not blanket acceptance of visual quality, subjective listening or performance.

## Actual artifact

Independently hashed the new stable main APK before and after inspection: `output/shortform-rebuild/aggregator-shortform-local-demo.apk`, **964c451e13625a464b989359f3b96eb02c3e8736e0b9c50223efcb2bfb28af78**. Independently confirmed the original baseline APK still has SHA256 **48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0**.

Decoded actual binary manifest/network XML with aapt, saved `shortform-review1-manifest.txt` and `shortform-review1-network.txt`. Exact loopback cleartext exception remains; general cleartext is denied. Seven actual Guava/JUnit notice entries retain previously verified hashes. No MP4/WAV/WebM/MP3 ZIP entries were present in this bounded listing. This is not a fresh full credential scan or complete transitive license audit.

## Repair verification and raw results

Read repaired source: native Save captures identity/token/item/action before asynchronous pause and rejects stale context before mutation; outer rail semantics now carry tap actions; timeline bounds are 48px; scrub cancellation marks `seekCancelled` and prevents Slider's subsequent commit callback. The rollback oracle in reviewer-owned `shortform_review_test.dart` remains 10 seconds, not relaxed to accept the observed wrong seek.

Read `.cache/shortform-unit5.log`: **37 tests passed**, including the reviewer-owned semantics, delayed-owner Save, late response and pointer-cancellation cases. This corroborates the integrator's rerun; no independent rerun is claimed in this pass. Earlier 3-pass/1-fail logs remain historical evidence.

Parsed actual XML in `output/flutter-closeout/android/shortform-20261016-152951/results-{1,2,3}`: each run has one `Real shortform tap swipe scrub sources story and owner continuity` test, zero failures and zero errors. These instrumented results are not byte-identical main-entry APK evidence; final main-app checks remain separate.

Web Save now requires matching current article slug. Persist revision/conflict responses check captured owner/history epoch. Explicit clear suppresses subsequent local cache writes and consent; stale mounted history fetches are guarded. Native Share still says the sheet opened with delivery unverified; it does not claim a destination completed or cancelled delivery. Progress isolation remains explicitly pending rather than inferred from passing functional tests.

## New residual web finding reported immediately

On a first authenticated mount, `progressOwner` can be guest while current owner is a member. The owner-change branch calls `clearProgress()`, which sets `localResumeAllowed=false`; that flag has no reenabling path in the component. This conflates ordinary account initialization with explicit history clearing and can prevent newly viewed positions from being cached for article Back restoration. The post-await owner guards are useful, but normal owner initialization should reset state without applying the explicit-clear suppression. This is a concrete source finding; no browser reproduction was performed by this reviewer. Final web acceptance remains pending its disposition and relevant regression.

No new demonstrated account-authentication bypass was found in this bounded pass. Existing platform/owner/screen-reader, measured performance, dependency and release limitations remain separate. Review 1 is not a second unchanged-candidate sweep or authorization to publish.
