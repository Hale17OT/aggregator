# The Aggregator — Interactive Radio and Presenter Performance

Prepared 13 October 2026. This is a continuation prompt for the existing Codex workspace, not a new application specification.

## Basis and intended result

The owner's latest feedback is that the Radio/broadcast corrective version is “much better,” but the physical radio knobs need to be directly operable and the reporters need better animation. Preserve the current design as the baseline. The supplied checkpoint reports nine mouth poses, articulated presenters, prepared solo/duo videos, a persistent Radio player, and retained member data. Those are reported implementation facts, not independent verification performed while preparing this prompt.

The next increment must improve three things: direct manipulation of the radio hardware; the presenters' actual performance in the programme; and a reusable, honest video-review workflow. A polished promotional video cannot substitute for changes in the application.

## Repository research that informs the assignment

- **latent-spaces/brag:** an agent skill for short product/launch videos, with storyboarding and a Hyperframes-based full workflow. Use it for the final product demonstration and selected composition ideas, not as a lip-sync engine or replacement for the Newsroom runtime. Its source-inspection workflow may create designed product representations, so a Brag render is not automatically evidence of an interaction in the real browser. [R1–R2]
- **formkit/auto-animate:** applies transitions when immediate DOM children are added, removed, or moved; it has Vue support and reduced-motion handling. Use it for queue/list changes and bounded UI disclosures, not for reporter performance, deterministic broadcast frames, or controlling the dial while it is being dragged. [R3]
- **img2threejs:** a procedural Three.js reconstruction workflow with component hierarchies, reference-based review, and a separate character plugin. It can help with dimensional assets and a carefully scoped rig study. The reviewed character-plugin README explicitly records incomplete input producers for four rig checks. Do not infer a production-ready human-animation pipeline from installation or a bound skeleton. Verify the version actually used and report its real limits. [R4–R5]
- **Direct manipulation:** pointer capture can retain a drag after the pointer leaves the original target. Sliders need meaningful values and keyboard interaction; dragging also needs an equivalent non-drag pointer operation. Preserve the existing native alternatives instead of choosing between a usable control and an attractive one. [R6–R9]
- **Volume:** browser media-volume support has platform limitations. Report programmatic control accurately; do not animate a dial as though a device's loudness changed when it did not. [R10]

These findings came from the linked primary documentation. No repository was installed or executed as part of this document's preparation.

---

# Execute this assignment

Continue The Aggregator from the latest Radio / broadcast corrective checkpoint.

The owner says the result is much better. Preserve that improvement. This is a targeted interaction and presenter-performance pass, not another visual restart.

PRIORITIES, IN ORDER

1. Make the visible radio volume and story knobs themselves work through direct input.
2. Make the existing presenters move and perform more naturally and expressively in the actual Newsroom video.
3. Apply the supplied repositories where they genuinely help and create reusable review outputs.

Keep staff/MFA work paused. Do not return only a plan, a library comparison, or another report that old tests still pass.

## 1. Inspect the actual current implementation

Read AGENTS.md, the latest project status, the Radio/broadcast corrective checkpoint, and the relevant local reference studies and programme contracts. Prefer current repository evidence over older status files.

Inspect the actual versions of:

- RadioReceiver.vue and the shared/root media controller.
- The existing volume, mute, chapter/queue, rate, and sleep implementations.
- packages/broadcast/scene.mjs and related presenter/rig assets.
- BroadcastVideoPlayer.vue, ProgrammeTranscript.vue, and member-progress synchronization.
- The deterministic render script, rights-bound import path, and current render reports.

Resolve paths from the filesystem. Preserve unrelated work and the pre-change output for comparison.

The checkpoint describes rotary indicators and separate ranges. Reproduce the user's complaint by manipulating the visible knob face, not by filling the separate range input. Inspect hit targets, event wiring, decorative overlays, and pointer-event styles before deciding the cause. If a knob already works in one input mode, preserve that behavior and identify the missing or defective modes.

Do not initialize another repository, change frameworks, reset the retained database, duplicate the supervisor, or replace the root audio element. Use the existing owned build/restart commands. The seven-migration/member foundation, mail capture, newspaper presentation, general button system, playback exclusivity, source permissions, captions, and withdrawal controls remain intact.

No paid services, real-source ingestion, external email, remote publication, commits, remote pushes, or production operations are authorized.

## 2. Use the three repositories deliberately

