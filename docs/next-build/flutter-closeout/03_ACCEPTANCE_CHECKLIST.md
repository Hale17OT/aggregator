# Acceptance checklist

88 criteria across 8 groups. Initial state: every criterion is NOT RUN. The JSON register is authoritative for result/evidence updates.

## Baseline and safety

- [ ] **BASE-01 — Source and build baseline**: Identify actual current source, web/API builds, tools, running owned services and data target; historical counts are not assumed.
- [ ] **BASE-02 — 23 media preservation**: All 23 current rendition IDs and bytes, posters, VTT and source maps match baseline at final closeout.
- [ ] **BASE-03 — Retained data preservation**: No reset/reseed/repointing; any necessary additive upgrade follows backup, clone, rollback and data-preservation checks.
- [ ] **BASE-04 — Private/staff boundary**: Private drafts remain inaccessible and native/captured-mail readers cannot obtain staff/MFA/publishing assurance.
- [ ] **BASE-05 — Tool capacity and isolation**: SDKs, caches and test profiles use scoped verified paths with enough capacity; no global/elevated or unrelated process mutations.
- [ ] **BASE-06 — No unauthorized external changes**: No paid providers, external email, real-news intake, remote assets, cloud upload, commit/push, production access or publication.
- [ ] **BASE-07 — Local network boundary**: Selected-device ADB forwarding works without exposing database/API publicly or altering unrelated mappings.
- [ ] **BASE-08 — Flavor separation**: Production configuration rejects demo HTTP hosts, insecure TLS, captured-mail assurance and test signing assumptions.

## Web-reader closeout

- [ ] **WEB-01 — Balanced actual text gutters**: Home text and paper insets are coherent across ordinary, filtered, paged, loading and empty layouts.
- [ ] **WEB-02 — One newspaper discovery shell**: Category and query filtering updates eligible articles before pagination while retaining publication layout and correct URLs/history.
- [ ] **WEB-03 — Recognizable media controls**: Newsroom/Clips/Radio use correct icon-led transport with real state, labels, captions, menus and errors.
- [ ] **WEB-04 — Centered first-class Clips**: Actual portrait picture is centered independently of action rail and fits available height; Clips is primary navigation.
- [ ] **WEB-05 — Hierarchical interest tiles**: Expansion does not select; selected tiles, descendants, scopes, mutes and draft/save/Skip behave correctly.
- [ ] **WEB-06 — Flexible paper enhancement**: Rightward next/reverse previous turn has fold/underside/shadow while links, reduced motion and readable HTML remain.
- [ ] **WEB-07 — Shared chevron and popup geometry**: Indicators, popup themes, focus and collision behavior remain coherent on actual screens.
- [ ] **WEB-08 — Anonymous trust content**: Articles, original citations and complete bibliography remain accessible anonymously and without JavaScript.
- [ ] **WEB-09 — Web lifecycle/performance preservation**: Existing desktop gates are retested with unchanged definitions; historical failures and CPU4 gaps remain explicit.

## Flutter platform and structure

- [ ] **APP-01 — Actual native application**: Main reader and account surfaces are Flutter widgets, not a WebView wrapper or copied mock catalogue.
- [ ] **APP-02 — Connected typed contract**: Dart DTOs match actual server IDs/revisions/envelopes/unavailable states and do not duplicate server policy.
- [ ] **APP-03 — Coherent architecture**: One router/state pattern, narrow controllers and shared repositories integrate complete native features.
- [ ] **APP-04 — Full primary navigation**: Home, Radio, Newsroom, Clips and Library work with native Back, restoration and account access.
- [ ] **APP-05 — Design-system fidelity**: Warm-paper/forest light/dark identity, masthead, editorial typography and custom controls match product intent.
- [ ] **APP-06 — Adaptive layout**: Small phones, tablets, rotation, keyboard, safe areas and enlarged text preserve readable content and reachable actions.
- [ ] **APP-07 — Bounded native motion**: Page-turn and hardware animations preserve semantics and reduced-motion mode without unbounded layers/tickers.
- [ ] **APP-08 — Dependency provenance**: Selected SDK/plugins/native transitive dependencies are locked, licensed and reviewed; no blanket framework upgrade.
- [ ] **APP-09 — Installable Android artifact**: A real local-demo APK installs/launches; build flavor/mode, signing type, SDK/ABI and hash are recorded.
- [ ] **APP-10 — No heavyweight payload bundling**: APK does not contain the full programme catalogue, speech models, private source exports or secrets.

## Native authentication and member security

