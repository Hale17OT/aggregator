# The Aggregator — actual short-form viewing experience, web + Flutter

Owner-requested continuation, 16 October 2026. Read `01_REFERENCE_ANALYSIS.md` and `03_ACCEPTANCE_CHECKLIST.md` alongside this prompt.

## Mission and continuation authority

The owner rejects the present short-form presentation. Previous phrases such as “centred video”, “icon-led controls” and “TikTok-inspired” have not produced the required visual result. Correct the actual product in BOTH the built Nuxt web application and the existing native Flutter app.

This authorizes a connected local design/implementation/review pass, superseding historical one-checkpoint STOP boundaries only for this scope. Do not restart the project, generate another app, or stop after research and a component specimen. Continue all unblocked milestones through corrected web pages and a newly built, installed main-entry Android APK.

The target is an immersive short-form viewer: the picture establishes the screen, small controls occupy known edge positions, a concise item-action rail belongs to the current clip, and secondary information opens deliberately. A portrait rectangle above rows of player buttons is not acceptable. A desktop sidebar compressed into a scrolling mobile control column is not acceptable.

## 1. Start from the real 16 October checkpoint

Inspect the workspace, Git state, AGENTS.md, current canonical status, `apps/mobile/`, existing media components and the latest acceptance/defect records. Preserve unrelated changes. If implementation has moved beyond the supplied report, use actual verified state and record the delta.

The reported baseline is:

- A native Flutter widget application already exists; this is not a WebView/scaffold task.
- Home, Radio, Newsroom, Clips and Library use the existing 24-story API and 23-rendition catalogue.
- All 23 renditions and 93 original media/caption/source-map files are unchanged. Record their hashes before and after; do not regenerate, re-encode or bundle them into the APK.
- The retained member target is PostgreSQL on 55441 with migration 0012 already applied. No migration, schema reset, reseed or new identity system is needed here.
- Native sign-in, S256-bound one-use browser handoff, secure storage, scoped bearer transport and shared member services exist. Preserve them.
- The previous stable main APK is `output/flutter-closeout/aggregator-local-demo.apk`, SHA256 `48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0`. Preserve this baseline copy. Future corrected bytes require a NEW path/hash.
- Web's unchanged 7ms callback gate failed around 7.3–7.5ms, the CPU4 popup limitation remains, and a native profile-emulator raster gate failed. Those remain failed until relevant evidence establishes otherwise.
- Existing instrumentation and intermediate APK results are NOT byte-identical evidence for the final main-entry artifact.

Read `acceptance.json`, the latest defect ledger, candidate identity and actual source files locally. A reference to a report is not proof of its unseen contents.

Keep staff/MFA paused, private drafts private, retained accounts intact, and release gates enforced. No paid calls, external email, real ingestion, uploads, commits, pushes, production access, store submission or deployment. No new render run or Brag showcase. Use the owned running supervisor and scoped selected-device forwarding. Never start a duplicate server or expose the workstation on the LAN.

## 2. Study the actual reference states, not template mockups

Use the supplied analysis as a starting point, then inspect accessible official/current references and the actual app. Suggested primary sources:

- https://blog.youtube/news-and-events/youtube-shorts-experience-updates-features/
- https://blog.youtube/inside-youtube/design-principles-use-put-creators-center-stage/
- https://newsroom.tiktok.com/en-us/new-features-bring-tiktok-magic-to-desktop
- https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/

Record a small reference matrix for TikTok / Shorts / Reels × desktop / phone. Separate native phone, mobile web, desktop feed, post-detail view, paused view, and a menu or comments sheet. Record observation date, entry route, source, viewport if actually known, and limitations.

When an authenticated page cannot be inspected, use a labelled published screenshot or official walkthrough. Do not invent live inspection or spend the whole session retrying login walls. Do not accept terms, log in, post, like, follow, download competitor videos, or change another account to conduct a design study. Screenshots are references only, not application assets.

