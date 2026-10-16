# The Aggregator — coherent reader, media and interest experience

Prepared 14 October 2026. This is an executable continuation brief for the existing Codex project, not a new application specification.

## Authoritative instruction

Continue the existing Aggregator from the latest **Reader completion checkpoint — 14 October 2026**. The latest owner feedback requires these connected changes:

1. Correct the missing-looking LEFT text gutter on Home without ruining the right gutter.
2. Replace rows of literal Play/Pause/etc. controls with familiar, icon-led audio/video player layouts.
3. Center the Clips picture properly, with YouTube Shorts as a composition reference.
4. Make Clips a first-class feature alongside Home, Radio and Newsroom.
5. Replace the rigid-looking flip with a convincing flexible newspaper page turn.
6. Replace interest Follow/Select button rows with a category/subcategory browser and selectable text tiles that change appearance when chosen.
7. Keep Home's newspaper layout when searching or choosing a category; update the articles inside it rather than navigating to a differently composed results page.

This is one integrated UI/interaction refinement. Continue through the authorized work in this run instead of stopping after an icon, isolated prototype or first screen. Preserve unrelated work and do not rebuild completed systems.

### Starting-state facts to verify, not historical tasks to repeat

The supplied reader checkpoint reports 24 fictional stories, 23 prepared programmes including six portrait Clips, durable interests, personalization, edition pagination and shared SVG dropdown indicators. Retained product startup pins migrations **0001–0011**. The older seven-migration/17-programme summaries are history, not the current target.

Inspect the actual workspace and running system before relying on those counts. Do not regenerate the six Clips, redefine the 396-concept authored catalogue, reimplement sign-in, or redo migration 0008.

The latest reference callback gate is **FAILING**, not passed: dial p95 7.2–7.4 ms and queue p95 7.1–7.5 ms against the unchanged 7 ms limit. An empty document measured p95 7.4 ms in that run; this suggests a possible environmental contribution, not proven causation or permission to change the threshold. CPU4 popup/list cost remains unresolved. Preserve prior evidence and distinguish matched new regressions from that starting limitation.

### Boundaries

Keep the accepted newspaper identity, blackletter masthead, palettes, general button design, working radio cabinet/dials, presenter performances, prepared media and source links. Refine media-specific controls rather than redesigning every button.

Preserve retained PostgreSQL/member data, auth, CSRF, ownership, interest IDs, mutes/follows, exact-version subject assertions, edition privacy and source/asset eligibility. Staff/MFA stays paused. Private source-to-draft output stays private.

No reset, reseed, public deployment, production access, real-source ingestion, new model download, paid calls, external email, upload, commit or push. No duplicate supervisor. No migration should be necessary; record any genuinely unavoidable contract gap before changing scope.

This instruction **supersedes earlier restrictions against custom video controls only for the app-owned prepared media addressed here**. Preserve an accessible native fallback. It does not authorize covering/replacing a third-party embedded provider's required controls or branding.

## 1. Inspect the actual app and record a compact baseline

Read AGENTS.md, current status, the reader completion report, relevant original design/flow requirements, shared layouts, player wrappers, interest editor, edition/query services and existing tests.

Capture the current built Home, filtered Home/search, Radio, Newsroom, Clips, and interests at representative desktop/mobile sizes. Measure geometry as well as inspecting images. A historical claim of centered controls does not overrule the owner's present visual complaint.

Study established player composition using accessible official references and, where available, the actual public interfaces:

- YouTube long-form player: bottom timeline, grouped transport/volume, settings/captions/fullscreen.
- YouTube Shorts: portrait-first framing, controls near the picture, compact contextual actions.
- TikTok and Instagram Reels: economical overlays and separation of transport from story actions.

Inspect what is actually available in this environment. Do not claim a live review if login, access, or transport prevents it; use accessible first-party references and independently designed equivalents. Do not sign in to external accounts, copy branded assets/code, invent counters, or add features simply because those platforms contain them.

Record a short implementation map and component ownership. Reuse existing primitives and icons. Do not start parallel edits to the same shared layout/player files.

## 2. Repair the Home text gutters at their real source

The complaint concerns where the letters begin, not merely whether the outer container's bounding box is centered.