- [ ] **AUTH-01 — Actual captured-mail login**: Native signup/sign-in uses real server confirmation and exchange; browser preview GET alone does not authenticate.
- [ ] **AUTH-02 — Proof-bound handoff**: Native handoff code is single-use, short-lived, and bound to S256 challenge, account, registered client and exact callback/state.
- [ ] **AUTH-03 — No bearer in redirect**: Callback carries no long-lived session or email token; no secrets appear in URL logs or exported traces.
- [ ] **AUTH-04 — Web protections unchanged**: Browser cookie/origin/CSRF protections remain intact; native client does not impersonate Origin or relax cookie routes.
- [ ] **AUTH-05 — Shared server authorization**: Native requests reuse real capability, session, ownership, account-version and revocation checks.
- [ ] **AUTH-06 — Secure device storage**: Native bearer lives only in reviewed platform-backed storage; failures never fall back to plaintext.
- [ ] **AUTH-07 — Native restart and expiry**: Session survives supported app/API restarts but retains original expiry/revocation rules; no silent renewal.
- [ ] **AUTH-08 — Correct logout semantics**: Local account caches clear; online revocation works; offline local signout is not falsely described as server revocation.
- [ ] **AUTH-09 — No cross-account pending work**: Delayed save/progress/logout or stale HTTP response cannot apply to a later signed-in user.
- [ ] **AUTH-10 — Callback lifecycle safety**: Cold/warm/resumed links, browser cancellation and repeated intents route safely without duplicate sign-in.
- [ ] **AUTH-11 — No native impersonation escape**: No test login endpoint, account picker granting identity, embedded client secret or application-supplied role authority.
- [ ] **AUTH-12 — Signup onboarding parity**: Only a newly established account receives the first-use flow; existing/skipped/completed state is respected across clients.
- [ ] **AUTH-13 — Safe external links**: Source/deep/shared links are validated, canonical and credential-free; arbitrary redirects never receive auth headers.

## Native reader and interests

- [ ] **READ-01 — Full article rendering**: Structured native article includes heading/image/caption, selectable narrative, variants and safe unknown-block handling.
- [ ] **READ-02 — Complete native attribution**: All sources/citations retain exact original item and locator relationships; unavailable sources stay intelligible.
- [ ] **READ-03 — Native discovery parity**: Guest/following/category/query intersections use the same eligible API collection and stable page state.
- [ ] **READ-04 — Native taxonomy semantics**: Sports→Football→Premier League→Manchester City path works without confusing navigation, broad follow or competition scope.
- [ ] **READ-05 — Draft and conflict safety**: Preference/interest drafts survive errors and 409; Cancel never writes; no silent overwrite.
- [ ] **READ-06 — Cross-client owned data**: Same account changes sync on refetch; A and B remain isolated for all account operations.
- [ ] **READ-07 — Library exact behavior**: Bookmark uniqueness, original saved version/date, queue and unavailable tombstones match current contracts.
- [ ] **READ-08 — Opt-in history only**: No guest-history upload or progress after clearing consent/logout; exact revision prevents stale resume.
- [ ] **READ-09 — Safe offline experience**: No success is fabricated when disconnected; current-user draft survives without cross-user replay or hidden save queue.
- [ ] **READ-10 — Section-based format handoff**: Read/Listen/Watch/Clips maintain story/section identity without copying unrelated timestamps or defaulting to another story.

## Native audio/video and lifecycle

