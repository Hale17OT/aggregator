# Targeted defect closeout: independent source challenge

Read-only review against `output/targeted-closeout-20261016/baseline/mobile-lib`, 2026-10-16. Read the targeted runbook, current players/media/shortform/trace source and saved tests3 output. No product edit, build, device, browser or database action. The original recording's media/caption failure remains **unexplained**; independently repaired races must not be described as its proven cause.

## Actionable ownership finding

`MediaCoordinator._pendingVideo` is not cleared when an attempt is superseded, throws, or returns early. A video claim waiting on pause can be superseded by a newer Radio operation; detaching the old pending controller then increments the shared epoch and may cancel that newer Radio operation. Clear pending ownership with token/controller-aware cleanup or explicitly on supersession, without clearing a newer pending claim. Add a deterministic delayed-pause/superseded-Radio regression. Reported immediately to the integrator; no runtime reproduction claimed in this read-only pass.

## Diagnostics and unavailable-resource limitations

Load generation currently starts per widget, so the same item/rendition can emit repeated identical attempt 1 records on route reentry. A route/player-instance identity plus bounded retirement/lifecycle records would distinguish old/new attempts when reconstructing the navigation incident. Stage/outcome callsites are fixed labels; item/rendition strings are sanitized/truncated to 96 characters and no raw exception messages, URLs, headers, bodies or credentials are emitted. The event buffer is capped at 100 and debug printing is local-demo gated. This is a review of current callsites, not a general-purpose secret scrubber guarantee.

Permanent caption failures carry ApiFailure HTTP status and the UI suppresses blind Retry for 401/403/404/410. Video initialization errors arrive through the video platform and generally lack that typed status mapping; the generic video failure can still offer Retry. Do not claim permanent-denial classification for every media path without platform-level evidence.

## Improvements inspected

Load attempts bind programme ID, video rendition, media URL and caption URL together with widget generation and controller identity. Every successful await checks currentness before applying caption file, playback speed, resume position or readiness. Stale failure does not poison the current widget. Video and parsed nonempty captions both gate readiness; captions are not silently bypassed. DidUpdateWidget retires changed bindings and starts a new attempt. Failed current loads retire their controllers. Retry is explicit and generation-bound. Retired-controller guards block claims from a disposed route, subject to the pending-state issue above.

ClipSurface leaves the broad controller ValueListenableBuilder and uses value-selective subtrees for playing/volume, cue text and timeline. Listener removal/controller changes are handled by the selector widget. Save identity guards and actual controller use remain unchanged. This supports reduced rebuild scope at source level; measured profile improvement and actual lifecycle acceptance are separate.

## Test evidence read

`.cache/targeted-tests3.log` reports **46 passes / 1 failure**, not a passing suite. The failure is `media_claim_test.dart` attempting VideoPlayer initialization without initializing the Flutter test binding; it is a harness setup error, not demonstrated product breakage. The same log records both caption/video completion orders, stale failure, pending-route departure, explicit Retry and permanent caption-denial tests among the passing cases. No tests were rerun by this reviewer. Historical red tests and the original actual incident should remain preserved.

## Repair reinspection

Read `_pendingVideoEpoch` and token/controller-bound finally cleanup. Retiring obsolete pending A no longer increments a newer Radio epoch, and retiring an old active video pointer no longer clears `owner == radio`. The new deterministic source test covers both Radio cases. Test binding setup is repaired. The later saved tests5 log reports **48 tests passed**; no independent rerun in this pass.

Global monotonic diagnostic attempt IDs now distinguish route reentries within a process; retire and lifecycle records use the captured attempt programme/rendition. Current stage/outcome payloads remain fixed categories rather than raw errors or URLs. This improves correlation without proving the original incident cause.

One adjacent source path remains: A is the active video, a newer B claim is pending while awaiting pause, then A detaches. The active-video branch still increments the shared epoch whenever owner is video, even if a distinct newer pending B owns that epoch. This invalidates B and can drop the explicitly requested successor playback. Reported promptly; add A-owned → pending B → detach A regression and distinguish retiring A's ownership from cancelling B's operation. No runtime reproduction claimed.

Caption HTTP work remains bounded and obsolete completions are rejected, but it is not yet actively aborted by controller retirement. Cancelling an owned request where supported can reduce wasted work; do not claim cancellation already exists or trade away mandatory caption readiness. Permanent video-status classification and original actual-incident attribution remain unresolved as previously noted.

## Owner-epoch and cancellation-hook reinspection

