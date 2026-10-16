# The Aggregator — Radio and broadcast presentation rebuild

13 October 2026 · Corrective creative/implementation brief

## Paste this brief into the current Codex session, or ask Codex to read this file

Continue The Aggregator from the 13 October morning integration checkpoint. The owner has reviewed the experience and rejected the current Radio visual quality and the weak Newsroom animation. Passing functional tests did not satisfy these creative requirements.

THIS TASK SUPERSEDES THE PROPOSED NEXT STAFF/MFA INCREMENT. Work on Radio art direction and Newsroom broadcast presentation now. Do not restart the project, rebuild authentication, reset the retained database, or spend this increment creating more unrelated infrastructure.

The target is two convincing product experiences: a beautifully crafted physical-radio interface and a directed audiovisual news programme. Adding a shadow to the Radio or another mouth pose to the existing presenters does not meet this brief. Neither does wrapping the current weak animation in an MP4.

## 1. Inspect and preserve the working system

Read AGENTS.md, the current execution plan and acceptance results, the Radio/Newsroom contracts, playback controller, current stage, programme manifests, caption/lip-sync pipeline, asset-eligibility boundary, member preferences, and supervisor instructions. Resolve actual paths rather than assuming component names.

Use the current morning report as the starting checkpoint. Verify current state instead of repeating completed work or relying on older five-migration/memory-only status summaries.

Preserve the newspaper masthead, Home/Article composition, accepted general button system, sign-in, saved stories, queue, progress, preference ownership, and complete sources. Radio-specific hardware controls may have their own physical construction but should retain shared semantics and focus treatment. Do not redesign unrelated buttons.

The retained demo is already supervised. Inspect its health and process ownership. Do not start duplicate Nuxt/API/PostgreSQL/Mailpit services. Use supported restart commands for owned processes when rebuilding. Never reset or reseed retained members. Keep test databases separate.

Continue using local fictional reporting and permitted original assets. No paid calls, real-news ingestion, external email, remote push, commit, production access, or public publication is authorized. Keep audit gates enabled. Reuse reviewed local tools before adding dependencies. Do not undertake a new broad dependency-remediation project instead of the requested creative work.

## 2. Study the actual visual reference before changing Radio

Primary reference:
https://www.dqnamo.com/experiments/cassette-player

Supporting references:
https://www.dqnamo.com/kitchen
https://www.dqnamo.com/experiments/tactile-button

Open the cassette reference in an interactive browser where supported. Observe its still composition and playback, press, seek and responsive states. Capture permitted reference views for local comparison and write a short material/interaction breakdown. Do not describe an interaction as inspected when it was not accessible. Do not copy source code or branded assets without a verified applicable permission.

Carry over the level of physical craftsmanship and relationship between mechanism and playback, NOT the cassette shape or reels. Our object is a radio. The reference is the quality benchmark, not merely a source of a beige color or a rounded rectangle.

Use the project's existing motion/design skills selectively to critique the result. Do not let a skill switch the frontend from Vue or invent an unapproved service.

## 3. Radio art direction: an actual designed object

Create a premium compact tabletop radio, sitting convincingly on the publication's warm-paper surface. The radio should be the page's clear focal point; queue, edition details, transcript, and source list support it rather than surround it with equally prominent dashboard cards.

Proposed composition, refined against real content:
- A horizontally proportioned cabinet, approximately 680–820 CSS px wide on desktop, with a substantial but not oversized height around 340–430 px.
- Deep-forest enamel or painted-metal outer shell with a visible side/base thickness. Warm cream front-panel inserts and restrained amber display illumination. Use existing theme tokens as the foundation.
- A speaker section occupying roughly the left two-fifths: designed perforations or a fine fabric/mesh texture, a recessed dark backing, a subtle frame, and plausible surface depth.
- A right-hand display/controls section: inset smoked-glass display, current edition/story, readable elapsed/remaining time, and a small programme-position scale.
- A considered lower control rail with a proper rotary volume control, transport keys and selected edition/chapter interaction. Decorative detailing must serve the object, not become a wall of knobs.
- A fine printed product mark, restrained labels, aligned screws/seams only where construction makes sense, and a grounded contact shadow.