Inspect page wrapper, paper surface, left column, text blocks, nested grids, inline padding/margins, first-child rules, transforms, negative margins, scrollbar compensation and box sizing. Identify the actual missing inset rather than applying arbitrary left padding to unrelated elements.

Establish one shared Home paper container with:

- Centered outer width and balanced page-side gutters.
- Consistent LEFT and RIGHT inner paper insets for the outermost text columns.
- Aligned masthead rules, topic navigation, edition/status strip and story grid.
- Stable grid gaps/dividers and the accepted asymmetric editorial hierarchy.
- `min-width: 0` or equivalent where long headlines otherwise force grid overflow.

Starting art-direction ranges, not fixed requirements: approximately 16–20 px side breathing room on narrow phones, 24–32 px on tablet, and 24–40 px inside the desktop paper surface, plus its existing centered outer margin. Reuse existing spacing tokens and inspect the result before choosing final values.

Do not repair the left side by removing the right margin, widening all text to the viewport, globally indenting every paragraph, clipping headlines, or offsetting the whole newspaper with a translate.

Measure the first and last text line boxes relative to the paper's inner edges, and separately inspect ink overhang in the chosen serif. An intentional hanging quotation mark is not equivalent to a missing column gutter. Compare the outermost column boundaries, not the ragged end of a short sentence.

Apply the same corrected wrapper to unfiltered, personalized, category and search editions, loading/error/empty states and every paginated spread. The final resting geometry after a turn must match the initial geometry.

Use logical properties where appropriate, account for safe areas, avoid `100vw` scrollbar overflow, and keep open menus/focus outlines from being clipped by paper effects.

## 3. Make Home, topic filtering and search one newspaper experience

### Required visible behavior

Clicking a news category or submitting search from Home keeps the same masthead, overall width, margins, navigation, paper surface and newspaper grid. The story contents, result context, page count and applicable availability change. Do not replace the newspaper with a generic search list, category dashboard or a separate oversized heading page.

Use one shared reader-edition shell and one story-spread renderer. Implement through current Vue/Nuxt routing and existing feed services, not raw HTML replacement or a second client-only app.

A small existing-height context strip may show the selected topic, query, result count and clear controls. Keep it visually subordinate. Do not display an irrelevant fixed lead story or unrelated side-column articles when filtering; all article placements in the filtered spread must match its effective scope.

If there are fewer results, use deliberate sparse placement or an honest empty-state block within the paper. Do not fabricate results, repeat stories to fill every slot, or broaden the filter without the reader's deliberate action.

### URL and state rules

Adapt existing parameter names rather than inventing a parallel query contract. Conceptually support query + category/entity + editorial/following mode + page/cursor + edition identity. Use real links and a GET search form; client navigation enhances them. SSR/direct URLs must render the same correct filtered shell without relying on a previous in-memory visit.

- A category click changes the browsing scope. It does not save a followed interest.
- Search matches across the full eligible story set, BEFORE pagination, not just the six visible articles.
- When both query and category are selected, use their clear intersection. Clear query retains category; clear category retains query; Clear all resets the browsing filters, not account preferences.
- Preserve the existing following/mute policy. Do not silently discard explicit searches, bypass mutes or rewrite saved home mode to conceal an empty result. Explain applicable exclusions through existing controls.
- Query/category/mode changes reset to page one and create the correct new edition snapshot. Old cursors cannot be reused for a different scope.
- Only committed search/filter changes enter meaningful history. Do not push an entry or animate a page turn for every keystroke.
- Cancel/ignore stale responses. A slow old search must not overwrite the newest selection. Keep current content until a valid replacement is ready; errors expose retry without mislabelling the previous page as the requested result.
- Back/Forward restores scope, query, edition/page and reading position appropriately. Opening an article and returning restores the prior spread, not generic Home.
- Preserve correct owner-bound edition behavior and expiry handling. Do not put private member IDs/interest lists in shareable URLs or shared caches.
- Do not key the persistent root audio or whole layout by full route/query. Theme changes and opening settings must not restart media.

Existing `/search`, desk/topic, and interest-detail URLs must remain valid. Render the same shared newspaper shell or provide a lossless canonical route with its query preserved. Explicit richer topic details can still exist where already needed; Home category clicks must perform the owner-requested in-place newspaper filtering.

