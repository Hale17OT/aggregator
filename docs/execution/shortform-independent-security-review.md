# Short-form correction: independent source challenge

2026-10-16. Read the corrective brief's interaction/lifecycle requirements and current `ClipFeed.vue`, `shortform.dart`, ClipSurface branch in `players.dart`, ReaderShell, native share channel and web member transport. This is a new source-only review of work in progress. No inherited acceptance, build/device/browser operation, or claim that the previous APK contains these changes.

## Findings reported to integrator

1. **Owner race in native Save:** `save()` awaits controller pause before capturing identity and operation epoch. If account identity changes during pause completion, the original gesture can become a write authenticated as the new account. Capture identity, item, desired action and token before the first await; reject changed context before issuing the write. Also guard asynchronous error/success announcements against that same identity.
2. **Native action semantics lose activation:** `action()` excludes the InkWell subtree from semantics while its outer Semantics supplies label/button but no onTap. Save/Sources/Share/More can therefore announce a button with no accessible activation. Supply semantics onTap/enabled or retain the interactive child's semantics, without duplicate announcements.
3. **Web Save can address previous article:** reactive article fetching may retain the previous article during a clip transition; `saveItem()` lacks the slug/current-clip equality check already used for FeedControls. Require an article matching the currently committed clip before enabling/sending Save, and capture that identity across asynchronous operations.
4. **Web history clear/stale consent:** `clearProgress()` resets positions/revisions but leaves historyConsent enabled. A following timeupdate/unmount persist can recreate cleared history. The mounted preferences/listening async chain also lacks identity/operation checks after each await and can apply stale owner consent or history. Use owner and clear-operation guards, suppress writes after explicit clearing, and require deliberate reenable consistent with existing member behavior. This is a concrete source path, not a newly executed cross-account exploit.
5. **Scrub interaction target undersized:** native timeline bounds are 28 logical pixels and web range bounds 24 CSS pixels. The brief requires independent 48/44 targets. Preserve visual thinness while enlarging hit/semantics bounds and test against paging cancellation.
6. **Missing Radio ownership indicator:** ReaderShell removes MiniRadio on Clips; ClipSurface currently has no compact indication/control when persistent Radio is still the audible owner. Preserve the no-surprise-takeover policy while exposing the requested compact owner state.
7. **Progress isolation incomplete:** the existing controller ValueListenableBuilder builds the entire ClipSurface on every video value update, including static metadata/action layout. Controller construction stays outside build, but the brief's fast-progress isolation requirement is not met. Measure and isolate the changing regions without recreating controller/state.

## Bounded positive observations and unverified areas

The native share bridge validates an exact public loopback clip URL, passes only that URL to ACTION_SEND and makes no delivery claim. It does not pass bearer/session tokens or project files. Flutter reports share-sheet opening, not completed delivery; unsupported-platform fallback copies the local public link. That distinction must remain in user-facing status.

Sources/More use modal surfaces and explicitly pause video. Read-story returns paused. The existing controller is passed into ClipSurface rather than replaced by a second decoder. Exact-source access remains unauthenticated. These are source observations, not proof of pixel layout, gesture arbitration, screen-reader operation, platform share cancellation or actual exclusive audio.

Pending review should challenge delayed pause plus logout/new login, old article fetch completing during swipes, clear-history while progress is pending, rapid seek/page reversal, scrub cancellation during backgrounding, focus restoration and screen-reader activation. No final pass is assigned; integrator repairs and actual regression evidence are required. No product file was edited by this reviewer.

## Reviewer-owned native regression tests

Added only `apps/mobile/test/shortform_review_test.dart`, using actual ClipSurface/VideoPlayerController with a controlled platform and API. The second run wraps ClipSurface in the same ValueListenableBuilder arrangement as production. Executed `flutter test test/shortform_review_test.dart --no-pub --reporter expanded` after sourcing project flutter-env; no dependency update, build, emulator or browser operation.

Both preserved runs (`shortform-review-tests-first.log`, `shortform-review-tests-second.log` under docs/engineering/flutter-closeout) returned **3 passing / 1 failing**:

- Actual semantics nodes expose tap actions and at least 48px rail bounds; timeline height is at least 48px: PASS.
- Actual Save gesture blocked in a delayed platform pause, then account A replaced by B before release, sends no bookmark mutation: PASS.
- Actual delayed bookmark response after logout produces no stale Saved announcement/state: PASS.
- Actual pointer scrub cancellation from 10 seconds fails rollback: final platform seek is **35.412 seconds**, expected 10. The realistic wrapper rerun confirms this is not caused by a missing controller listener in the first fixture. Likely Slider cancellation invokes onChangeEnd after the outer Listener rollback; cancellation must invalidate the commit callback. Oracle remains unchanged and failure was reported immediately.

Source reinspection confirms native identity capture/semantics/target repairs and web matching-slug plus history-load epoch guards. Remaining web persist code still updates local positions before checking consent and applies asynchronous revision/conflict responses without a captured history epoch/owner. A clear can therefore be followed by stale state repopulation. This residual source finding was reported; no browser reproduction is claimed. Progress isolation and real-device gesture/accessibility evidence remain pending.