LIGHTING AND MATERIALS

Choose one consistent light direction, such as upper-left. Make bevel highlights, inner shadows, glass reflections, knob highlights and the base shadow agree. Use layered CSS/SVG gradients and shadows to convey materials; the project's ban on generic dashboard gradients does not forbid physical shading.

Differentiate enamel, speaker fabric, metal, rubber/knurled control edges and display glass. Avoid huge fuzzy drop shadows, random highlights, clipped bevels, heavy grime, glowing outlines around everything, or oversized cartoon knobs. It should look manufactured, not like a rectangle containing standard form controls.

Keep the radio's identity consistent between light/dark page themes. Recompose surrounding light and control contrast rather than making the hardware disappear or simply inverting a raster image.

MOBILE

Design a compact version with deliberate control rearrangement, not the desktop radio scaled until labels become unreadable. Preserve recognizable cabinet, speaker and display materials. At 320/390 px keep usable targets and readable title/time; move secondary controls outside the hardware footprint where needed. Do not fake usability with a large transparent target overlapping another control.

## 4. Make every physical detail agree with playback

The face is a functional interface, not a rendered picture with invisible click regions.

- Transport keys visibly compress on press and show the actual state; maintain keyboard focus and accessible names.
- Volume has an intelligible rotary affordance with a marker, scale and current value. Support keyboard/range semantics and touch without requiring circular gestures. Do not hijack ordinary page scrolling. Account for platforms where system volume cannot be changed by the page.
- A chapter/edition tuner selects real available content. Do not display fake MHz values, invented stations, signal strength, or a LIVE lamp on a prerecorded programme. A scale can instead indicate chapter or edition position accurately.
- Seeking previews a position while dragging and commits through the existing playback controller. Keep the persistent root audio element; do not create another element or remount the first one on navigation.
- A meter follows actual audio amplitude. Prefer a precomputed RMS/peak envelope bound to the existing audio version and currentTime; a safe existing Web Audio analyser is also acceptable. Do not introduce AudioContext routing that silently breaks background listening. Never use random bars or a looping sine wave as supposed audio analysis.
- Pause/buffering/error make the visible mechanism and status truthful. A meter may settle quickly to rest, but must not imply speech continues through a stall.
- Small display and chapter changes can use carefully timed motion. Do not scroll every label forever or add autoplay tuning sounds, crackle or hiss. Long text must remain inspectable without waiting for a marquee.
- Keep the compact mini-player recognizably related to the radio, not a miniature unusable copy. It still controls the same session.

Retain queue, speed, sleep timer, source inspection and in-app playback continuity. Record a real interaction sequence: start, adjust volume, seek a chapter, pause/resume, leave Radio for an article, return. Compare the finished radio beside the original reference at comparable displayed sizes.

## 5. Rebuild Newsroom as a directed broadcast, not two talking icons

The stage should read as a produced news programme even with browser chrome and playback controls hidden. More floating cards, constant zooms and decorative particles do not achieve this. The calm-motion rule for newspaper reading does not prohibit purposeful presenter performance, camera direction and broadcast graphics inside a user-started programme. Keep the surrounding reader calm without treating the video itself as a static article.

Use an original broadcast set related to our brand: deep-forest/ink architecture, cream desk surface, intentional key/rim lighting, layered background screens, convincing floor/desk depth, and a clear central presentation area. Reserve amber for a limited editorial highlight. No fake breaking-news urgency, red LIVE indicators, stock exchange numbers or newsroom activity that the programme does not contain.

Use a 16:9 authored stage. Surround it with a restrained player and programme metadata; place transcript/source inspection outside the picture and make sources available without completing playback. On a narrow screen keep framing intelligible and provide fullscreen/landscape access without forcing device rotation. Do not shrink dense broadcast graphics to illegible sizes.