Ordinary category/search changes use a quiet content replacement, not a mandatory full paper curl. The large page turn belongs to explicit Next/Previous edition navigation.

## 4. Make Clips a primary mode, not a hidden link

Create a deliberate, consistent format navigation using the established masthead structure, with **Home · Radio · Newsroom · Clips** as peer destinations. Keep topic navigation separate from format selection; Sports is a topic, not an alternative media format.

Make Clips discoverable on desktop and mobile with the same prominence and clear current-state treatment as Radio and Newsroom. No tucked-away overflow-only Clips link and no giant new landing hero.

Preserve existing deep links and add consistent article-format availability and Library filters for Clips. A compact poster-based Clips section on Home is appropriate if integrated into the paper layout and genuinely scoped to the current query/category; do not fill it with unrelated clips during a filtered search. No autoplaying video wall.

Only actual eligible clips are offered. Do not create new content, fabricate popularity or add likes/comments/follower counters with no product backend. Keep related story, sources and existing save/share actions real.

## 5. Replace media command rows with familiar player controls

### Shared design and behavior

Replace visible transport text buttons such as Play, Pause, Previous and Next with clear, consistently drawn SVG icons and purpose-designed grouping. This is NOT a ban on useful text: time, rate, titles, captions, Sources, Read story, error explanations and menus still need readable labels.

Use the existing icon family, centered paths, uniform view boxes/strokes and appropriate hit areas. Do not use emoji/Unicode glyphs or install an icon pack for each player. Add accessible action names and keyboard/focus tooltips; do not use title attributes as the only labels. Play/pause and mute labels update from real state. Use a coherent action-label OR stable-label/toggle semantic model rather than conflicting states.

Use a shared media-state binding and presentation primitives, not three disconnected implementations. Retain the root audio and exact prepared video elements as the playback authorities. Observe actual play/pause/ended/waiting/seek/rate/volume/fullscreen events; handle rejected play promises and rapid actions. Never animate success before the element actually plays.

Enhance the same native media element after initialization. Native controls remain available when enhancement is unavailable; there must not be simultaneous duplicate native and custom bars in the normal enhanced view. If custom initialization fails, restore the usable fallback. Preserve tracks and transcript/source HTML.

Keep shortcuts scoped to the active focused player, respecting form fields, interest tiles, menus and dialogs. Space on a focused button activates it once, not both the button and a global playback handler. Scrubber arrows adjust time; Clips navigation keys must not steal a slider's keys. Do not hijack browser shortcuts.

### Newsroom — conventional landscape player

Treat the picture as primary. Use a restrained bottom scrim for contrasting controls rather than a row of raised form buttons below the player.

Suggested arrangement:

- Before playback: a clear central play affordance over the poster, with title/context outside or in a safe area.
- Timeline across the bottom, then a compact lower control row.
- Left group: play/pause, applicable replay/skip controls, mute with supported volume adjustment, elapsed/total time.
- Right group: captions, playback/settings menu, optional supported picture-in-picture, fullscreen.
- Programme/anchor/treatment selection stays in an intentional surrounding toolbar or settings surface, not mixed into basic transport.

Show only actual capabilities. No fake quality menu when only one resolution exists, no bogus live indicator, no dummy PiP/fullscreen icons. Unsupported controls are omitted or explained honestly. On platforms that own device volume, keep mute where supported and the existing truthful device-volume explanation.

Controls reveal on pointer/focus or explicit touch interaction. Hide idle overlays only when playing and when no control/menu is focused or being used. Show them while paused, ended, loading or failed. Do not hide focusable controls beneath an invisible layer or make touch users depend on hover.

Tapping the picture can provide conventional play/pause or reveal behavior, but implement one clear interaction without double toggles. Control/menu clicks must not propagate into the picture toggle. Single taps are distinguished from scroll/seek gestures.

Caption placement must avoid the controls and essential footage. Retain the current readable small-screen caption treatment and the ability to use native fullscreen. Fullscreen the appropriate wrapper where supported so custom controls/menus/captions remain together; fall back to native fullscreen where required. Do not regenerate videos merely to reposition their HTML controls.