Read the subsequent `_videoOwnerEpoch` guard and new A-owned → pending B → detach A test. Active retirement now invalidates only the epoch that established that owner, preserving newer B's claim. The source addresses the reported adjacent edge; test execution of this newest revision was pending, so no new pass count is asserted.

`CaptionCancellation` now remembers cancellation before request attachment, invokes/clears the owned abort callback, and releases it after completion. Player retirement cancels its attempt token; stale readiness checks remain. However, inspected the **installed Dart SDK implementation** at `C:/flutter/bin/cache/dart-sdk/lib/_http/http_impl.dart:1702`: `HttpClientRequest.abort()` destroys the connection only while its response completer is incomplete. Once response headers have arrived, it does not cancel the streamed body. The current token callback remains request.abort while `readBody` consumes chunks, so a slow response body remains bounded/ignored rather than actively cancelled. Reported this concrete limitation; attach cancellation to the response StreamIterator (with a delayed-chunk regression) if full body cancellation is claimed. No heavy tool or tests ran in this reinspection.

## Response-body cancellation repair reviewed

Read current `readResponseBody`, `Api.captions`, ownership guards and tests. After response headers, cancellation now replaces the request-abort hook with `StreamIterator.cancel`; finally cancels the iterator and releases the callback. This addresses the previously reported request.abort-only gap. Cancel-before-attachment still invokes the newly attached hook immediately. Byte limits, total body deadline, exact asset-path validation and mandatory nonempty parsed captions remain enforced.

`caption_body_test.dart` uses a fake HttpClientResponse delegating to an actual StreamController/StreamSubscription. Its stalled-body test verifies onCancel fires and the read settles within one second; its complete-body test verifies content preservation and post-completion token cancellation. This is meaningful real stream-subscription behavior, **not a network socket/HTTP server cancellation test**. A cancelled read may return accumulated bytes; current player safety depends on the retained attempt/controller/binding checks rejecting retired attempts before caption attachment/readiness. No claim that cancellation is represented as a distinct public exception is made.

Re-read the `_videoOwnerEpoch` and `_pendingVideoEpoch` paths and the A→pending B test. The previously reported successor and Radio invalidation defects are addressed in source; the successor test actually preserves the epoch and checks B owns video after delayed completion. Saved `.cache/targeted-tests6.log` reports **52 tests passed**, and analyzer7 reports no issues. These logs were inspected, not rerun independently. No new blocking source defect was identified in this bounded follow-up. The original real incident remains unexplained, and video-platform permanent HTTP classification remains limited.

## Native integration wait/oracle review

Read current `integration_test/shortform_test.dart` and `targeted_test.dart` while the integrator runs them; no running file was edited and no test was launched by this reviewer. Actual playback waits now require `isPlaying` plus advancement from a freshly captured start position, avoiding a restored absolute timestamp falsely satisfying playback readiness. Article and More steps wait for actual route/sheet appearance and removal before proceeding. The short-form loop still performs 20 transitions with a distinct new controller; the targeted loop still performs 20 route exits across an asserted six-item catalogue, requiring actual advancement, nonempty current captions, one visible video and detached owner on exit. These changes strengthen readiness rather than lower the primary count/playback oracle.

Two residual coverage gaps were reported: (1) the 20-transition short-form loop proves a new controller but does not assert the expected next/previous programme ID or paused intent on every iteration, so same-item reload or accidental autoplay could satisfy that sub-check; (2) the delayed-old-failure scenario releases a gate, waits 500ms and checks any buffered `obsolete` event, rather than awaiting a completion marker tied to the captured old attempt. Existing obsolete events can satisfy that predicate without proving the specific released late failure completed. Prefer exact attempt/completion correlation. These are test-oracle limits, not demonstrated production failures or grounds to discard retained failed attempts. Article Back checks pause but not exact restored item/position in that step; earlier Sources position tolerance is a separate assertion.

## Failure5 catalogue investigation

Read `instrumentation/failure5-stages.txt`: attempt 22 (`clip-shuttle-evidence`) completed captions, initialization and readiness, then retired at 18:22:25; no attempt 23 appears before the six-clip-cycle timeout at 18:23:04. This is evidence that no next instrumented load began, not evidence of another decoder/caption failure. Catalogue fetch/route completion, empty/unavailable/error states and PageView construction remain possible upstream causes.