Create multiple shot types, all from one coherent set and programme:
1. Establishing wide shot with desk and one/two presenters.
2. Medium shot of the active presenter.
3. Two-presenter handoff/listening shot.
4. Presenter with a story/evidence screen over the shoulder.
5. Full-screen relevant image or clip with credit.
6. Full-screen evidence graphic/document/map with controlled reveal.
7. Return to studio and closing source recap.

Compose the timeline from the story. Camera changes should follow speaker handoffs, a new fact, a clip introduction or a shift to evidence. Do not switch at an arbitrary interval just to achieve a cut count. A still documentary visual can remain still when that helps reading; a presenter shot cannot be a frozen head with only a three-state mouth.

Use brief cuts and restrained transitions, a subtle motivated camera push or reframing, and well-paced lower-thirds. Introduce an anchor/name once when useful; do not repeatedly slam the same label in. Keep source credits and captions away from lower-thirds and controls, with a protected safe area. No perpetual scrolling ticker unless its contents and behavior have a real purpose in this prepared edition.

## 6. Upgrade actual presenter performance

Keep Ada/Eli as original fictional presenters, but substantially redesign/re-rig their artwork where necessary. The target is detailed editorial animation with believable human proportions and performance, not icon-style faces, circles on torsos, bobbleheads, or synthetic photorealism claimed without corresponding assets.

Create layered, articulated figures with intentional face design, clothing, torso/shoulders, neck, head, eyes/eyelids, brows, arms/hands, and speech shapes. Use available permitted original artwork/rigs and approved tools. No likenesses of real anchors or copied network assets. Do not spend the entire task downloading or inventing a large 3D pipeline.

Required performance:
- Map the actual Rhubarb output into distinct A–F mouth shapes and appropriate G/H/X extensions; do not collapse the inventory back into three drawings.
- Preserve time-coded speech/rest distinctions. The silent presenter must not mouth the other's words. Do not apply mouth motion over a clip's separate speaker.
- Add jaw/face coordination, natural blinks and small gaze changes; no repetitive symmetric blink loop shared by both presenters.
- Add limited head turns, posture changes and hand/arm gestures keyed to specific delivery beats. A gesture has anticipation, emphasis and a return; do not wave continuously.
- At handoffs, the outgoing presenter finishes, looks toward the co-anchor where appropriate and listens. The incoming presenter picks up the next turn. No constant mirrored bouncing.
- Use subtly varied performance tied to a deterministic timeline. Seeking must reconstruct the correct performance immediately, not wait for a chain of previous events.

This local brief specifies a polished animated broadcast, not photorealistic humans. A paid talking-avatar renderer is NOT silently authorized. Record photorealism as a separate asset/rendering decision only if it becomes relevant; do not use its absence as an excuse to call the current crude presenters finished.

## 7. Direct the story, sound and media together

Reuse the actual eligible article versions, narration, citations and programme manifests. Preserve solo and duo as genuinely different scripts/performances. Do not implement solo by merely hiding one figure while retaining a two-person soundtrack.

For each segment define which person speaks, the shot, the visual, source references, graphic entrance/exit, gestures and audio treatment. Keep narration natural: pronunciation, sentence ending, pauses, handoffs and voice levels need audible review. Do not regenerate all nine recordings merely because the visual renderer changes. Regenerate only justified turns and invalidate/rebuild affected timing and digests.

The programme should include both an intentional evidence cutaway and a clip handoff. For locally permitted original footage, use narration-over-visual or clip-then-commentary according to the actual prepared treatment. Avoid two competing voices. If speech from the clip already exists in the programme mix, do not play the clip's source audio again.

No invented quotations, reporting, statistics, presenter debate or additional factual claims just to fill a shot. Every graphic remains connected to existing evidence/context labels. An illustration must not become proof through cinematic treatment. Do not make a fictional animation appear to be footage of a real event.

Preserve the existing explicit media-preference fallback. Do not imply a viewer's treatment preference works unless the corresponding rendition was actually produced and verified.

