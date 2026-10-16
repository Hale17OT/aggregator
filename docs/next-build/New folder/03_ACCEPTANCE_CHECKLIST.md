# Short-form correction — acceptance checklist

48 additive criteria. Every initial result is **NOT RUN**. This file is a proposed verification checklist, not evidence that the application has changed.

## Reference and baseline

- [ ] **SF01** Actual built web and normal main-APK baseline captures exist; a status report is not substituted for visuals.
  Evidence: Full-viewport playing, paused and short-height captures, source/APK identities.

- [ ] **SF02** TikTok, Shorts and Reels desktop/phone comparison identifies source date, entry state and observation limitations.
  Evidence: Reference/gap matrix; no false authenticated-live or device-inspection claims.

- [ ] **SF03** Prior stable APK, 23 renditions and 93 original assets are preserved.
  Evidence: Before/after hashes and separately named new artifact.

- [ ] **SF04** Current migration 0012, accounts, member data and retained services are reused without reset or duplicated supervisor.
  Evidence: Read-only preservation evidence and actual process/target checks.

## Desktop composition

- [ ] **SF05** The actual portrait is centred on the declared viewing canvas within 2 CSS pixels with no detail panel open.
  Evidence: Computed picture/canvas bounds at normal and short-height widths.

- [ ] **SF06** The video and four primary actions fit a 1280×640 viewport without a scrolling controls column.
  Evidence: Complete viewport screenshot; current item remains usable.

- [ ] **SF07** The default viewer has no large page-heading stack, permanent settings form or repeated metadata under the picture.
  Evidence: Reference/implementation comparison at rest.

- [ ] **SF08** The right item rail and separate previous/next clip navigation are visually and semantically distinct from seeking.
  Evidence: Screenshot plus actual pointer and keyboard navigation.

- [ ] **SF09** Opening/closing details preserves the media instance, eligible clip and position.
  Evidence: Controller/element identity and paused return assertion.

- [ ] **SF10** Portrait aspect ratio, original frame context and existing source text remain intact.
  Evidence: All six clips sampled at opening, middle and ending.

## Phone composition

- [ ] **SF11** Mobile web and Flutter use an immersive Clips-specific shell rather than the full newspaper masthead.
  Evidence: Full-screen captures of both actual implementations.

- [ ] **SF12** Safe areas, fixed bottom destinations and compact top controls do not squeeze video into a thumbnail.
  Evidence: Actual insets, compact/tall/landscape cases and screenshots.

- [ ] **SF13** Picture fit preserves 9:16 content without stretching or unjustified cropping.
  Evidence: Frame/bounds comparison and caption/source inspection.

- [ ] **SF14** The rail uses coherent original glyphs with optical centring and adequate nonoverlapping targets.
  Evidence: Native semantics/widget bounds and web DOM/hit tests.

- [ ] **SF15** Item title remains concise; expansion opens readable details rather than changing page height continuously.
  Evidence: Long-title case and sheet journey.

- [ ] **SF16** Captions stay legible and clear of metadata, navigation, rail and critical burned-in graphics.
  Evidence: Caption-on moving-frame samples for all six clips and enlarged text.

- [ ] **SF17** Light/dark routes and system text enlargement retain usable controls and readable information.
  Evidence: Both themes, 2×text, 320px web reflow and actual emulator cases.

## Interaction contract

- [ ] **SF18** Unobstructed tap toggles play/pause once; the playing state has no oversized permanent centre icon.
  Evidence: Actual tap sequences with advancing/paused player state.

- [ ] **SF19** A vertical swipe does not also pause, save or trigger a stale click.
  Evidence: Swipe/cancel/rapid-reversal pointer traces and native integration cases.

- [ ] **SF20** Scrubbing reserves its gesture, previews time and preserves prior play/pause intent after one committed seek.
  Evidence: Real scrub start/move/end/cancel cases.

- [ ] **SF21** Manual pause survives observer updates, sheet closure, save, theme changes and relevant rebuilds.
  Evidence: State-transition assertions in both clients.

- [ ] **SF22** Mute is a distinct explicit control and reflects actual supported media state.
  Evidence: Native/web state assertions; no subjective loudness claim from source capture.

- [ ] **SF23** A rejected first Play remains usable and never shows fake playback advancement.
  Evidence: Injected browser rejection and unavailable/error state.

