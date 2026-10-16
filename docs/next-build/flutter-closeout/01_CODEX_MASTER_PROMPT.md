# The Aggregator — web closeout, Flutter reader, and evidence-driven review

Prepared 16 October 2026. This is an execution instruction, not evidence of completed development, owner approval, or release readiness. Use `02_REVIEW_PROTOCOL.md`, `03_ACCEPTANCE_REGISTER.json`, and `04_OWNER_DEVICE_REVIEW.md` alongside it. Research links are in `05_RESEARCH_AND_DECISIONS.md`.

## Assignment and outcome

Continue the existing Aggregator repository. Close the implementable reader-experience issues, create a real Flutter mobile application connected to the existing backend, and run the review/repair process through the entire authorized scope in one active execution. Do not return only another plan, a scaffold, static screens, a WebView wrapper, or a mocked mobile demonstration.

The latest owner statement is authoritative: all **23 programme renditions remain unchanged**; owner visual/motion acceptance, native Figma work, physical-device checks, screen-reader checks, and subjective listening still require evidence. Staff/MFA remains PAUSED. Do not convert that statement into approval of unfinished work.

Default delivery is **Android-first Flutter**, with shared Dart implementation and an iOS project/configuration. Build and test Android in the existing Windows environment. Build/test iOS only if an actual authorized macOS/Xcode environment is available. Otherwise deliver the iOS source/configuration and a precise pending gate, not a claimed iOS binary or device pass. Native widgets must render the product; an external browser is appropriate for sign-in and original-source links, not for the whole reader.

Success means a usable connected local Android reader, a preserved and reviewed web reader, all 23 original media assets intact, verified account/data interactions, actual on-device/emulator journeys, and a review package that makes remaining human/platform decisions easy. This does not mean launching a live-news business, completing the paused editorial/staff system, or certifying work that could not be tested.

## 1. Authority, current-state discovery, and invariants

Inspect AGENTS.md, the latest canonical project status, original specifications, reader-experience refinement handoff, API contracts, current migrations, media manifests, theme tokens, and existing tests. Locate files; do not assume the last chat report is newer than repository evidence. Historical next-task paragraphs must not restart completed phases.

Record the actual source fingerprint, tool versions, running owned processes, database identity and migration checksums, current catalogue, 23 rendition IDs/content hashes/ancillary hashes, unresolved defects, and current review statuses. Earlier reports describe 24 articles and migrations 0001–0011; verify rather than blindly hardcode those counts. If the actual 23-item catalogue differs from the expected report, explain the discrepancy before editing media metadata.

Create or update a concise execution plan at `docs/execution/FLUTTER_CLOSEOUT_PLAN.md`, a web/mobile parity matrix, architecture decisions, and the machine-readable acceptance register. Preserve F/SC/FL/WP identifiers and add local closeout/mobile identifiers rather than renumbering the specification.

Preserve these invariants:

- Existing Nuxt/Vue reader, Express/TypeScript API, PostgreSQL ownership/session rules, and private source-to-draft boundary stay authoritative. Do not replace them with Firebase, Supabase, a second backend, or a Flutter web rewrite.
- All 23 recordings, videos, posters, caption tracks, and source maps stay immutable. Do not regenerate, transcode, recompress, overwrite, or bundle the whole catalogue into the APK. Fetch eligible assets through existing protected delivery.
- Private drafts do not become public articles. No live-news intake, real-source permissions, editorial approvals, paid speech/model calls, staff login, MFA, or Publisher capabilities are introduced.
- Preserve the retained member database, accounts, saved stories, queues, progress, interests, and migration history. No reset, reseed, destructive cleanup, or repointing at an isolated test target.
- Preserve the accepted newspaper identity, tactile radio, general controls, existing knob interaction, media ownership, captions, citations, complete bibliography, corrections, and withdrawal behavior.
- Membership is ordinary accounts and owned data. Do not add prices, billing, tier fields, subscriptions, checkout, or “free membership” terminology.
- Do not claim native Figma completion, owner acceptance, subjective listening, physical testing, hosted CI, iOS testing, or production readiness without the actual corresponding evidence.

This prompt supersedes old one-increment STOP instructions only for the scope here. Proceed through unblocked milestones. Missing Figma, an unplugged phone, or unavailable macOS does not excuse leaving independent Android/application work unfinished.

## 2. Safe execution and platform preflight

The known workspace is `E:\Hale\Coding\Personal\aggregator`; confirm it. Use the existing supervisor and attested retained database. Check current disk capacity; old low-space reports are not current measurements. Estimate Flutter/Android/JDK/Gradle/emulator scratch requirements before downloading. Use scoped workspace cache/temp paths and installed compatible tools when possible. Do not run builds, video decoding campaigns, screen recording, and performance measurements simultaneously.