## 8. Produce a real playable video rendition

The goal is not merely a screen recording for the review. Add an actual prepared-video rendition that the Newsroom page can play, with the final visual edit and final audio muxed into one asset. Exporting a static stage as video is not acceptance.

Keep Vue/Nuxt for the application. Prefer a deterministic scene/timeline built from the current Vue/SVG/Canvas assets, rendering frames locally and encoding through an already available reviewed FFmpeg build. Other existing local render tools are acceptable when justified, but do not add React/Remotion, cloud rendering or a new paid dependency to solve this bounded task without approval.

Maintain a pure scene evaluation boundary such as sceneAt(programme, time). Offline frame generation and any interactive preview derive from the same shot/cue decisions. No Date.now-based motion, uncontrolled randomness, timer-dependent entrances or reliance on the previous rendered frame to reach the right state.

Render details:
- Author assets at a 1920×1080 design reference; produce an initial actual 1280×720, 30 fps pilot and complete solo/duo renditions once quality is established.
- A 1080p output is a later/export setting if measured local render cost is reasonable; never label upscaling as increased source detail.
- Benchmark a short representative slice before rendering minutes of footage. Record time, memory, output size and any missing tools. Bound concurrency, temporary disk usage and cleanup.
- Use frame-accurate source-video selection during offline rendering; do not capture an HTML video before seek/decode has completed. Normalize time bases and handle any encoder audio padding correctly.
- Validate duration, video/audio streams, frame rate, seekability and decode using available probing tools. Use compatible locally available encoders and document build/license implications without claiming redistribution clearance.
- Preserve a complete programme through its ending; no black tail, frozen last scene, clipped speech or silent output.

Prepare a 45–60 second quality pilot containing presenter performance, a handoff or solo reframing, a relevant evidence shot and a media transition. Inspect and refine this pilot before generating complete approximately 2.5-minute solo/duo programmes. The pilot is not a substitute for completing those variants.

Store renders as immutable version-bound programme derivatives with checksums, source/rights manifests and caption/transcript assets. Use the existing eligibility-controlled asset serving, including range requests. Do not place protected generated videos into an unrestricted public/static directory or add an unauthenticated generation endpoint.

Eligibility/invalidation must apply to the rendered programme, poster, captions and source map. Keep downloaded-byte limitations truthful. Update generation identities for changed art, timeline, narration or sources; never overwrite an old approved rendition in place.

## 9. Integrate playback without two clocks or double audio

For rendered-video mode, the video's own media timeline is the playback authority and its muxed soundtrack is the audible output. Do not simultaneously run the Radio WAV or independent scene narration underneath it.

Bind transcript, active source, progress and chapter UI to the video timeline. Use requestVideoFrameCallback where available for frame-related UI; handle seeked, ratechange and fallback behavior explicitly. Use currentTime-based state, not wall-clock intervals.

If retaining an interactive-stage preview, label it separately and let its existing audio clock drive that preview. Only one mode owns audio at a time. The shared playback coordinator must pause the competing output when the user starts the other experience; simply opening Newsroom must not unexpectedly start audio or duplicate the Radio.

Honor play/pause, seeking, speed, replay, volume, fullscreen and captions. Reserve stable player geometry while loading. Surface unavailable/failed rendition states and a transcript/audio alternative, not a silently frozen pretend video. Member progress and solo/duo preferences must map to the correct rendition/version. Preserve the existing documented boundary mapping when switching programme format.

Keep a reduced-motion treatment meaningful: disable nonessential radio mechanics/camera choreography where supported, retain captions and clarity, and provide an explicit lower-motion or audio/transcript alternative. A pre-rendered file does not retroactively change its baked-in camera moves because CSS prefers-reduced-motion changed. Do not claim otherwise or quietly replace a chosen video with a poster.

## 10. Figma and quality evidence

Use the existing native Figma file when the actual bridge supports editing. Preserve prior accepted/review pages. Add editable Radio frames and a broadcast storyboard/style-frame sequence, not screenshots masquerading as editable components.