### Radio — audio-player hierarchy inside the physical object

Keep the enamel cabinet, speaker, inset display and directly manipulable knobs. Refine transport keys into engraved/icon-led controls: previous chapter, backward skip where appropriate, a dominant play/pause key, forward skip and next chapter.

Do not put every optional action into the hardware face. Keep queue, speed, sleep and transcript/source access in a tidy supporting toolbar or menu with real state. Important values may remain text. Keep knob keyboard/step alternatives discoverable and synchronized; do not hide them to fake a cleaner design.

The persistent mini-player gets compact title/chapter information, a progress indication, play/pause, applicable skip/next, queue and expand. It must feel like an audio player, not a form toolbar. Small screens retain the main transport and move secondary options into a labeled menu.

No visible separate simultaneous Play and Pause buttons. The same action swaps its icon according to actual state. A Stop action appears only where a clear product need remains; do not crowd ordinary playback with redundant commands.

### Clips — short-form control grammar

Use picture-first composition. Compact transport/mute controls live on or immediately beside the image; a thin accessible progress/scrub affordance sits near its bottom. A temporary central play/pause acknowledgement is acceptable but must not obscure the story continuously.

Place story-level actions in a small rail: existing Save, Share/copy, Sources and Read full story. Captions/settings can use the player controls/overflow as appropriate. Small explanatory action labels are welcome, particularly for Sources; the owner objects to literal transport-button rows, not understandable attribution.

No dummy Like, Comments or creator Subscribe actions. Fullscreen/next controls are only present if genuinely functional. Desktop up/down navigation is distinct from chapter navigation inside the recording.

Preserve sound ownership and the current policy for entering the feed while Radio is already playing. Browsing a poster or opening a menu must not grab audio. A deliberate play transfers ownership. Explicitly paused clips stay paused; rejected playback never looks active.

## 6. Center the Clips PICTURE, not an asymmetric wrapper

The actual portrait video must sit on the page's visual centerline below the masthead. Centering `video + right action rail + description` as a single flex group can still leave the picture visibly left-shifted; avoid that outcome.

At desktop use a symmetric outer grid/track allocation or another measured layout that keeps the VIDEO midpoint aligned with the content/viewport centerline. Position the narrow action rail outside the picture to the right without moving its center. A desktop description/source area must be collapsible or balanced, not a permanent wide sidebar that pushes the picture aside.

The normal browsing state should be visibly centered. For an explicit evidence dialog/drawer, describe and implement intentional responsive behavior without a hidden layout shift masquerading as centering.

Use the existing 9:16 recordings. Fit both available width and available height beneath site chrome, using appropriate dynamic viewport/safe-area sizing. A short desktop window must not crop most of the video simply to reach an arbitrary large width. Keep captions and evidence visible; do not use `object-fit: cover` to cut essential content from these prepared portrait files.

On phones, keep the picture in the available width with controlled overlay safe areas. If the action rail cannot fit outside it, move the rail inward deliberately and reserve space away from captions/text. Do not retain a blank desktop spacer on mobile or create horizontal overflow.

Maintain one stable snap-scrolling feed rather than a stack of full account pages. Feed scrolling, source-drawer scrolling and seek/volume gestures must not interfere. Ignore wheel/PageDown navigation while focus is inside a control that owns those inputs. Only actual active playback owns sound. Preserve finite endings and paused Back restoration.

Measure the picture rectangle at 390/834/1440/1920 widths and short/tall viewport heights. Record `picture midpoint - intended centerline`, not just wrapper `margin:auto`. Allow only small rounding tolerance in the closed-panel default state. Also inspect the actual rendered composition.

## 7. Rebuild the interest-picker presentation, not its data model

### Visual model

Present an organized catalogue with category headings, subcategory navigation, and selectable text tiles. Selected interests change color/surface and receive a clear check indication. Remove the repeated independent Follow/Select buttons beside every topic.

Use warm-paper/surface unselected tiles with readable borders; selected tiles use the existing forest/selected palette with a contrasting label and check. Dark mode gets its own correctly contrasted selected surface. Selection must not depend on color alone, and muted/unavailable states must not look like selected interests.