Discover Flutter/Dart, Java, Android SDK/ADB, emulator images, connected device IDs, available browser/native automation, Figma write capabilities, and optional Dart/Flutter tooling. Record `flutter doctor -v` and `flutter devices` results with sensitive identifiers redacted from shared reports. Do not infer that a local bridge or installed package can control a running app.

Official SDKs, matching packages, and one necessary emulator image may be downloaded after capacity/license checks. Pin the selected stable Flutter SDK and compatible Java/Gradle/Android/plugin versions; use a lockfile and provenance. Do not blindly upgrade the existing Node project or globally modify PATH, Java installations, browser installations, firewall, or trust stores. Do not auto-accept legal agreements requiring the owner, grant device debugging permission, or enable virtualization/elevation without the necessary user action. Record the exact blocking action and continue independent work.

Do not purchase cloud devices, remotely upload the repository, create cloud projects, publish builds, register store identities, generate production signing identities, commit, push, or deploy. A local test signing identity and installable local-demo APK are permitted; label them accordingly and keep private keys out of artifacts.

Use a distinct local-demo application identifier. Preserve an existing mobile identifier/project if one is already present. Never uninstall another app or wipe an owner's phone to get a clean test. Test data belongs to dedicated accounts and attested test targets.

## 3. Close the existing web-reader issues first, without a redesign

Reproduce the owner's requested refinements on the actual built reader. Reuse completed fixes and repair only remaining gaps. Record before/after evidence with matching routes, theme, data, and viewport.

**Home geometry:** inspect the real leftmost text inset and rightmost inset inside the paper, not only the outer container. Correct coherent breathing room, column alignment, masthead/rule/grid alignment, and all page/search/category/loading/empty variants. Verify 320, 390, 834, 1440 and relevant wide/short viewports without arbitrary whole-page translation.

**Unified discovery:** selecting a topic or submitting search keeps Home's publication shell, paper geometry, and editorial layout. Filter the complete eligible collection before pagination. Preserve category/query intersections, stable edition IDs, owner-bound personalization, URLs, Back/Forward, direct loads, cancellations, and truthful empty coverage. Never show an unrelated lead just to fill the newspaper.

**Media controls:** replace any remaining separate text Play/Pause rows with one correctly changing icon and familiar player groupings. Keep visible time, title, captions/settings, status, and source access. Labels for assistive technology are mandatory. Preserve native/no-JS fallbacks where supported. Correct fullscreen controls, popup layering, caption clearance, keyboard focus, touch behavior, actual play-rejection handling, and disabled/error states. Reuse the working elements; do not mount replacement soundtracks.

**Clips:** make it a first-class destination alongside Home, Radio and Newsroom. Center the actual portrait image area, not the asymmetric combined image/action rail. Fit width and available height, preserve 9:16 content without cropping important footage, keep safe captions and finite feed behavior, and retain paused Back restoration. Only one video owns audible playback.

**Interests:** show category/subcategory navigation plus selectable text tiles that change surface/color and have a check indicator. Opening Sports or Football is not following it. Preserve broad follows, explicit entity/competition scopes, mute rules, draft versus saved state, conflict recovery, Skip, and durable account behavior. Do not regress into repeated Follow buttons or render every taxonomy node unnecessarily.

**Paper turn:** where still weak, refine the current enhancement into a lifting edge, progressing fold, visible underside, changing shadow and settle. Next turns toward the right and Previous reverses. Masthead/navigation/media player stay fixed. Real links, readable HTML, keyboard access, reduced-motion fallback, interruption/error recovery and bounded temporary layers remain. Do not add a heavy book framework or unlimited snapshots to fix one transition.

Verify the current web performance gate with its original definitions. Record previous failures as historical failures; do not relabel them. Repair concrete regressions introduced by this run, but do not spend the entire run repeating the abandoned broad CPU4× optimization campaign.

## 4. Flutter application structure and dependencies

Use `apps/mobile/` unless an existing Flutter application is found. Generate Android and iOS platform projects without replacing unrelated files. No Windows desktop or Flutter-web app is required as a substitute deliverable.

Keep layers small and testable: typed API DTOs and validation, transport/session adapter, repository/service layer, feature controllers/view models, presentation widgets, shared theme, routing, and one media coordinator. Follow current Flutter architectural guidance. Select one explicit state-management approach; default to existing conventions or an appropriately reviewed Riverpod-based approach with narrow subscriptions. Do not install competing state frameworks or a generic enterprise architecture with unused layers.