The disconnected bridge must not block local product improvement. In that case produce the real browser radio and rendered video, plus a structured Figma handoff, and leave native Figma status pending. Do not spend this increment repeatedly diagnosing the same unavailable transport.

Validate function AND presentation:
- Compare the new Radio to the cassette reference for material separation, surface detail, lighting, hierarchy, interaction and mobile craftsmanship. Similar effort/detail is the aim, not a copied silhouette.
- Watch the programme from start to finish with sound and inspect representative close-ups, handoffs, evidence shots and clip transitions. If direct listening/vision tools are unavailable, say which qualitative checks remain unperformed; automated duration checks do not establish performance quality.
- Capture actual 20–30 second Radio interaction and 45–60 second Newsroom video excerpts with audio where applicable. Do not use a filmstrip as the sole evidence of animation quality.
- Test both complete solo/duo files, seeking mid-sentence and across clip boundaries, pause/resume, playback rates, loading/failure and programme revision/withdrawal.
- Verify captions, source credit visibility, readable transcript/source access, keyboard focus, touch targets, 320/390/834/1440 layouts, themes and reduced-motion alternatives.
- Repeat relevant reader, member-persistence, playback and eligibility regressions. Keep existing audit failures and genuinely hidden-tab/mobile limits separate and open unless actually verified. Do not promote the unresolved hidden-tab test simply because a redesign passed.

Introduce separate status fields for Functional verification, Visual/motion review, Native Figma, and Remaining limitations. All tests passing does not automatically set Visual/motion review to accepted. The owner will make that decision.

## Execution order and completion

1. Inspect the reference and current Radio/Newsroom implementation; preserve recoverable local originals without making commits.
2. Build the physical Radio face and functional mechanisms; critique it in its actual page context.
3. Create a stronger studio/presenter art direction and a short directed pilot.
4. Inspect and repair weak artwork, gestures, cuts, captions and audio timing before expanding it.
5. Render the full current solo/duo programmes and integrate the prepared-video player.
6. Run the relevant regressions, update docs and return a usable demo.

Do not expand into staff MFA, more ingestion services or another broad runbook during this pass. Do not mark all work packages complete.

Finish with actual local routes, changed components, full programme file locations/durations, playable short review clips, before/after Radio captures, the render command actually run, and an honest explanation of remaining quality/technical limits. State whether the result is animated or photorealistic. Do not claim native edits, listening review, successful encoding or visual acceptance that did not happen.

START NOW: preserve the working foundation, inspect the cassette reference and replace the current Radio presentation. Then build a genuinely directed Newsroom pilot and carry that standard through the complete local programme. Do not return another plan-only response.

---

## Reference notes for the owner and implementation agent

These sources were checked on 13 October 2026. The art direction, dimensions, render settings and review thresholds above are proposed project requirements, not measurements of the present application.

1. Dqnamo cassette player — the referenced component and usage API: https://www.dqnamo.com/experiments/cassette-player
2. Dqnamo Kitchen — describes the cassette as a tactile player with turning reels: https://www.dqnamo.com/kitchen
3. Motion for Vue — Vue-native interaction and animation APIs; retain the existing framework: https://motion.dev/docs/vue
4. Rhubarb — documented six basic mouth shapes and optional G/H/X, plus timestamped output: https://github.com/DanielSWolf/rhubarb-lip-sync
5. FFmpeg formats — image-sequence and media/container workflows: https://ffmpeg.org/ffmpeg-formats.html
6. FFmpeg filters — overlays, transitions, compositing and audiovisual processing: https://ffmpeg.org/ffmpeg-filters.html
7. MDN requestVideoFrameCallback — media-timeline frame metadata, with capability/fallback considerations: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback
8. MDN Web Audio visualizations — audio analyser data rather than fabricated playback meters: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

The current UI and output videos were not supplied for independent visual inspection in the owner's message. This corrective direction responds to the owner's assessment and the capabilities/limitations reported in the morning handoff; it is not an independent certification of that build.