The production catalogue renders ProgrammeVideo only when the lazy builder index equals its separate `index` state. A mismatch between visible scroll position and index therefore yields an empty item and no load attempt. The controller is recreated on load, while PageView has no dataset/request key. Installed Flutter page_view.dart retains `_lastReportedPage` when a controller changes, and emits onPageChanged only on ScrollUpdateNotification; source therefore does not guarantee that every initial/restored position synchronizes the separate index. This is a concrete design risk, not yet a proven cause of failure5.

PageStorage restoration itself remains a hypothesis. No PageStorageKey was found in application lib. Installed page_storage.dart computes identifiers from ancestor PageStorageKeys and does not persist state when none exist. An actual ancestor key/storage identifier must be observed before claiming that PageStorage explains this run.

Recommended lightweight failure diagnostics: current router URI/requested ID, catalogue FutureBuilder state/error category, eligible item IDs/count, index, controller clients/page and lazy-builder index. These distinguish a fetch/route stall from visible-page divergence without logging credentials or source payloads. No source edit or diagnostic run was performed by this reviewer during the integrator's active rerun.

## Narrow fresh-read retry source review

The integrator reports the diagnostic reproduction identified catalogue `CONNECTION_CLOSED_BEFORE_HEADERS` with FailureView rather than PageView. This supersedes PageStorage as the working hypothesis for that reproduced run; original recording attribution remains separate. This pass reviewed current data.dart and read_retry_test.dart, not the still-being-preserved diagnostic log, and did not run tests or heavy tools.

`readWithFreshConnection` catches only the installed-runtime pre-header-close HttpException message, checks currentness, then executes one read on a new HttpClient. A second failure escapes; the new client closes forcibly in finally. Api.request enters this helper only for GET with no body. Mutations stay on the single-attempt path. Retried protected GETs retain the original captured credential and generation and reject changed identity after opening and after body consumption; they do not adopt a newer account's bearer. Caption reads use exact asset-path validation and their own cancellation/currentness predicate. Permission denials and unrelated failures are not transformed into retries, and redirects remain disabled.

The test source uses an actual loopback HttpServer that destroys the first socket without response headers, then serves the second request. It asserts two requests and distinct clients. Additional helper tests assert one-retry cap, no retry when currentness is false, and no retry for 403/unrelated HttpException. These are meaningful tests, but this review did not execute them and no new pass is claimed. They test the helper; the no-write-retry Api.request callsite boundary and caption token changes between attempts are source-inspected, not separately proven by these tests.

No new blocking authentication issue was identified in the narrow retry. Caption perform checks epoch at entry but not again after getUrl/body; it carries no bearer and current player binding/retirement remains the protection against applying obsolete work. Do not overstate this as full general HTTP identity cancellation. The bounded retries and client cleanup do not prove the cause of the original pre-instrumentation recording failure.

## Fresh single-attempt writes and last-failure diagnostics

Read the subsequent `withFreshConnection` helper and Api.request write callsite. Non-read operations execute exactly once on a new client, and finally force-closes that client after completed response handling or failure. No automatic uncertain-write retry was added. The captured credential/generation and post-open/post-body checks remain. The helper test throws the exact pre-header exception and asserts one invocation; it is not a full API write/socket integration test. Saved tests8 log reports **57 passes**, inspected without rerun.

Read the preserved member-start diagnostic line: status 0 with fixed `CONNECTION_CLOSED_BEFORE_HEADERS` category. The new lastFailure field retains one object, but two limitations were reported. First, HTTP response error.code is still raw server-provided text with no length/character bound before being stored and printed by the integration timeout; the locally generated transport categories are safe, but the comment's general bounded-code claim is broader than the implementation. Sanitize/truncate diagnostics separately or use a known-code allowlist. Second, lastFailure is neither cleared nor request-correlated, so a later timeout can display an older unrelated failure. A request sequence/current operation marker provides stronger attribution than this field alone. No credential or payload was printed by this reviewer, and no new blocking write-authentication issue was found in the scoped transport change.

## Independent classification of eight secret-scan findings

Read the redacted report and classification metadata without printing matched values. Independently parsed each of the eight referenced JSON lines, verified its property names the claimed source/build file, verified the value is 64 lowercase hexadecimal characters, recomputed the referenced file's SHA256, and compared equality. All eight independently match current file hashes. Each maps uniquely to a `generic-api-key` entry at the same file/line in the redacted scan report. There are four unique referenced files, duplicated in the current prior-artifact record and preserved baseline copy.