Notice the June 2026 Shorts changes rather than copying an old thumbs-up/dislike screenshot as current universal behaviour. Also do not implement a Like merely because competitors have it. The Aggregator has Save, Sources, Share and full-story navigation, not a fabricated social network.

Capture the CURRENT built `/clips` and the CURRENT normal Flutter Clips screen before editing, including playing, paused, short-height and details-open states. The implementation report alone cannot tell you where the rejected composition is wrong.

Write `docs/design/SHORTFORM_REFERENCE_AND_GAP.md`: for each visible gap, name the current component/layout, observed reference pattern, intended correction, and acceptance image/state. This is bounded preparation; immediately continue implementation.

## 3. Establish a route-specific Clips shell

Explicitly override previous instructions that forced the full newspaper masthead, paper card padding or a conventional video toolbar into the default Clips viewing surface. Preserve those on Home/articles; do not redesign the publication globally.

On desktop, retain a compact branded navigation context. On mobile web and Flutter, use a full media canvas with a compact top identity/control area and the existing bottom destinations. Do not show a large blackletter masthead plus a second large “Clips” heading above the video.

Keep Home, Radio, Newsroom, Clips and Library accessible and clearly mark Clips active. Do not copy a camera/create, shop, chat, or subscription destination from a competitor. Feed modes may use compact text tabs for the EXISTING supported semantics. Use All/Following or another truthful mapping; do not call an editorial mix “Latest” unless it is chronological, or invent a personalized For You algorithm.

The media canvas should be near-black, including in the light theme; the surrounding desktop publication chrome and reader sheets may retain the paper/forest palette. Original off-white overlay icons and restrained gradients provide legibility. Do not force embossed newspaper buttons over the video.

This is a structural change, not just recolouring or moving an existing toolbar.

## 4. Desktop Clips composition

### Geometry

The main portrait picture, not the composite “picture + rail + panel”, must sit on the main viewing canvas centreline with no details panel open. On a full-width canvas this is the viewport centreline. If persistent desktop navigation genuinely reserves space, define and document the resulting canvas rather than casually centring in leftover flex space.

Use an equal invisible gutter on the left to balance the visible right action rail. The actual picture's centre should be within 2 CSS px of the declared canvas centre in automated geometry checks, before and after title/selection changes.

Proposed starting geometry, not copied platform measurements:

- Compact desktop top bar about 56–64px; 12–20px vertical breathing room.
- Portrait source ratio retained at 9:16. Start with a 48–56px rail and 12–20px gap.
- Compute picture size from BOTH available height and symmetric available width: `pictureWidth = min(availableHeight * 9/16, availableSymmetricWidth)`; `pictureHeight = pictureWidth * 16/9`.
- Use the real content canvas measurement, including top chrome and browser viewport changes. Do not count unrelated offscreen document sections.
- On a 1280×640/720 laptop window, the picture and the four primary item actions must be immediately usable without scrolling a control column or clipping the picture. Compact top chrome first; move secondary actions to More instead of shrinking the movie to a thumbnail.
- At normal wide desktop sizes retain the same portrait hierarchy; do not stretch portrait video into a landscape frame.

The rail belongs next to the picture. Small separate up/down controls can sit farther to the right for previous/next CLIP. They are not the same as seeking within the clip. Retain wheel/trackpad and keyboard navigation; no full-width Previous/Next row below the player.

### At-rest visual state

Inside the picture: tiny edge play/sound controls where appropriate, concise lower-left item identity/title/full-story link, selectable captions in a protected region, and a thin bottom progress line. No persistent central pause symbol while playing. No repeated title/metadata card below it.

Beside the picture: Save, Sources, Share, More as a small, consistent vertical family. Desktop icon faces may have subtle neutral circular backgrounds appropriate to their surface. Do not use bulky square raised cards, large green labels, fake numbers or placeholder engagement actions.

An opened Sources/details panel can occupy available space or overlay from the side. Default viewing geometry is not held hostage by a permanently open panel. Keep the video/controller instance intact; closing the panel returns the base composition without losing position.