Each tile's text/face is the selection target. These are selection fields with shallow, quiet styling—not mini raised primary buttons. Long labels wrap; adequate spacing and target sizes matter more than forcing perfect equal-height pills.

Desktop: a category navigation rail or grouped accordion and an adjacent subcategory tile panel, plus a clear selection summary. Mobile: drill-down or accordions with breadcrumbs and an accessible back action. Reuse the same editor for first-account setup, `/interests`, and the Preferences interests section.

### Separate navigation from following

Opening Sports or expanding Football must not automatically follow it. Use distinct group-heading/disclosure controls for navigation and explicit selectable tiles for values. No button or expand control nested inside a checkbox label.

A recommended interaction:

1. Expand/open the Sports group.
2. Select “All sports” as a broad interest if desired, or open Football without selecting it.
3. Within Football, select “All football” or navigate to competitions/teams.
4. Within Premier League, select the league and/or choose specific teams through their tiles.
5. Selecting Manchester City marks that team tile. It does NOT silently select the league, every team, or all football.

Reuse the typed team/competition semantics. A team follow covers its competitions unless the user explicitly chooses the existing narrower team-in-competition scope. Finding it through the Premier League path does not redefine that meaning.

Represent selected descendants with an accurate count or “selected within” marker on the group. Do not check “All sports” just because one child is selected. Use a mixed checkbox only if that control actually performs a defined select-all/none operation; an ancestor coverage indicator is not automatically such a checkbox.

Broad follows can cover descendant tiles: distinguish “explicitly selected” from “included through Football.” Clicking a covered descendant must not silently mute it or unfollow the parent. Offer the existing explicit exclusions separately and describe their effect. Do not enumerate hundreds of synthetic child follows to represent one broad selection.

### Search and persistence

Interest search searches the existing taxonomy/entities, not the article feed. Keep the path visible for ambiguous labels, combine matches with their parents, preserve selections when navigating, and do not mount all 396 concepts as open nested controls at once.

Use native-backed checkboxes or the existing accessible equivalent with grouped labels, keyboard Space selection, visible focus and real checked state. Normal category navigation can use links/disclosures. Do not invent a tree role without implementing its complete keyboard model.

Preserve draft versus saved state and the current explicit Save/Continue flow. Tile selection changes the draft immediately; persistence happens under the established form contract. Save, Cancel, Skip or Continue remain appropriate form actions—the request does not ban all buttons from Preferences.

Retain conflict/version handling, CSRF, ownership, empty-selection and skip semantics, counts, mutes, unavailable concepts and sparse coverage. An API failure or 409 keeps the user's draft. Loading saved interests must not momentarily clear or resave them as empty. Test reload/API restart using controlled test accounts without changing the owner's interests.

Real Manchester City metadata is not permission to fabricate real-team news. Use the existing explicitly fictional team for positive matching tests and honest empty state for missing real coverage.

## 8. Make edition turning resemble flexible paper

The current rightward animation exists; the owner rejects its physical quality. Do not present another flat rectangle rotating about a hinge as a realistic newspaper turn.

### Visual acceptance

A deliberate Next/Previous turn should show:

- A sheet edge/corner lifting before the rest of the surface follows.
- A progressing bend/fold, not a uniformly rigid plane.
- A subtly lit paper underside and a moving narrow fold highlight.
- A contact shadow that shifts and softens as the sheet lifts away.
- The correct next headline page revealed underneath.
- A gentle settle into exactly the normal text geometry, without rubbery overshoot.

Keep the previously requested NEXT direction visually toward the RIGHT and Previous as its inverse. Do not confuse an animation library's forward/backward labels with increasing/decreasing our edition index. Map the physical effect deliberately. The masthead, format/topic navigation, controls outside the spread, and persistent player remain still.

No obligatory cover animation, faux leather book, oversized binding, sound effect, glossy card shine, endlessly fluttering corner, mirrored readable headlines or rotation of the entire browser layout. It is a soft newspaper sheet, not a hardback book UI.

A starting duration around 450–650 ms is reasonable for inspection, not a requirement to slow every task. Reduced motion swaps the content without 3D motion. Small screens use a restrained single-sheet version or an intentional accessible fallback if the full geometry cannot be made performant.