Use the actual API schemas to derive/validate Dart contracts. Prefer a deterministic schema-to-client workflow if one already exists; otherwise map DTOs explicitly with contract tests against real API responses. Never ask Dart to import Zod or TypeScript directly. Keep IDs, revision fields, error envelopes, timestamp semantics, taxonomy relationships, and nullable/unavailable states exact. Do not duplicate ranking, source eligibility, account ownership, or evidence rules in the client.

Candidate runtime tools, only as needed and after current compatibility/license review:

- Router: Flutter-maintained `go_router`, with typed/validated route parameters and platform Back behavior.
- HTTP: one configured client with bounded timeouts, cancellation, restricted destinations and no blanket automatic write retries.
- Sensitive storage: a maintained platform-backed secure-storage package such as `flutter_secure_storage`; nonsecret display preferences can use ordinary app storage.
- Radio: `just_audio`, `audio_service`, and `audio_session` or a demonstrably equivalent maintained combination.
- Video: Flutter's `video_player`, preserving platform playback, captions/transcript integration and a common ownership coordinator.
- Existing SVG/assets: a reviewed Dart renderer where needed; reproduce behavior in Dart rather than importing Vue/React animation code.
- Test foundations: `flutter_test`, `integration_test`, semantic/accessibility checks, selected platform instrumentation and visual baselines.

Review platform-specific requirements before choosing package versions. For example, just_audio's optional header/cache proxy can introduce local HTTP requirements; do not respond by allowing all insecure traffic in production. Test the chosen protected-media strategy rather than assuming headers/cookies work identically across Dart HTTP and platform decoders.

Record licenses, notices, native transitive dependencies, SDK constraints, and any required permissions. Check current vulnerabilities rather than carrying old counts forward as fresh results. No gate suppression, incompatible downgrade, default production client secret, or unreviewed installation scripts.

## 5. Native information architecture and complete feature parity

Use a persistent primary navigation with **Home, Radio, Newsroom, Clips, Library**; account/preferences/interests can be reached from the shared account control and Library. Keep labels visible for discoverability. Adapt to a tablet navigation rail when useful. Search and subject navigation filter Home rather than becoming a different-looking product.

Required native surfaces and behavior:

1. **Home/edition:** centered masthead, balanced gutters, topic/query context, editorial lead and supporting stories, following/editorial modes, stable pagination, page-turn enhancement, refresh, loading/error/empty/end states. Portrait is not a squeezed desktop three-column layout; tablet can use a composed wider grid.
2. **Article:** publication name, title, impactful existing eligible image, caption/credit, readable body, standard/brief, inline evidence/citations, full bottom bibliography, original links, corrections/history, Save, and correct available Read/Listen/Watch/Clips transitions. Render structured blocks natively with selectable text; unsupported blocks get a safe state, not executable HTML or an invisible omission.
3. **Sources/evidence:** inspect claim-associated items and locators, jump to a numbered source and return to the calling paragraph, view source directory/methodology, and distinguish evidence from illustration. Opening an external original uses a normal browser and never forwards credentials.
4. **Radio:** full tactile radio and persistent mini-player; directly draggable volume/story dials, non-drag alternatives, queue, chapter metadata, rate, sleep, transcript, sources and resume. Story drag previews then commits once. Native player volume is an app-level gain unless the platform explicitly offers otherwise; do not pretend to control hardware loudness.
5. **Newsroom:** existing complete solo/duo and media-treatment variants, portrait/landscape fullscreen, native playback clock, captions, transcript/source seeking, revision-safe resume, retry/unavailable states and sensible rotation. Never play a second narration track under the muxed video.
6. **Clips:** native vertical paging/scroll, centered portrait picture, caption-safe overlays, bounded next-player preload, tap/keyboard/accessibility alternatives, Share/Save/Sources/Read, finite ending, correct interest filter, paused return and explicit audible-play policy. No invented Likes/Comments, no endless repetition of six clips.
7. **Sign-in/account:** actual captured-email confirmation journey and server session, account summary, expiry/logout states; no password or unimplemented social login. New-account interests appear only after successful account creation/verification at the existing assurance level.
8. **Interests/preferences:** same authored taxonomy/entity graph from the API, searchable hierarchical tiles, broad versus scoped choices, mutes, Skip, draft save/cancel, optimistic conflict recovery and honest sparse coverage. Sports → Football → Premier League → Manchester City men must retain its exact semantics; opening nodes never follows them.
9. **Library/member tools:** bookmarks, existing queue/reorder, opt-in progress/history, unavailable tombstones, existing filters, and persisted settings. Changing a native account value must be visible on the web after refetch and vice versa; no expectation of nonexistent real-time push.
10. **Global states:** offline/reconnecting, maintenance/backend unavailable, session expiry, invalid/deleted/withdrawn content, denied media, no results, and retry. Preserve input on recoverable errors. Do not show success for an unconfirmed mutation.