## 5. Mobile web and native Flutter composition

The clip is a whole viewing page, not a card inside a long form. At rest there should be no scrolling toolbar, rows of setting dropdowns, large heading, debug text, or player instructions between the picture and bottom destinations.

Use the existing native Clip paging as the basis. `PageView` with vertical paging is an available Flutter primitive, not a request to recreate the data service or initialize every video's controller. The web equivalent may use the existing feed with a single bounded scroll container and CSS snapping. Reuse good code rather than swapping implementations merely to use a particular primitive.

### Aspect ratio and safe areas

Use a full available media canvas with the portrait content centred and proportionate. News footage and burned-in words may not be centre-cropped just to fill a tall phone. Default to containing the complete 9:16 picture; use neutral matte space to reconcile device ratio, system bars and navigation. Where source-safe framing can truly fill the canvas, demonstrate it rather than assuming every clip has safe crop margins.

No stretching, decorative device bezel, fake blurred copy of the video, or two concurrently decoded copies. Edge-to-edge EXPERIENCE does not mean falsifying the image geometry.

Handle actual safe-area/view insets, gesture navigation, cutouts and mobile browser chrome. On Flutter restore any changed system UI appearance when leaving Clips. On web account for dynamic viewport height rather than assuming 100vh always equals the visible area.

### Overlay layout

- Top: compact Clips identity/back context and a small mute/More affordance as needed; optional existing All/Following tabs. Avoid duplicating More in two primary positions.
- Right: Save, Sources, Share, More, or the equivalent reduced arrangement if More is at the top. Use 24–28px glyphs, optical centring, and actual 48 logical-pixel native / at least 44 CSS-pixel web targets. Targets must not overlap even if glyphs are small.
- Bottom-left: one compact publication/topic identity line, a two-line headline, and Read story. More text opens a sheet; it must not continuously enlarge the feed page.
- Captions: their own region; never confuse descriptive copy with actual subtitles. Use the existing VTT/timing and user setting. Keep text clear of the rail, metadata, bottom bar and source footage's own critical labels.
- Bottom: a thin progress line above the fixed navigation region, expanding into an accessible scrub interaction. Keep time labels visible when seeking, paused or explicitly focused rather than occupying a permanent transport row.

Inspect all SIX actual clip files' opening, middle and closing frames before settling overlay coordinates. If existing burned-in lower thirds occupy a region, move transient interface metadata into matte space or collapse it; do not hide required subtitles or cover factual visual evidence. At enlarged text sizes, offer a readable expanded details/transcript mode and a separate unoccluded caption strip inside the viewing canvas as needed. Never solve accessibility by shrinking text below the user's setting.

## 6. Define the controls and gesture state machine exactly

Share the semantic contract across web and Flutter; platform input differences remain explicit. Drive icons from actual player state, not assumed click success.

### At-rest / playing / paused

- Unobstructed picture tap/click toggles play/pause. Mobile swipes, drags, rail actions and caption/text selection must not generate that tap on completion.
- While playing, no oversized permanent centre icon. Feedback can appear briefly then recede.
- When manually paused, show ONE central play affordance and preserve that intent. The feed must not immediately restart it due to an observer, rebuild or sheet closure.
- Mute is an explicit speaker control; picture tap is not also mute. Do not implement a confusing mix of competitor rollout gestures.
- Do not map double-tap to an undocumented Save/Like action. Do not add press-and-hold speed changes in this pass unless already implemented and properly surfaced; normal tap/swipe/scrub quality comes first.
- Web autoplay/play rejection produces a usable play affordance and accurate state. Never animate playback progress without actual media advancement.

### Seeking

The visually thin timeline must have a generous independent interaction/semantics target. Dragging it suspends vertical feed paging for that pointer and previews/clamps time. Commit the seek deliberately and preserve prior pause intent. At cancellation, use the established documented rollback/commit contract; no stuck pointer capture.