Results without matched values are saved to `output/targeted-closeout-20261016/security-findings-independent-review.json`. This confirms a bounded classification of these specific findings as file fingerprints; it is not proof that no other secret exists. The raw scanner gate remains **FAIL: 8 findings**. No exception, gate weakening, report deletion, baseline mutation or scan rerun was performed. Classification does not turn the unchanged scanner's failure into a passing scan.

## Correlated bounded diagnostic follow-up

Re-read the repaired current data.dart declarations and request catch paths, plus the member integration timeout formatter. `rememberFailure` retains one status/code record; codes must match 1–64 uppercase ASCII letters, digits or underscores, otherwise the stored diagnostic becomes `UNCLASSIFIED_FAILURE`. The request callsite supplies only three literal operation categories (native sign-in start, read, write), with a monotonically increasing attempt number allocated before the first request await. The stored record contains no URL, request body, response payload or credential field. This is a character/length restriction, not a semantic allowlist of recognized server codes or exhaustive proof that arbitrary upstream strings cannot encode sensitive information.

The integration timeout now includes failed attempt and current request sequence, making older failures distinguishable. The record still describes the most recently completed recorded failure, not necessarily the operation whose wait timed out; successful requests do not clear it, concurrent failures can complete out of order, and timeout/format errors are not recorded by these catch branches. Interpret the markers with the awaited operation and actual trace rather than attributing every timeout to lastFailure. Earlier uncorrelated native-start output is not retroactively made definitive by this change.

The initially incomplete declaration replacement was observed before repair; the current source includes the missing declarations and helper. The integrator reports that failed compile attempt is preserved. This reviewer did not execute analyzer, tests, browser or device commands while integration runs. No new blocking authentication or transport defect was found in this bounded diagnostic-only source review; no claim is made here about the later PostgreSQL lock-timeout attribution or completion of the active member run.

## Frozen-source and saved member evidence sweep

Read the current TARGETED_CLOSEOUT.md ledger, current data.dart request/cancellation paths, ProgrammeVideo binding/load/retirement paths and MediaCoordinator pending/active ownership paths. Their implemented boundaries remain consistent with the ledger: initialized video plus nonempty captions before readiness, obsolete-controller/binding rejection, epoch-scoped retirement, captured account credentials, single precise read retry and single-attempt fresh writes. No new blocking defect was identified in this bounded follow-up. This is not exhaustive source certification.

The current targeted integration source now ties the obsolete caption outcome to the exact old attempt, and its twenty route cycles select an expected item, require actual playing plus a fresh 300ms advance, current captions, one video and detached ownership after route removal. This addresses the previously recorded generic-obsolete-event oracle gap. Re-read the relevant retry/body/ownership test cases and inspected saved tests10 tail (57 passed) and analyzer12 (no issues). No tests were independently executed in this sweep.

Independently parsed member-20261016-192530 raw XML: one test, zero failures, zero errors. Its browser-1.json reports passed real captured-mail approval, Android callback, cross-client exact team scope/Save persistence and preference conflict/reload checks, with no transport warnings. artifact-1.json explicitly identifies the member_handoff_test.dart debug instrumentation entrypoint, emulator-5554, exit zero and SHA256 `0DA179988A5789E5290BD16B11BEBE0A5BBA122FFD2A934167DEA7A1FD3325BE`. This is saved evidence inspection, not an independently rerun journey or inspection of that APK payload. It is desktop-browser-assisted emulator authentication, not physical-device or same-device-browser proof.

The preserved prior member-20261016-191846 XML still reports one test and one failure. The ledger records the protected follow-up 503 and PostgreSQL user-row lock timeout; this sweep did not independently inspect the PostgreSQL log, so that causal detail remains ledger attribution. The later pass does not erase the failure or resolve intermittent lock contention. Earlier media triples predate the fresh-write/diagnostic changes and are not three repetitions on a future final main APK.

Exact reviewed source SHA256 fingerprints:

- data.dart: `2ACF74ACD274FDEF6B65A6D08AF386BD980328E66720B509A6F5E412DCAA076E`
- players.dart: `7520E03464777CF1A84BF3CA8B7FF91625AC7917273B5A2C0F96FA4EE2F5CEBA`
- media.dart: `7C168A8B6BBA64A51A582AC412ADDB533452E418D7260EEF98E2DDBF716B61AF`

No builds, services, profiling, browser/device actions, normal-speed watching or listening were performed. Final main APK payload/installed-identity inspection is not claimed before that artifact exists. Original unexplained recording incident, raw secret-scan failure, performance gates and owner/device acceptance remain separate open limitations.