Use the same backend collection and all 23 rendition identities. Test fixtures may supply explicit edge states, but the runnable default app must connect to the actual local services. No independently hardcoded mobile news catalogue or pretend saved data.

## 6. Flutter visual and interaction quality

Translate the accepted design system, not its DOM. Reuse semantic palette, typography proportions, spacing, radii, outlined icons, selected surfaces, and motion durations. Light, dark, and system modes are separately coherent. Blackletter remains masthead-only; retain readable editorial and interface typography using already licensed assets/notices. No runtime font-download dependency or copied publisher branding.

Create real shared Flutter components for the masthead, editorial tiles, article blocks, citation markers, field/select/sheet/dialog controls, interest tiles, transport bar, progress/caption layers, and radio hardware. A generic Material scaffold with a forest seed color is not sufficient. Platform semantics, selection, focus, autofill and safe-area behavior take precedence over pixel imitation.

Use MediaQuery/layout constraints, safe areas, keyboard insets, orientation, device text scaling and RTL-safe directional padding. Do not cap OS text scaling to make screenshots look correct. Validate 320/360/390/430 logical-width layouts, tablet portrait/landscape, short landscape windows, and 1.0/1.3/2.0 text scale plus a largest-supported setting. Keep reading measure comfortable and controls clear of notches, system bars, home indicators and captions.

Use at least 48×48 logical-pixel interactive targets in shared mobile components where feasible, while respecting inline-link semantics. Expose roles, values, selected/expanded state, headings and adjustable-control actions through current Flutter semantics. A painted dial has increment/decrement actions and practical alternatives. Do not make selection dependent on color or a drag gesture alone.

Paper turning in Flutter is a presentation enhancement over a real edition state. Use bounded native painting/mesh/snapshot layers after a small performance experiment; the document remains native readable widgets at rest. Only old/new spread imagery may be temporarily rasterized during the turn. Do not snapshot active media, retain endless page textures, break source interactions or disable native Back edge gestures. Failure and reduced motion fall back to direct navigation without losing content. Do not create a WebView merely to reuse a JavaScript page-flip library.

Keep motion subtle on controls and expressive only where already intended. Avoid full-tree updates on every playback tick, repeated expensive blur, heavy offscreen layers, random gestures and animation controllers that keep running invisibly. Use isolated repaint/listening scopes based on measurements.

## 7. Local connectivity without exposing the workstation

The backend remains loopback-only. The app needs a documented working path to it; `localhost` on a device is not automatically the host computer.

Default Android local-demo transport: selected-device `adb reverse` forwarding to the existing reader/API entrypoints, with the existing web origin preserved where appropriate. Derive required ports from actual routing; forward only those needed, plus the captured mailbox for the test sign-in journey. Do not forward PostgreSQL, create a public tunnel, bind the server to 0.0.0.0, disable the firewall, or rewrite all catalogue URLs with an unsafe string replacement.

Create owned setup/teardown scripts recording the selected device and mappings. Do not run `adb reverse --remove-all` against unrelated mappings. Keep secrets out of command arguments and logs. If a different emulator host alias is needed, configure it explicitly and test routing, media URLs and browser callbacks rather than assuming browser secure-context behavior.

Use separate local-demo and production configuration. Local HTTP exceptions must be narrowly scoped to verified loopback/test destinations in the demo flavor. Production must reject these hosts, plaintext API endpoints, trust-all certificates, arbitrary base URLs and fake release identities. Do not silently leak local exceptions from a debug manifest into a release manifest. Flavor and build mode are separate: a profile build of localDemo is still not a production configuration.

Do not claim verified app/universal links without ownership and hosting of the required domain-association files. A scoped local callback scheme can exercise the demo, with production domain verification separately documented. Check every incoming route/scheme/host/parameter; do not navigate to arbitrary destinations received from a link.

## 8. Native sign-in: extend transport, do not weaken web authentication

Inspect the current captured-mail `auth_challenges` and session flow. Mobile cannot assume browser cookies appear in its HTTP client. Do not scrape a WebView cookie jar, hardcode a session, fake an Origin header to impersonate a browser, disable CSRF globally, or treat a user ID/role header as authentication.