Desktop Left/Right may seek within the focused player; Up/Down/PageUp/PageDown navigate clips only when focus is in the viewer and not in a slider, field, menu or sheet. Space operates the focused button/slider according to its native semantics rather than globally firing twice. Prevent browser scrolling only for the event the viewer actually consumes.

### Item actions

- Save uses the existing article bookmark state, not a synthetic like count. State survives the existing server round trip and remains owner scoped.
- Sources opens source/transcript details without login. Give this unfamiliar icon a brief visible label so it is not mistaken for Comments.
- Share uses the platform share UI where available and the existing safe-link/clipboard fallback elsewhere; share cancellation is not reported as success.
- Read story opens the matching article/section with the correct eligible identity. Back restores the same clip and position PAUSED.
- More includes only supported secondary settings: captions, existing speeds, full transcript/details and existing hide/feedback controls where real. No resolution options for renditions that do not exist, no fake download/cast/report/comments capability.
- End-of-item reveals replay/next, not all of those controls permanently. The end of the six-item/filtered edition stays finite; do not fake an endless catalogue or auto-scroll forever.

### Overlays and lifecycle

Record playback intent before opening Sources, settings or a system share sheet. For our news-reading contract, pause while a reading/modal surface obscures the viewer and return paused. Do not silently resume an old clip after route changes, logout, interruption, failed playback or system navigation.

Only one media owner may emit audio. Deliberately starting Clips pauses Radio/Newsroom; merely opening the Clips destination must not unexpectedly take sound away from already playing Radio. No visible mini-player should overlap captions or the action rail. Where Radio is still the owner before first Clip play, provide a compact owner indicator/control without converting the page back into a dashboard. Preserve its session, never dispose its persistent audio element/service as a layout shortcut.

Subsequent intentional clip navigation may continue playback only after the user has established the current feed's playing intent. A restored page/deep link or manually paused state does not establish that intent. Backgrounding pauses visual Clip playback as appropriate; it does not revive it automatically on return. Preserve existing explicit background Radio behaviour.

## 7. Accessibility and actual implementation

Use original shared SVG/IconData assets with consistent stroke, optical alignment and meaningful selected states. Keep transport symbols distinct from the general raised controls used on forms. Native icon buttons need tooltips/semantics; web action icons need native button semantics or real links. There must be no huge semantic button containing nested action controls.

Do not remove accessible playback or next/previous operations when visually simplifying the screen. Provide a clear Playback/navigation action entry in More where the gesture alternative is not already visible. Screen-reader users must be able to pause, move to the next item, seek, mute and open sources without performing a swipe gesture intended for sighted paging.

Focus entering a modal is deliberate; focus returns to its triggering control, or a logical surviving control if the item was invalidated. Escape/Back closes the topmost sheet/menu before leaving the feed. Background content is not also operable through a modal. A scrolling transcript consumes its own scroll; it must not advance the feed behind it.

Respect reduced motion and system text scaling. Do not repeatedly announce progress per frame. Announce the newly committed clip/title once and meaningful failures once. Announce Save according to the actual result. Captions do not disappear just because other interface chrome hides.

For Flutter, modify the existing screen/controller boundary. Isolate fast progress updates from metadata, image/layout and controller creation. Account for route lifecycle, stale async initialization and rapid page changes. Do not recreate a video controller from `build`, on a theme change, after saving, or when a sheet opens. Cap initialized media at the existing proven bound; prefer the one-current-controller policy where it works. Preloading may use bounded permitted metadata/posters, not initialize 23 simultaneous decoders.

For Vue, retain the existing media owner and teardown repairs. Avoid sending timeupdate through the entire page tree. Use intersection/scroll state to identify the actual settled active item; do not issue competing play calls for neighbouring partially visible pages. Abort or ignore stale requests and initialization events. Preserve no-JavaScript public Clip/story/source fallbacks without rendering the full bibliography as permanent feed chrome.

Use the existing libraries first. A new video-player framework or platform state-management rewrite is not needed merely to position controls. No WebView substitution for Flutter.