Review the current relevant documentation and implementation before adoption:

https://github.com/latent-spaces/brag
https://github.com/formkit/auto-animate
https://github.com/img2threejs/img2threejs

Also inspect the character plugin only if the planned asset study needs it:
https://github.com/img2threejs/plugin-character

Record what was actually reviewed, including adopted version/commit, dependencies, licenses, and the exact role chosen. Keep tools and skills project-scoped where supported. Inspect commands before execution; do not install an entire global toolchain or change unrelated agent configuration.

Use existing checked tools and local FFmpeg. Review any new tool or dependency against the existing audit/license rules. Public dependencies needed for the authorized local implementation may be downloaded after that review; do not send project assets to a hosted generator or upload the local site.

Maintain a short repository-use record distinguishing: used in product, used in offline generation, used for demonstration, evaluated but not adopted, and blocked. A repository merely being installed is not implementation progress.

## 3. Make the visible volume knob the actual control

Create or refine a reusable, controlled RadioDial component, using the existing Vue architecture and shared media state. Do not create a second volume store that can disagree with the player.

The visible knob needs:

- A real, sufficiently large pointer target on its face/rim.
- A visible grab/active affordance and focus treatment.
- Clockwise/counterclockwise dragging that changes volume continuously.
- A meaningful numerical value, shown as volume percent rather than invented decibels.
- A pointer/needle position derived from the effective shared value.
- Proper disabled/unavailable handling where the platform cannot perform the operation.

Use a bounded visual sweep, starting with approximately 270 degrees. Define the endpoints to fit the current object. Do not allow a jump from maximum to minimum when crossing the angular seam or the dead zone.

Implement and test relative angular movement:

- Pointer down records the current value and initial valid pointer angle; it does not jump the volume to an arbitrary value beneath the pointer.
- Normalize incremental angle differences across the angle discontinuity.
- Ignore the ambiguous center region rather than producing unstable values.
- Clamp the effective value and track the pointer so reversing at an endpoint responds immediately; do not accumulate a large invisible overshoot.
- Capture the active pointer. Handle pointerup, pointercancel, lost capture, window blur, route changes, and unmount without leaving a stuck drag.
- Accept only the intended primary pointer/button; ignore competing touches.
- Scope touch-action handling to the dial surface, never the page. Scrolling and zoom elsewhere must remain normal.

A relative vertical-drag mode may be added only with clear, non-conflicting behavior. Circular dragging is the required direct-manipulation path in this pass. Wheel adjustment is optional; it must not intercept ordinary page scrolling or browser zoom merely because a pointer is nearby.

Volume input must affect the existing audio path immediately, not wait for a spring animation or pointer release. Do not introduce a second AudioContext or apply both media volume and gain multiplication accidentally. Keep actual media events and UI values in sync.

Retain the current mute contract and remembered nonzero volume where applicable. Specify what increasing volume while muted does, apply it consistently, and test it. Do not hide a new power/mute action on an otherwise unexplained click of the dial.

Persist changes through the existing supported preferences mechanism with bounded/debounced writes and a final flush where appropriate. Do not make a database request for every pointermove or broaden guest storage/history consent. Local playback must remain usable if saving the preference fails, with an honest persistence state.

Observe platform restrictions. A writable-looking property or animated number alone does not prove hardware loudness changed. Where programmatic volume control is unavailable, retain supported controls and explain the need for device volume rather than simulating success. Do not add a speculative Web Audio workaround that breaks background playback.

## 4. Make the story selector meaningful and safe

The second knob selects the actual chapters/stories in the current edition. It is not a fake frequency dial.

Use the same reusable input foundation with discrete detents and meaningful labels such as the actual story title and “2 of 4.” Handle zero, one, and many chapters correctly.

During pointer dragging:

- Preview the chapter under selection in the display.
- Mark preview separately from the chapter actually playing.
- Avoid repeatedly seeking/reloading audio at every intermediate detent.
- Commit one seek to the selected chapter on successful pointer release.
- Cancel the preview on pointercancel/Escape or invalidation and restore the actual chapter display.

Keyboard steps and explicit previous/next buttons may commit one chapter per deliberate activation. Do not require an undiscoverable extra Play action just to apply a selection.

Preserve transport state: a paused edition remains paused after selecting another chapter; a playing edition continues after a valid seek. A selection must not enable autoplay that the browser or user has not permitted.