Implement a narrowly scoped native-client bridge sharing the existing account/session validator and member services. Recommended default, subject to compatibility review:

1. The app creates a cryptographically random verifier and state with a platform/maintained crypto implementation. It sends an S256 code challenge, registered native client identity and exact allowlisted local callback to a bounded sign-in initiation operation.
2. Use the external system browser for the existing sign-in/explicit confirmation experience. Captured email remains the local proof path; it is not external mailbox verification. A preview GET never creates an authenticated native session.
3. On successful explicit confirmation, issue a short-lived, single-use authorization handoff code bound to the account, native client, challenge, callback and pending request. Do not put the email-token or long-lived bearer into the app callback.
4. The app validates state/callback, exchanges the handoff code plus verifier with the server, and receives a distinct opaque native session through the secure response. Consumption and issuance are atomic. Reject replay, expiry, mismatched challenge/client/redirect and cross-account substitution. Keep an abandoned flow harmless.
5. Store the native credential only in platform-backed secure storage. Bind server records to a native transport/client purpose; store verifiers, not raw bearer values. Reuse current expiry, account-version, role, revocation, assurance and ownership rules. No embedded client secret, custom password protocol, or claim of full OAuth/OIDC certification.
6. Native authenticated operations use an explicit restricted native transport/façade calling the same authorization/member services. Do not globally relax cookie-origin/CSRF checks on existing web routes. Reject mixed/ambiguous credentials. Browser cookies cannot become native bearers and native credentials cannot grant staff assurance.

Use established native-app/PKCE guidance; this bridge is a local extension to the existing sign-in system, not permission to introduce an identity provider. Document the exact threat model and have the security review pass challenge it before marking it verified. If an already implemented equally secure mechanism exists, reuse it and demonstrate equivalent invariants instead of adding a competing flow.

Use an explicit session inspection and logout/revocation path. No indefinite refresh token or automatic lifetime extension unless already securely supported by the product. On expiry, pause protected writes, keep safe unsaved drafts for the current user, and offer sign-in. Logging out clears local identity/user caches and stops account-bound operations; if offline revocation cannot reach the server, report local sign-out separately from server revocation. Never replay a queued logout or old write into a different account.

Sensitive storage should exclude credentials from backups, crash logs, analytics, screenshot routes and review exports. Do not require biometric authentication for background media unless that tradeoff is deliberately designed. Test native app process death/restart and secure-storage failure; do not silently use plaintext on failure.

Where small server/schema changes are necessary, use additive migrations and existing attested backup/clone/upgrade practices. Test populated upgrade and rollback before touching retained state. Preserve prior migration checksums and private pipeline/runtime privileges. No sweeping authentication rewrite or new public staff endpoints.

## 9. Media ownership, background Radio, and lifecycle

Create one application-level MediaCoordinator with authoritative playback ownership: none, Radio, Newsroom or Clips. It coordinates platform audio focus and the current handler/video. It must not mean one global permanent instance of every video. Keep a persistent Radio handler and bounded foreground video controllers; dispose obsolete controllers deterministically.

Starting an explicit foreground video pauses Radio and transfers focus. Starting Radio pauses/disposes competing video as appropriate. Merely opening a page or highlighting a selector does not start sound. A stale asynchronous load cannot steal ownership from a newer action. Restoring state after process death never starts audio unexpectedly. Cross-device media-control synchronization is not in scope; each running client enforces its own ownership and OS focus.

Radio must survive ordinary native route/tab navigation and supported background/lock-screen use via a configured platform media service, not a periodic UI timer. Implement current Android media playback foreground-service/notification/focus requirements and equivalent iOS audio-session/background settings. Declare only necessary capabilities. Do not request microphone, contacts, location, unrestricted storage, or phone-call permissions to play existing files.

Support actual notification/lock-screen/headset play/pause, seek/skip where meaningful, rate, queue and sleep behavior. Handle focus loss, interruption, headphones becoming disconnected, duck/pause decisions, and explicit user pause during an interruption. Never automatically resume after a newer pause, revoked asset, finished sleep timer or changed owner. Force-stop/OS termination is not promised uninterrupted playback; restore a safe paused state on next launch.

Narration/sleep/chapter decisions use the authoritative media position or an appropriate elapsed clock, not a view animation loop. Persist only permitted, opted-in progress, with exact rendition/version and concurrency rules. A waveform/meter can stop updating while hidden without stopping the media service.

For Newsroom and Clips, the platform video is the sole sound/time authority. Preserve muxed audio, captions, source-map seeking, rate, fullscreen and orientation. Pause foreground video when backgrounded unless a separately supported explicit mode is added; background video/PiP is not required here. Keep captions readable outside the picture on small screens when necessary. Do not crop evidence to fill a tall viewport or overlay controls over speech text.