## 8. Correct Newsroom and Radio transport without making them Shorts

After Clips is coherent, audit both clients' other media screens for remaining command rows.

Newsroom remains a long-form 16:9 experience. Use its conventional timeline and grouped play, sound, time, captions, settings and fullscreen controls. Keep the existing anchor/treatment preference service and exact unavailable-rendition behavior. Secondary selectors belong in a compact programme/settings surface, not permanently over the video. Do not give the programme a fake vertical social rail or swipe to another story during a seek.

Radio remains the crafted radio. Preserve all actual knob input mathematics and fallback controls. Use icon-led physical Play/Pause and chapter keys; keep useful hardware labels such as VOLUME/STORY and current values. A radio must not become an unlabelled video overlay. Its mini-player needs concise title, progress, play/pause and queue/expand actions, not duplicate large Play and Pause text buttons. Do not delete keyboard/step alternatives because they make accessibility visible.

Only modify other reader surfaces to resolve a concrete shared regression or an explicitly unfinished prior closeout criterion. Leave Home gutters, the paper turn, search/category newspaper and hierarchical interests intact if they already pass the current design direction. Do not restart those design cycles.

## 9. Execute the correction in eight connected milestones

1. **Baseline and references:** actual web/main-APK captures, source/data/media/APK identities, six-surface reference matrix and explicit gaps.
2. **Viewing shell and desktop composition:** implement picture-centred, height-aware desktop Clips with compact rail and separate item navigation.
3. **Phone surfaces:** implement the corresponding mobile-web and native Flutter full viewing canvas, safe areas, metadata/caption zones and bottom navigation.
4. **Real interaction:** tap, swipe, scrub, keyboard, save/share/sources, end states and gesture arbitration against the existing services and media owners.
5. **Cross-format consistency:** correct remaining Newsroom/Radio transport hierarchy and verify ownership/resume flows without rebuilding their engines.
6. **Performance and lifecycle repair:** baseline and profile the changed paths, repair concrete regressions, retain accurate failed gates and recheck cleanup.
7. **Review/repair sweeps:** actual comparative captures, real journeys and independent review where available, then targeted repairs followed by regressions.
8. **Normal-app delivery:** final built web and frozen main-entry APK, actual installed-candidate smoke/journeys, fresh fingerprints, preservation proof and concise remaining gates.

Maintain `docs/execution/SHORTFORM_REBUILD.md` with status/evidence by milestone. Do not stop at a screenshot mockup or first pilot. An inaccessible reference, Figma bridge or iOS environment does not block independent Vue/Android work, but it must not become a fake pass.

## 10. Separate visual success, functional success and performance

A geometric “centred” assertion alone previously allowed a visually wrong interface. Review images must show the complete viewport in actual use, not a cropped video that conceals surrounding clutter. Side-by-side comparisons should be at matched viewport/content size and clearly labelled reference versus actual implementation; do not use competitors' videos or artwork inside the product.

Required states: playing at rest; paused; seeking; captions on; Sources open; More open; first play rejected/network failure; final clip ended; empty filtered feed. Inspect long metadata and all six source clips' critical on-screen text. Resolve overlap in the real pixel/widget layout, not by changing screenshots or hiding required facts.

Web references: 1440×900, 1280×720, 1280×640, 1024×768; mobile web 390×844, 360×740 and 320px reflow, with dynamic browser-height changes. Native: actual emulator dimensions recorded, at least a compact and tall portrait layout, a landscape/short-height layout, both app themes and 2×text. These are project review targets, not a claimed platform screenshot matrix.

Do not weaken the recorded web 7ms gate or native frame budget. Record matched before/after traces for the same source/build mode/device/scene, separately from screen recordings and test instrumentation. Flutter profile-emulator data remains diagnostic, not physical-device certification. Inspect UI and raster work separately; a 30fps video does not require a 30fps interface, and duplicated frames are not a repair.