Automatically advancing chapters update the dial when it is not being manipulated. Starting a new edition, changing the queue, withdrawal, or losing eligibility must invalidate incompatible previews. Cancel a drag on an edition change rather than letting it commit an index against a different programme.

Keep chapter selection distinct from ordinary time seeking. Display selected and current values honestly. A failed seek cannot leave the display claiming success indefinitely.

Audit other hardware-looking controls. Any apparent user control must perform its labeled supported operation or be unmistakably passive. The signal/level meter remains an indicator, not an invented control. Do not add a frequency service or unrelated effects to justify the cabinet design.

## 5. Keep accessible alternatives and shared state

Prefer native range semantics integrated with the custom face where practical. Preserve working native fallback controls; do not leave them as the only way the hardware responds.

Provide one coherent accessible value/name for each logical control. Do not nest controls or expose decorative layers as additional sliders. If retaining a visible alternate range, make its relationship clear and keep its value fully synchronized.

Support the appropriate slider keys: arrows for a step, Home/End for endpoints, and documented Page Up/Down larger steps. Define volume step sizes and chapter steps explicitly. Label volume and chapter values meaningfully rather than announcing rotation degrees.

Provide a non-drag pointer alternative, such as accessible minus/plus or previous/next buttons. Keyboard support alone does not meet that need. Reuse existing tactile styles and 44-pixel standalone hit-target conventions where applicable.

Keep focus visible on the object the reader is operating. Reduced motion may remove decorative easing, but it must not prevent a knob from reflecting a changed value. Forced colors and enlarged text must keep controls understandable.

Verify direct touch/pointer behavior separately from keyboard behavior. Report actual device/assistive-technology coverage; emulation is not a physical-device pass.

## 6. Improve reporter performance, not just motion quantity

The current checkpoint already reports nine mouth poses, gestures, handoffs, eight shot types, and muxed solo/duo videos. Do not repeat those tasks as though they were absent.

Keep Ada and Eli recognizable and preserve the improved studio. First inspect actual full-speed playback and identify concrete defects with timestamps: abrupt mouth switches, empty staring, repetitive nods, rigid shoulders, hand motion without intent, unnatural turns, or awkward handoffs. Use only defects actually observed.

Build an additive performance layer with four coordinated tracks:

A. Speech articulation

Reuse the actual speech/mouth cues and silence regions. Refine transitions between poses, jaw opening, lip width/rounding, and closures as the artwork supports. Do not naïvely crossfade whole mouths into two visible lips or smooth away consonant closures.

Blend only compatible geometry/parameters. Preserve articulation during speech and return toward an appropriate resting mouth in silence. Do not replace speech-driven mouth cues with a generic amplitude loop.

B. Attention and expression

Give the active presenter a deliberate camera eyeline, brief purposeful glances, subtle brow changes, and natural nonidentical blinks. On handoff, eyes can lead a small head turn toward the other presenter before attention returns to camera.

Match expression to the script. Do not add cheerful reactions to serious reporting or nodding that implies agreement with a disputed claim. Do not claim to infer emotions reliably from audio alone.

C. Gesture and body mechanics

Author a small vocabulary: introduction, small emphasis, evidence indication, contrast between accounts, handoff, and closing. Give a gesture preparation, a clear stroke, and a recovery—not a repeated arm wave.

Anchor movement to actual measured timing or explicitly authored beats. Use curved wrist paths and plausible elbow/shoulder pivots. Maintain desk/hand contact, correct occlusion, and attachment of sleeves/cuffs. Avoid hands passing through the desk, joint gaps, and whole-body sliding.

Keep torso, head, eyes, jaw, and arms distinct but coordinated. Subtle breathing and posture variation may support the performance; do not give every part the same sine-wave loop.

D. Listening and two-person coordination

The nonspeaking presenter listens with low-amplitude attention changes and a resting mouth. Do not mirror gestures or mouth movements. Preserve differences in the presenters' mannerisms without changing their identities or voices.

Use speaker handoffs and the established screen direction coherently. More camera cuts are not a substitute for better performance; verify at least one sustained medium shot long enough to expose rigid animation.

Keep audio and script unchanged by default so before/after comparison is meaningful. This pass does not authorize altering the reporting, inventing dialogue, or regenerating all voices solely for a demo.

## 7. Use img2threejs as a measured asset/rig study