All requests, including range requests and ancillary tracks, use current eligibility-controlled routes. A saved bookmark or cached media URL is not permission to bypass revoked content. Use safe native URL resolution and narrowly scoped headers; never send account credentials to an original publisher URL or arbitrary redirect. Bound memory/prefetch; do not download all 23 files on launch.

Review plugin header/caching implementations. If no credential is required for an anonymously eligible asset, do not add one. If credentials are needed, verify decoder behavior and redirect handling explicitly. Do not add long-lived signed media URLs as an eligibility bypass. Bytes already buffered cannot be recalled; on a received denial, renewal failure or revision invalidation, stop the affected playback and display the truthful state.

## 10. Member synchronization, offline states, and deep links

Reuse server-owned preferences, interests, follows/mutes, bookmark uniqueness, queues, history consent and exact revision fields. A mobile-specific view state is local; it must not become a second source of truth for taxonomy or permissions.

Test real two-client behavior: modify on mobile, refetch web, modify web, refetch mobile. Two simultaneous edits with the same expected version preserve the existing conflict behavior and user's unsaved draft. Do not solve 409s by automatically overwriting the server or retrying an unconditional patch.

Offline reading/downloads are not added as an unreviewed new feature. Keep small safe UI metadata/cache only where current permissions allow, with explicit stale state and bounded retention. Do not announce a server save while disconnected. Avoid a general offline mutation queue; retain the current user's unsent form draft and ask for retry/reconciliation when connected. Opt-in progress has bounded synchronization and must not regress a newer progress event or be submitted after logout/history clearing. Clear account-specific cached data on identity change.

Read/Listen/Watch/Clips handoffs use story and semantic section identity, never copy raw seconds between unrelated scripts. Unknown links, unavailable variants, stale rendition IDs and revoked stories get safe states. Share canonical story/clip links without private edition handles, credentials or user-specific query data. In the local demo, identify the link's local-host limitation rather than invent a public domain.

Preserve navigation stack and scroll/paused playback state through system Back, opening sources, rotation, safe-area changes, backgrounding and return. Deep links arriving while a dialog is open or a login is pending require deterministic routing and confirmation-state handling. Do not accidentally submit a sign-in link twice after activity recreation.

## 11. Review loop — mandatory for every coherent increment

Execute `02_REVIEW_PROTOCOL.md`; it is part of the implementation task. The loop is:

**Specify the acceptance case → reproduce/baseline → implement → automated checks → actual UI/media inspection → adversarial review → defect record → repair → regression → fresh validation.**

Use available separate reviewers/subagents with narrow read-only review ownership for functional/security, visual/accessibility, and performance/media. They must inspect actual files/builds/evidence and produce concrete findings. If separate agents are unavailable, perform separate documented passes yourself and label them self-review; do not invent an independent team. Only one integrator edits shared contracts, auth, supervisor and locks at a time.

No reviewer may close their own reported defect solely because code changed. Rerun its reproduction and relevant nearby journeys on the final fingerprint. Record failed attempts, patch cause, evidence and reviewer provenance. A changed assertion, golden, test timeout or measurement window requires justification and separate review; do not make it match the bug.

Critical existing requirements are hard gates: source privacy, no duplicate audio, data ownership, no unintended mutation, no missing bibliography/captions, safe sign-in, actual working controls, and unchanged media assets. A strong aesthetic score cannot compensate for failure of one of these.

Use fresh test accounts and attested test databases for destructive or race tests, not retained owner records. Keep backups, secrets, actual device identifiers and confirmation links outside distributable evidence. Do not build while tests run against the directory being replaced. Source changes after a validation snapshot invalidate affected evidence.

## 12. Required test coverage and quality gates

Run progressively, not as a giant unactionable batch:

**Static/build/contracts:** format checks, `flutter analyze`, Dart unit/widget tests, existing API tests, schema/client drift tests, Android build, native manifest/configuration review, server/web lint/types/build, secret/license/current dependency review. Assert production variants reject local endpoints and fixture auth. Do not claim hosted CI from a local runner.

**Widget/visual:** deliberate golden baselines for key pages and control states in both themes, small/large layouts, enlarged text, long titles, errors/empty data, controls open and captions visible. Load real fonts in controlled tests where permitted. Inspect expected/actual/diff files before accepting a baseline. Tests of an automatically accepted wrong screenshot do not establish design quality.