Avoid heavy backdrop blur, global opacity/saveLayer over a running video, repeated intrinsic layout and unbounded controller work. Use targeted optimizations only where traces support them. A neutral matte and small gradient do not need another animated full-screen effect. No render generation, full-catalogue regeneration or broad framework replacement.

## 11. Review and repair loop with traceable evidence

For each milestone: define acceptance → inspect baseline → implement → test real interaction → inspect actual normal-speed output → independent challenge where available → record defects → repair → rerun affected cases and regressions.

Use separate reviewers only when available; otherwise label sequential self-review. A reviewer must inspect the current running surface/capture and source or results relevant to the claim, not repeat the implementer's summary. Do not mark owner approval yourself.

Run three fresh repetitions of critical mixed journeys and two final review sweeps after the last product change. Retain historical failures. Test fixes must explain whether the old oracle was wrong; do not approve screenshots or relax an assertion solely because the product failed it.

Minimum mixed journeys:

- Home → Clips → actual first play → pause by picture tap → swipe while paused → next play → scrub → Sources → return paused → matching article → Back at same clip.
- Radio playing → enter Clips without unexpected sound takeover → deliberately play a clip → only clip sound → Newsroom play → only programme sound → return to Radio with no surprise resume.
- Member Save/unsave → correct shared Library state → logout → no protected data or delayed stale Save success → anonymous source reading still works.
- Rapid swipe reversals, interrupted initialization, app/browser background and return, 20 feed transitions, 20 route exits, denied asset, expired rendition and connection-loss retry. No abandoned decoders, listeners or player loops.
- Keyboard and screen-reader semantics navigation; opening a sheet and using its scrolling/Back without underlying item changes.

Playback tests must use real media and report actual advancing state. Screenshots do not prove audio, lip-sync, hardware volume or perceived performance. If tools cannot play a recording for normal-speed inspection, report that limit and supply the actual file; do not bypass tool security or equate extracted frames with watching it.

## 12. Freeze and deliver the corrected actual app

Preserve the previous frozen APK. Build the new normal `lib/main.dart` local-demo app from the final candidate, not a test entrypoint, and copy it to a new stable location such as `output/shortform-rebuild/aggregator-shortform-local-demo.apk` with SHA256 and source/lock fingerprints.

Keep the package identity/signature compatible so a scoped `adb install -r` preserves account data; do not uninstall or clear storage. Use the already authorized emulator/device and existing forwarding wrappers. Do not install on an unrelated device or reaccept browser agreements on the owner's behalf.

Instrumentation can overwrite an intermediate build APK, never the stable delivery copy. After tests, install the final stable main APK, verify installed identity and run actual default-app navigation/control checks. Label source-equivalent instrumented results separately; do not claim byte identity when it is not true. If a final notification/icon/comment/product change affects the frozen artifact, issue a new fingerprint and rerun the impacted checks rather than pretending the previous artifact was tested.

Deliver:

- Actual web route and verified local commands, with the owned supervisor left in the declared state.
- New installable APK path/hash and exact successful install/launch commands; original baseline preserved.
- Matched full-viewport desktop/phone before/after captures including rails, navigation and captions, not only portrait crops.
- Two uncut normal-speed recordings: real desktop pointer/keyboard viewer interactions and real native phone gestures, showing the controls used and actual state changes.
- Reference/gap matrix with one-line decisions, feature/parity acceptance checklist, updated source/component files and unresolved defects.
- Unchanged 23-rendition/93-asset evidence, retained member-data preservation, security/release status and current performance results.
- Explicit native Figma, physical Android, TalkBack, listening, iOS and owner-review gates. Attempt only available authorized tests; missing human/platform evidence stays pending.

Do not deliver only a plan, an edited promotional reel, an old APK, or a passing-build statement. The owner should immediately recognize the Clips viewer as a short-form product on both desktop and phone while the rest of The Aggregator still works.

START NOW: inspect the real current web and main APK, identify the difference in viewing hierarchy from the references, and implement the desktop and mobile viewing shells before polishing individual icons.