Use an existing original presenter or radio/studio asset as the reference. Capture an actual current render if a reference image is needed; record its path and provenance. Do not invent an unavailable reference or import a real anchor's likeness.

Produce a small isolated study of the most promising dimensional improvement: for example, a better shoulder/head turn in one presenter, or a modeled radio/studio component with proper pivots and lighting. Identify what problem it addresses before generating it.

For an object study, preserve named parts, independent pivots, consistent materials, and reference-matched proportions. A decorative 3D knob does not replace the functioning DOM input boundary.

For a character study, first verify whether there is a usable image or licensed GLB and which route actually applies. Do not feed an SVG through a GLB-only process or claim a skeleton exists when the input has none.

Check the current character-plugin implementation and its documented incomplete gates. Never turn an unmeasured/error result into PASS. A missing prerequisite blocks that adoption path, not the existing presenter improvements.

Compare the study against the baseline using the same framing, speech, and gesture. Adopt only if the visual result is clearly better and its integration, deformation, performance, and licensing are supportable. Otherwise retain the 2D/2.5D renderer and record the exact result rather than shipping a weaker 3D replacement.

Do not migrate the public reader to Three.js. Prefer the existing offline render path for any adopted 3D programme elements; native DOM controls and the prepared-video player stay in place.

## 8. Preserve deterministic video generation

All presenter, camera, prop, and graphic poses must be reproducible from programme time plus versioned cue data and seed. The same timestamp must produce the same scene after a seek, out-of-order sample, or new render process.

Author a compact performance cue sheet referencing existing speaker/segment IDs, with only useful properties such as gesture, gaze target, intensity, start, peak, and end. Distinguish measured speech timing from authored timing and the existing proportional phrase estimates.

Do not claim word alignment where it is still estimated. Audit important handoffs, pauses, and evidence gestures against the recording rather than treating estimated text positions as precise measurements.

Do not base exported frames on wall-clock timers, frame-to-frame accumulated transforms, uncontrolled randomness, or AutoAnimate's DOM mutation clock. Existing deterministic functions and bounded FFmpeg/browser cleanup remain authoritative.

Create a 45–60-second comparison pilot using the same underlying programme excerpts as the baseline. Include a sustained presenter delivery, a two-anchor handoff/listening moment, and a return from evidence to the studio. Record source ranges and any intentional edit boundaries.

Inspect both full-speed motion and representative frames. Repair failures, then regenerate the full solo and duo programmes. A pilot alone does not finish this pass.

Use new immutable render identities covering the changed scene code, rig/assets, performance cues, settings, and relevant programme inputs. Reuse unchanged speech honestly. Import through the existing eligibility-controlled path; do not overwrite a file under its old content hash.

Maintain the single muxed video as playback-time and sound authority. Keep Radio/video exclusion, transcript seeking, caption behavior, safe resume/revision rules, source maps, and ancillary-asset eligibility checks. Existing baked-video reduced-motion limitations must remain accurately described.

## 9. Apply AutoAnimate only where it helps the product UI

Use the Vue integration on a small set of appropriate existing surfaces: queue insertion/removal/reordering, saved-item state changes, or a bounded details disclosure. Use stable item identity.

Do not animate every sentence, caption change, active chapter, or live progress label. Do not move a focused control or reorder a list beneath the reader just because playback advances.

Exclude the radio dial's moving assembly, video timeline, and presenter rig. Do not let AutoAnimate and another animator compete for the same property. Respect both OS reduced motion and the app's existing reduced-motion preference.

If these surfaces already have equivalent working transitions, refine the existing implementation rather than installing a redundant animator simply to list the repository as used.

## 10. Separate product improvement, raw evidence, and Brag output

After the controls and performance are improved, use the reviewed Brag workflow for a short local product showcase, approximately 20–25 seconds, focused on actual functionality.

Suggested content: direct knob manipulation, a real chapter change, continued Radio playback through navigation, and the improved Newsroom handoff/evidence shot. Use actual product captures or faithfully identified compositions from those captures. Do not fabricate a smoother interaction in the promo than the application delivers.

Keep launch-video typography/transitions out of the newsroom reporting itself. Do not add promotional music under its factual narration or treat montage editing as verification of continuous playback.

Keep Brag/Hyperframes dependencies in an isolated generation workspace. Use only reviewed local rendering and permitted assets, not a hosted upload service or an unapproved paid renderer. Do not let an unavailable showcase tool delay the actual interaction and presenter work.