### Implementation path

Evaluate an isolated soft-paper prototype against actual current headline content. A dependency candidate is **StPageFlip (`page-flip`)**, documented for HTML/image pages and soft/hard page modes. It is a candidate, not mandatory architecture. Review its current release, source, licensing, pointer/scroll behavior, teardown and compatibility before adoption. Do not introduce its React wrapper, jQuery or a hardcoded flipbook application.

If it forces a fixed-height book, mismatched margins, inaccessible content, wrong direction, or unacceptable cost, use a bounded original clipped/folded-layer approach. Choose based on observed quality and fit. A basic `rotateY` with a shadow is not the fallback definition of a successful physical effect.

Keep semantic SSR HTML as the authoritative reader. At most the current and immediate target spread participate in an ephemeral visual layer. Do not clone the whole app, duplicate audio/video, serialize private state, keep hidden copies of every edition, or convert the whole paper into a persistent canvas.

Any visual duplicates must be inert, excluded from accessibility/focus and stripped of conflicting IDs; they must not run duplicate Vue watchers, listeners, network requests or source media. Clean up the layer, URLs, callbacks and observers after completion/cancellation/unmount. Do not open a public asset bypass to make image capture work.

Use current eligible title/image data, not generic screenshots or mismatched articles. Preload only justified near-page assets, reserve geometry and avoid blocking first paint on the animation engine. Do not adopt a screenshot library without proving font/image/layout fidelity and allowed asset access.

### Navigation correctness

Fetch/validate the destination before completing the turn. Failed/expired editions retain the readable current spread and offer retry; they must not leave an empty backside. Handle rapid Next/Previous, resize, font/layout changes, route leave, preference/search change and Escape deterministically. Commit one resulting edition/page state and restore the correct URL if a pending transition is cancelled.

Keep real Previous/Next links and no-JavaScript paging. Optional edge dragging is supplemental, bounded to an intentional interaction area, and must not swallow story-link clicks, text selection or vertical touch scrolling. A user must not have to drag to read the next page.

Capture an actual normal-speed Next/Previous sequence plus intermediate 25/50/75% frames. A final-page screenshot or a painted-direction assertion cannot establish convincing curl. Inspect the fold, shadows, content identity and margins before considering the effect ready for owner review.

## 9. Performance, lifecycle and operational rules

This phase adds animation and custom control UI to an app with known cadence limitations. Do not hide those limitations or reopen an unlimited performance-research loop.

- Profile the relevant new paths under matched conditions and the real expanded catalogue.
- Avoid per-frame full-page reactive updates, independent competing clocks, repeated geometry reads and persistent polling after controls unmount.
- Use direct DOM/native player state and bounded local presentation updates where appropriate; preserve the prior lifecycle and AutoAnimate fix.
- AutoAnimate remains confined to justified lists, not paper physics, active drag, video clocks or simultaneous page transitions.
- Keep only the necessary current/adjacent media state; never restore the old node/listener growth.
- Reuse all six Clips and existing programmes. This is not another video generation/presenter task.
- Compare final performance with the starting build on the same machine/configuration. Keep the original 7 ms/11.2 ms/100 ms thresholds unchanged and report failure if still exceeded. Do not normalize the empty-page cadence away or claim historical passes are current.

Use `scripts/stability-env.ps1` and current owned supervisor/build commands after checking the workspace. Build completely before restarting and before browser tests. Do not test against half-replaced output or start duplicate dev servers. Scope temporary files to existing verified workspace locations; do not delete unrelated files.

Prefer no new dependency except a narrowly justified page-turn engine. Record any dependency/lock/license/audit change; do not disable security gates or conceal notices.

Native Figma work is welcome only with a real write-capable bridge. If disconnected, implement and inspect in the browser and update handoff/state specs; mark native changes pending instead of blocking the run or claiming screenshots are Figma components.

## 10. Connected verification and completion

Work in this order: shared gutter and Home shell; format navigation; media controls and centered Clips; hierarchical interest tiles; paper-turn quality; integrated verification. Develop the paper prototype earlier if needed, but validate it against final shared geometry.