**Integration:** use real API/member persistence for both native and web journeys, not all mocks. Test cold start, actual account signup/confirmation, first-use interests, Save and cross-client refetch, conflicts, logout, API restart, denied assets, direct links, navigation and real media. Controlled stubs are for error injection with their boundary identified. `integration_test` alone does not prove system browser, notification or lock-screen actions; use available native instrumentation/ADB tooling or a real manual test and label its scope.

**Media/lifecycle:** enumerate all 23 IDs and verify unchanged hashes, metadata, eligibility/caption/source mapping. Exercise native initialization and seeking for each available rendition. Play representative longest Radio edition, full solo and duo, and all six Clips through completion in the app; expand full play-through on failure. Repeat at least 20 mixed navigation/background/format journeys and 20 clip transitions with no accumulated abandoned controllers, sessions, listeners, handlers or continuing hidden animation loops. Record resources and warm-up rather than claiming perfect memory from one heap sample.

**Failure/adversarial:** revoked/expired auth, malformed callback, wrong PKCE/state/redirect, replay/races, A/B ownership, 409, slow API, lost connection, range failure, wrong/missing captions, permission denial, fast Back/Next, dropdown over player, drag cancellation, delayed media load after owner switch, logout during pending write, history opt-out with pending progress, process kill/restart, and backend restart without reseeding.

**Accessibility:** Flutter Guideline API, semantics inspection, touch targets, labels/roles/states, text scaling, focus order, TalkBack/VoiceOver or NVDA when actually available, keyboard/switch-friendly alternatives, motion reduction, caption legibility and source navigation. Automated semantic checks are not a screen-reader experience report. Current SDK heading semantics must be checked rather than copying stale examples.

**Performance:** native profile-mode measurements on actual devices when available, using recorded refresh rate/build/device/thermal/test conditions. Debug/emulator observations are useful diagnostics but not physical release-performance certification. Distinguish UI/raster timings from 30fps video cadence, network waiting, audio underruns and recorder overhead. Reuse the unchanged web gates separately; do not apply a web 7ms callback threshold as a Flutter frame budget.

Proposed native reference targets, to be frozen before implementation and not described as measured success: at a fixed 60Hz target, warm p95 UI and raster frame work each under 16.7ms, p99 each under 33.4ms, and under 1% frames over one budget in scripted ordinary scrolling/control workloads; record end-to-end frame events as well, not just separate thread percentiles. Use the equivalent 8.3ms frame budget only on a genuinely tested 120Hz target. Keep cold startup/shader/transition outliers separately visible, not discarded. Interactive local response p95 target <100ms for the defined input-to-visual proxy. Visible eligible video target <0.5% reported dropped frames and no unexplained post-start waiting in a 61-second window where the platform exposes reliable counters. Missing counters are NOT MEASURED, not zero. Revisit scope or report failure if targets cannot be met; do not move thresholds to pass.

**Release-candidate revalidation:** perform a clean-source reproducibility build, final core regression, three clean critical-journey repetitions and two final unchanged-build review sweeps. A final test can update its own evidence files without changing product source identity. Any product/contract/dependency/baseline change requires affected revalidation. Keep an intermittently failing case open until explained and repaired; one lucky retry is not closure.

## 13. Human and platform closeout without fabricated sign-off

Actively attempt feasible manual/integration checks, rather than automatically carrying every prior pending item forward. Then produce one short owner review packet with exact route/build, device setup, action, expected result and a place for an explicit decision. Do not ask for approval after every button.

- **Owner visual/motion:** provide matching web/native screens, actual short uncut interactions, page-turn and interest-selection journey, and representative Radio/Newsroom/Clips playback. Agent inspection is not owner acceptance. Record approval only from an actual owner response.
- **Subjective listening:** technical decode, loudness/clipping checks and advancing video frames do not prove natural voice, mix or perceived lip-sync. Listen if the available tools genuinely support it and identify the listener; otherwise supply timecoded excerpts and explicit owner tasks. Do not mark listening complete from waveform statistics.
- **Physical device:** use a connected authorized device, record model/OS/build without exposing its serial in review exports, and test hardware touch/volume/lock-screen/interruption conditions. Emulator touch is not physical touch. No connected device means pending with exact setup, not a made-up pass.
- **Screen reader:** test actual spoken navigation and operation when accessible to the runner. Semantics screenshots are supplementary. A real Android TalkBack pass does not imply iOS VoiceOver or desktop NVDA passed.
- **Figma:** make one capability-based attempt with existing authorized tooling to synchronize the actual design in the existing file. Native editable pages/components/variables and real IDs are required. Read access or a screenshot is not an editable Figma delivery. If blocked, provide tokens/component-state specs/importable original vectors and keep the gate pending; no fragile “.fig” fabrication or unrelated remote-file changes.
- **iOS:** macOS/Xcode build, simulator run, physical-device playback and signing are separate rows. Shared Dart code plus an iOS directory is not any of those checks.