- [ ] **MEDIA-01 — Exclusive media owner**: Only Radio, Newsroom or Clips owns sound at once; stale async loads cannot steal playback.
- [ ] **MEDIA-02 — Direct native radio dials**: Actual face drag changes supported volume; story preview commits once; cancel/seam/stops/alternatives work.
- [ ] **MEDIA-03 — Persistent Radio navigation**: Radio handler and position survive native tab/route changes without remounting or duplicate streams.
- [ ] **MEDIA-04 — Native background service**: Configured platform service/notification/focus handles supported background and screen-off playback.
- [ ] **MEDIA-05 — Remote media controls**: Notification/headset/lock-screen commands act on the actual Radio handler and correct item.
- [ ] **MEDIA-06 — Interruption correctness**: Focus loss/headphone disconnect/ducking/user-pause interactions never resume unexpectedly.
- [ ] **MEDIA-07 — Sleep semantics**: Sleep timer/story-boundary stop uses authoritative timing and survives relevant view/lifecycle changes.
- [ ] **MEDIA-08 — Eligibility-preserving transport**: Native media, ranges/posters/captions/source maps retain current access rules and bounded validated destinations.
- [ ] **MEDIA-09 — No catalogue pre-download**: Video controller and audio/file prefetch are bounded; all 23 programmes are not fetched at startup.
- [ ] **MEDIA-10 — Newsroom real playback**: Solo/duo/treatment selection plays correct existing muxed video, with one clock and correct progress.
- [ ] **MEDIA-11 — Caption and source parity**: VTT/transcript/source seeking works with safe controls/large text/fullscreen; no missing attribution.
- [ ] **MEDIA-12 — Foreground video lifecycle**: Background, route exit, orientation and fullscreen preserve declared pause/resume and controller cleanup.
- [ ] **MEDIA-13 — Finite portrait Clips**: Six clips retain 30–120s bounds, centered image, safe captions, finite navigation and explicit play behavior.
- [ ] **MEDIA-14 — Long-form completion**: Representative full solo/duo and longest Radio edition play to end in the native app without unexplained interruption.
- [ ] **MEDIA-15 — Asset catalogue parity**: Each of 23 renditions can be resolved and initialized/seeked by the app, with unavailable-state rules respected.
- [ ] **MEDIA-16 — Twenty-journey stability**: Twenty mixed routes/background/format and twenty clip transitions have no abandoned controllers/handlers/tickers.
- [ ] **MEDIA-17 — Native media recovery**: Slow/failed/range-denied media and cancelled preparation recover without incorrect source, silent fake play or concurrent audio.

## Review and evidence quality

- [ ] **QA-01 — Traceable acceptance**: Each result maps to a requirement, actual source/build/environment and substantive artifact.
- [ ] **QA-02 — Actual reviewer passes**: Separate reviewers inspect builds where available; otherwise self-review is labeled accurately.
- [ ] **QA-03 — Defect reproduction retained**: Failures and unsuccessful candidates remain in ledger; a repair closes only after exact retest and adjacent regression.
- [ ] **QA-04 — Golden integrity**: Expected/actual/diff images are inspected; no automatic baseline acceptance hides a defect.
- [ ] **QA-05 — Negative canaries work**: Test harness detects isolated wrong-owner/auth-replay/missing-source/media-failure cases without mutating retained state.
- [ ] **QA-06 — Accessibility automation**: Guideline API, semantics, target/label/state, text scale and motion tests pass or are explicitly failed.
- [ ] **QA-07 — Profile-mode performance**: Defined native frame/input/lifecycle budgets measured with complete conditions and truthful non-device limitations.
- [ ] **QA-08 — No threshold laundering**: Web and native budgets remain distinct and frozen; debug/emulator/callback/30fps video measurements are not conflated.
- [ ] **QA-09 — Clean build reproducibility**: Fresh source snapshot yields the candidate app and passes format/analyze/unit/widget/contracts and applicable web tests.
- [ ] **QA-10 — Three critical repetitions**: Core auth/ownership/navigation/media journeys pass three fresh runs with all outcomes retained.
- [ ] **QA-11 — Two unchanged-build sweeps**: Two final review sweeps target the same frozen product build; later edits invalidate affected rows.
- [ ] **QA-12 — Artifact privacy scan**: APK/evidence/review package contain no credentials, login links, backups, signing keys or private draft exports.
- [ ] **QA-13 — Usable final review index**: Review opens with its referenced actual images/videos, command guide and parity/limitation summaries.
- [ ] **QA-14 — Honest current risk status**: Audits/notices/current performance failures and external gates remain visible with no blanket release claim.

## Owner and platform gates

- [ ] **HUMAN-01 — Owner visual/motion acceptance**: Owner actually reviews relevant final-build web/native output and provides acceptance or specific changes.
- [ ] **HUMAN-02 — Subjective listening review**: An identified actual listener reviews supplied audio/performance excerpts and records findings.
- [ ] **HUMAN-03 — Physical-device behavior**: Real authorized device demonstrates touch/volume/background/interruption behavior; emulator is not equivalent.
- [ ] **HUMAN-04 — Screen-reader experience**: Actual TalkBack/VoiceOver/desktop screen-reader journeys are reported separately from semantics automation.
- [ ] **HUMAN-05 — Native editable Figma**: Existing Figma contains editable reviewed components/screens/variables, with actual frame IDs.
- [ ] **HUMAN-06 — iOS native build**: Authorized macOS/Xcode actually builds/runs the iOS application; iOS source alone is not a pass.
- [ ] **HUMAN-07 — iOS physical playback**: An actual iPhone/iPad completes native media/auth/accessibility lifecycle checks separately.