Use the existing relevant suites and add scoped coverage with real clicks, typing, keyboard, pointer/touch sequences and media events. Do not replace physical interaction tests with programmatic prop changes or weaken tests simply because visible button labels became accessible icon labels.

### Required journeys

1. Home unfiltered → category → query within category → page two → article → Back → clear query → clear category. Same newspaper shell, correct full-set results, right URL/history, balanced resting gutters.
2. Direct filtered URL and no-JavaScript GET query → valid results/pagination. Slow response, failed request, empty result, expired edition and rapid alternating filters do not mislabel content.
3. Radio plays → Home category/search/page turn → audio continues through the same root element. Knobs, queue and preferences remain functional.
4. Newsroom custom play/seek/captions/settings/fullscreen → Clips deliberate play → Radio deliberate play. Correct single sound owner, real icons/states, no duplicate native bar, no hidden focus or double action.
5. Clips default and following → scroll to next → open Sources → close → seek → save → full story → Back paused. Picture stays centered in normal browsing, existing captions/sources remain available, six finite clips retain their IDs/durations.
6. New local test member confirms sign-in → browses nested categories without following them → selects colored tiles → saves → edits in Preferences → reload/API restart. Accurate durable selection, descendant semantics and no accidental parent/league follow.
7. Interest broad follow, specific team scope, covered descendant, mute conflict, zero selections, Skip, save error and stale-version conflict. Draft and saved states remain distinguishable; no mutation of owner data.
8. Next/Previous paper turn while Radio is running, then cancellation/resize/query change. Correct page contents, no duplicated players, no abandoned folded layer and no permanent text/margin damage.

### Matrix and evidence

Cover 320/390/834/1440/1920 widths as appropriate, short/tall desktop viewports for portrait fitting, Light/Dark, reduced motion, 200% text/zoom, keyboard and emulated touch. Use already compatible installed engines; state unrun physical-device/screen-reader checks. Check touch versus scrolling, overlays near viewport edges, safe areas and actual icon/focus contrast over moving footage.

Run the relevant member/interest/privacy/source/media/reader tests, lint, typecheck, unit tests, build and worker checks. Verify final lifecycle over repeated mixed journeys and preserve meaningful catalogue sizes. Record failed candidates and remaining cadence failures without relabeling them.

### Deliverables

Update the current project status, component inventory and design handoff. Record these as owner-requested corrections, not blanket approval of new visuals or all work packages.

Provide:

- Cause and actual repair of the left text gutter, with before/after page-context measurements/captures.
- Home/category/search side-by-side captures demonstrating the same shell.
- Newsroom, Radio and Clips player-control captures showing real operating states.
- Desktop/mobile Clips centerline and short-window evidence.
- A hierarchical interest-selection recording and persisted-state check.
- A real normal-speed paper-turn recording plus intermediate frames.
- Verified routes/commands, changed components, test results and explicit remaining limitations.

Keep playback tests, sampled visual inspection, performance measurement, subjective listening and owner acceptance separate. Do not mark the UI accepted merely because tests pass. Leave the correct supervised demo running when safe and report the final built version. Do not return only another plan, component gallery, isolated animation video or installation report.

## Reference register — inspect selectively, not a shopping list

These references establish capabilities/patterns, not proof of the current application's appearance or visual quality. Check the relevant current documentation in the actual implementation environment.

- YouTube player keyboard behavior: https://support.google.com/youtube/answer/7631406?hl=en
- YouTube Shorts first-party interaction notes: https://blog.youtube/news-and-events/youtube-shorts-experience-updates-features/
- MDN shared/native media APIs and custom-player guidance: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Video_and_audio_APIs
- MDN progressive custom controls/transcripts: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia
- MDN play promise and rejected playback: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
- WAI checkbox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
- Nuxt route-aware links: https://nuxt.com/docs/4.x/api/components/nuxt-link
- StPageFlip repository/source to evaluate: https://github.com/Nodlik/StPageFlip
- StPageFlip feature/settings documentation: https://nodlik.github.io/StPageFlip/

The preparation research could not retrieve TikTok's accessibility page or Instagram's help page reliably; do not report those as inspected live layouts. The layouts and dimensions prescribed above are proposed Aggregator design decisions, not an assertion that every platform currently uses exactly those controls.