Owner/hardware blockers do not freeze useful Android work, but they cannot be relabelled “closed.” Prepare the local candidate and a precise action list instead of manufacturing certainty.

## 14. Milestones and execution ownership

Complete these in dependency order, with the review loop attached to each:

| Milestone | Deliverable |
|---|---|
| CL01 | Current-state/media/data baselines, tools/capacity/connectivity inventory and frozen acceptance definitions. |
| CL02 | Remaining web geometry, controls, Clips, interest and paper-turn corrections verified in actual routes. |
| CL03 | Native Flutter structure, theming, routing, API contracts and connected guest Home/article/source vertical slice. |
| CL04 | Narrow reviewed native auth bridge and complete real captured-mail account journey; web security preserved. |
| CL05 | Native first-account interests, Preferences, Library and cross-client durable data behavior. |
| CL06 | Native Radio handler, direct dials, persistent player, background/focus/remote-control lifecycle. |
| CL07 | Native Newsroom and Clips on unchanged assets with one media owner, caption/source seeking and finite portrait feed. |
| CL08 | Native page turning, tablet/orientation/deep-link/global failure states and full parity cleanup. |
| CL09 | Structured reviewer findings, repairs, security/contract/race/accessibility/lifecycle regression. |
| CL10 | Profile-mode performance and available physical/system-UI checks; classified remaining platform gaps. |
| CL11 | Clean candidate build, repeated unchanged-build acceptance, media/data preservation, installable APK and artifact scan. |
| CL12 | Figma attempt, owner/device/listening packet, concise canonical status, verified run/install commands and handoff. |

Do not stop at CL03 because a shell compiles. Develop the connected screens and operations. Do not defer all verification until CL09; that milestone is the consolidated review, not the first testing. Independent reviewers may work concurrently, but serialize shared-source integration and expensive operations. A genuine external blocker is recorded once with its dependency; proceed with unrelated milestones.

## 15. Deliverables and definition of done

Deliver actual project files plus:

- Flutter Android/iOS source in the chosen repository location, versioned dependency locks and a documented configuration boundary.
- A directly installable **local-demo Android APK** with build mode/flavor, version, ABI coverage, SDK requirements, signing identity type, source fingerprint, dependency fingerprint, file SHA256 and actual path. Install/launch it on the available test device/emulator; an AAB alone is not a sideloadable APK. A debug/test signing key does not become a production signing claim.
- iOS configuration and an exact Mac handoff; simulator/build/binary only if actually produced. No store upload.
- Working connection/start/run/install/test scripts, including scoped ADB forwarding and cleanup. Commands must have been executed for the claimed result. Do not present guessed flags as verified.
- A unified web/native parity matrix and acceptance register with criterion IDs, expected behavior, actual result, environment, timestamp, source/APK identity, evidence and honest status.
- A defect ledger preserving failed reproductions, severity, fixes and retests; complete screenshot/uncut interaction evidence with external assets packaged correctly and secrets excluded.
- Current license/notices and vulnerability reports, no claim that a local candidate clears unresolved release audits.
- Baseline/final hashes for all 23 renditions and migrated data preservation, plus real two-client persistence evidence.
- A review index that opens locally without missing referenced captures. Separate unedited verification from any optional promotional edit; no new Brag/rendering work is necessary.
- `FINAL_CLOSEOUT.md` with a concise verdict for web engineering, Android implementation/build/tests, iOS, media preservation, security, Figma, owner review, listening, screen reader and physical devices. Avoid a single misleading “all complete” percentage.

Required status vocabulary: NOT STARTED, IMPLEMENTED, VERIFIED AUTOMATICALLY, INSPECTED BY AGENT, VERIFIED ON NAMED DEVICE, AWAITING OWNER, BLOCKED, FAILED, and NOT RUN. Each status applies to its named scope. Every must-pass row must have evidence or a precise blocking reason; blocked does not mean passed.

No newly introduced P0/P1 defect may be hidden in a positive verdict. Existing unresolved security/performance items retain explicit status. A high-quality local reader candidate can be delivered while release remains blocked; distinguish that from “production-ready.”

Leave the existing supervised demo healthy and the native app installed/runnable on the available target, without duplicate services. End with the few actual owner actions required, not twenty new planning prompts. Continue now from preflight into implementation and the complete review loop.