Deliver raw interaction evidence separately: an uncut recording of the actual dial operations, and same-audio before/after presenter excerpts at normal speed. A source-inspired Brag composition does not prove pointer handling, lip-sync, uninterrupted audio, or member persistence.

Report whether the Brag workflow actually ran. If only its storyboarding principles were used, say so. Do not claim an invocation because the output resembles one.

## 11. Test the operations the owner actually touches

Radio verification must target the visible dial coordinates with real pointer sequences. An input-fill operation on the fallback slider does not establish that the knob works.

Cover:

- Clockwise/counterclockwise movement and actual shared volume updates.
- Pointer down without value jumping; angle seam and endpoint behavior.
- Reversal at both stops, dead-zone crossings, and pointer leaving the face.
- Cancelled capture, unmount/navigation while dragging, and competing pointers.
- Keyboard plus non-drag pointer alternatives and synchronized fallback range.
- Actual player volume/mute state, mini-player reflection, and supported saved settings.
- Chapter preview versus committed seek; cancellation; paused/playing behavior.
- Automatic chapter changes, edition replacement, empty/single chapter lists, and invalidated media.
- 320/390-pixel layouts, desktop, both themes, enlarged text, reduced motion, and forced colors.
- Continued root-player behavior through article navigation; no duplicated audio.

A property assertion establishes state wiring, not subjective loudness. If capturing post-gain audio, document the actual capture path and its limitations; do not use an unchanged source waveform as proof of applied volume. Leave physical-device listening explicitly unverified unless performed.

Broadcast verification must include:

- Same-time deterministic output, including out-of-order evaluation and repeat renders.
- Speaking versus silent mouths, sustained shots, natural gaze and handoff continuity.
- No desk penetration, detached arms, impossible shoulder motion, or visible double mouths.
- Face/hand details at actual playback size, not only a zoomed-in still.
- Seek/rate/caption/source synchronization and stale-revision behavior.
- Full solo/duo playback and endings, no second soundtrack, and existing failure recovery.
- Owned renderer cleanup on failure and bounded resource usage.

Retain member-data and reader regression checks after relevant changes. Do not reset the retained demo to simplify a test. Use disposable fixtures for destructive/withdrawal tests.

Automated checks, subjective motion review, and subjective listening are separate statuses. Do not claim listening quality or owner acceptance from decoding/non-silence tests.

## 12. Deliver the finished increment

Keep the status/handoff updates concise and actionable. Include:

1. The actual cause and fix for each nonworking hardware control, with pointer-based evidence.
2. Verified Radio and Newsroom routes and exact restart/render commands used.
3. An uncut knob interaction recording showing the real value/player response.
4. A same-audio before/after presenter comparison and the complete new solo/duo programmes.
5. The separate Brag showcase if completed, clearly labeled as presentation rather than test evidence.
6. The repository-use record, any bounded 3D study outcome, and dependency/license impact.
7. Tests run, limitations, and remaining owner-review decisions.

Update the existing quality review with relative asset links. Do not reopen the cancelled general-button packaging task or make screenshot packaging a prerequisite for implementing the improvements.

Preserve the currently accepted identity, authentication, member data, and safety gates. Figma may be updated through a real available bridge; if disconnected, leave native work pending and continue the browser/video implementation. Do not create disconnected mockups and call the product fixed.

START NOW: reproduce direct knob operation on the actual page, wire the input to the existing player, and improve a sustained presenter/handoff sample before expanding the verified performance changes to both full programmes.

---

## Primary-source references

Documentation reviewed on 13 October 2026. Recheck the exact revisions and platform behavior in the implementation environment.

- R1 — Brag repository: https://github.com/latent-spaces/brag
- R2 — Brag skill and full workflow: https://github.com/latent-spaces/brag/blob/main/skills/brag/SKILL.md
- R3 — AutoAnimate documentation: https://auto-animate.formkit.com/
- R4 — img2threejs README: https://github.com/img2threejs/img2threejs
- R5 — Character plugin and stated gate limitations: https://github.com/img2threejs/plugin-character
- R6 — Pointer capture: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- R7 — Slider semantics and keyboard guidance: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- R8 — Non-drag alternatives: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- R9 — Native-backed custom slider example: https://www.w3.org/WAI/WCAG21/working-examples/providing-single-point-control-slider/
- R10 — Browser media volume: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