- [ ] **SF24** Save persists real article bookmark state; failed or stale responses do not invent success.
  Evidence: API readback, double action and failure/logout cases.

- [ ] **SF25** Share cancellation, successful share handoff and clipboard fallback are distinguished.
  Evidence: Platform event evidence; no claim of recipient delivery.

- [ ] **SF26** Read story and Back restore the same eligible clip and position paused.
  Evidence: Actual cross-format URL/navigation journey.

- [ ] **SF27** The finite feed ends honestly with replay/next/end controls only where applicable.
  Evidence: Last-item, empty-filter and unavailable-item tests.

- [ ] **SF28** Menus contain only supported actions with true current values.
  Evidence: Capability/control inventory; no fake social counts, quality choices or downloads.

## Accessibility and focus

- [ ] **SF29** Every icon has the correct accessible name/state and keyboard/platform activation.
  Evidence: Semantics/accessibility tree plus actual operations.

- [ ] **SF30** Next/previous, pause, seek, mute and source inspection have non-swipe alternatives.
  Evidence: Keyboard and accessibility-action tests.

- [ ] **SF31** Modal/sheet focus, Escape/Back, outside interaction and scrolling do not operate the underlying feed.
  Evidence: Nested popup/sheet/gesture test sequence.

- [ ] **SF32** Captions are not removed when incidental UI chrome hides; progress is not announced every frame.
  Evidence: Caption visibility and announcement inspection.

- [ ] **SF33** Reduced motion preserves navigation and information without compulsory decorative animation.
  Evidence: Reduced-motion recording and functional checks.

- [ ] **SF34** Public Clip detail, sources and original links remain usable without sign-in; web has its existing SSR/no-JS fallback.
  Evidence: Anonymous and no-JavaScript actual route checks.

## Media ownership and preservation

- [ ] **SF35** Entering Clips alone does not unexpectedly interrupt existing Radio; deliberately playing transfers ownership.
  Evidence: Radio → Clips entry/play/native notification state.

- [ ] **SF36** Radio, Clips and Newsroom never emit competing soundtracks.
  Evidence: Actual active-owner counts and mixed playback journey.

- [ ] **SF37** Background/return and system-share/dialog transitions preserve documented paused intent.
  Evidence: Actual platform lifecycle evidence; unavailable physical tests labelled.

- [ ] **SF38** Rapid swipes and 20 route/20 item transitions do not accumulate controllers, audio owners or callbacks.
  Evidence: Settled lifecycle counts and error paths.

- [ ] **SF39** Newsroom retains conventional long-form controls, captions, preferences and exact unavailable recordings.
  Evidence: Long-form regression journey, not a Shorts-style replacement.

- [ ] **SF40** Radio retains tactile working knobs and accessibility alternatives while transport uses appropriate symbols.
  Evidence: Actual direct-knob and keyboard/step-control regressions.

## Performance and delivery

- [ ] **SF41** Changed paths are measured under comparable conditions, separately from recording and instrumentation.
  Evidence: Baseline/candidate fingerprints, profile and workload metadata.

- [ ] **SF42** The existing web callback, CPU4 and native raster failures are not silently relabelled or normalised away.
  Evidence: Current result matrix preserving failed and not-run states.

- [ ] **SF43** Actual new regressions are fixed or explicitly left open; source 30fps is not confused with interface frame timing.
  Evidence: Issue/cause/fix table and retained failed attempts.

- [ ] **SF44** Existing reader/member/auth/media eligibility regressions pass where rerun, with scope and build identity reported.
  Evidence: Current logs, dates and source hashes.

- [ ] **SF45** Critical mixed journeys run three fresh repetitions and final review runs twice on the unchanged candidate.
  Evidence: Evidence paths with exact test-entry/main-entry distinction.

- [ ] **SF46** A new main-entry local-demo APK is preserved separately, installed without clearing data and actually inspected.
  Evidence: New SHA256, successful install/launch, installed identity and normal-app captures.

- [ ] **SF47** Visual evidence shows complete viewport and real normal-speed interactions, not an edited showcase or only video crops.
  Evidence: Desktop and native uncut recordings plus full captures.

- [ ] **SF48** Owner, physical-device, TalkBack, listening, Figma, iOS and production gates remain truthful and separate.
  Evidence: Final acceptance state and one concise remaining-actions packet.
