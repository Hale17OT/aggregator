# Targeted independent web reflow review

Date:16October2026. Reviewer:web_review. Scope: current `apps/web/app/components/BroadcastVideoPlayer.vue`, `scripts/check-targeted-reflow.mjs`, raw before/after results and all12 actual `reflow-after-2` full-viewport captures. No browser/build/device/service action or product edit by reviewer. Branding is outside this reflow verdict.

## Identity and evidence

Current BroadcastVideoPlayer.vue SHA256 independently checked: `D00DDFC029828C2D146CFC86601BD58E6BFC45A773ED0F16C7CA850FA50B6E84`, matching `output/targeted-closeout-20261016/evidence/reflow-after-2/results.json` (14:21:11Z). Baseline source hash recorded there separately is `8f469253ff5a30c9402b0192b6e5c5a842f62d816249d873fbba3b38d3eb5fbe` in `reflow-before/results.json`.

Independently opened baseline320light stress screenshot and all12 after screenshots across320/360/390, light/dark, scale1/2. These are full viewport captures of a deliberately scrolled, open-settings player, not complete document screenshots or closed-settings player states.

## Verified scope

Baseline320 normal reports document scrollWidth367, and baseline enlarged settings visibly extend off the right edge. After raw results report document width equal to viewport and no right-edge offenders in all12cases. Images corroborate settings and controls now wrapping within the paper margins. At normal scale the speed selector, chapter controls, native-controls switch and fullscreen icon are visibly available within the player layout; captions remain readable below it in the visible cases. Dark and light fields are visually distinct and text remains legible in inspected frames.

Source repair is appropriately local: media-bar wraps; opened settings take a full flex row with min-width0/max-width100%; tooltip text wraps; at≤540px controls enter document flow under the16:9video instead of overlapping it, and44px minimum key targets replace the previous36px override. Fullscreen has a separate absolute-controls override. Resize listener is removed at unmount, and track cue extraction supports the below-video mobile caption without creating another media element. Existing ownership/play/seek/retry methods remain in the same component.

**Scoped verdict: horizontal reflow defect is repaired for the tested open-settings states.** This is not complete media/accessibility acceptance.

## Important limitations and follow-up

1. The script's `scale:2` is **targeted nested CSS stress**, not real browser200%text enlargement. It assigns `font-size:200%` individually to buttons, summaries, labels and spans. Nested descendants compound relative sizes, explaining the enormous time text in screenshots. Retain the stress results, but label them accurately; they do not replace actual browser text zoom or WCAG resize-text verification.
2. Stress screenshots cut off lower controls vertically because document scrolling is required. That is not horizontal clipping, but the script does not operate those controls after scrolling, inspect focus order or verify all keyboard targets remain reachable. No such operation is claimed here.
3. Source-derived regression risk: `.central-play` remains `position:absolute;top:42%` within `.broadcast-picture`, whose mobile height now includes the flow controls and expanded settings. The centre affordance can therefore be displaced from the actual video or covered by later controls. In supplied open-settings screenshots it is not visibly over the picture; normal row Play remains available. Check closed/open settings at initial position0 and either anchor central Play to the actual image bounds or intentionally omit redundant central Play in this layout. This is a concrete geometry concern; no live pointer reproduction by reviewer.
4. The geometry test flags right edges/document width only, not left clipping, overlap, occluded hit areas, tooltip focus, fullscreen layout or caption/timeline interaction. At541–600px the caption policy and flow-layout breakpoint differ; current evidence stops390px and cannot establish that band. No defect is asserted there without observation.
5. No normal-speed playback, audio/listening, screen-reader, physical-device, native or final release acceptance follows from this source/image review. Existing failed performance gates remain separate.

No broad redesign recommended. Preserve the targeted fix and resolve/verify the initial central-affordance geometry plus accurately named text-enlargement coverage.

## Follow-up source review — image-only anchoring repair

Read the subsequent `.broadcast-screen` change and `scripts/check-targeted-newsroom.mjs` without running browser/build work. Video, central Play and failure overlay now share a dedicated position-relative16:9 screen; controls are its sibling. This removes the identified dependency of central Play position on the expanded controls height. At mobile widths screen height becomes auto; fullscreen's more-specific screen rule retains100%height. No second media element or ownership engine was introduced. **Source concern addressed structurally; actual rebuilt geometry verification pending.**

Harness now snapshots every selected element's computed font size before assigning doubled pixel sizes, avoiding the previous nested relative compounding. It accurately labels this as measured CSS doubling rather than OS/browser zoom. Planned dimensions cover320/360/390×568/900, both themes; long native-controls label, programmatic focus and actual FullscreenAPI entry/exit add useful evidence once run.

Before execution, reviewer recommended correcting the anchor oracle: comparing raw viewport y before/after clicking settings can falsely fail if Playwright auto-scrolls the page. Compare Play centre relative to `.broadcast-screen` bounds, verify image containment and actual hit reachability. The focus loop uses `.focus()`, so it establishes programmatic focus/scroll reachability rather than keyboard Tab order. Its width≥24 assertion is not a44px button-target check; retain precise coverage language or add target-specific44px checks. Current screenshot after scroll does not by itself establish every control's unoccluded hit area.

No pass for these unrun checks is claimed and no product/harness files were edited by reviewer.

## Rebuilt anchored player — independent final evidence review

Independently read `output/targeted-closeout-20261016/evidence/newsroom-extra-1/results.json` and the executed harness source. All12 width/height/theme entries were written after the corresponding assertions, plus actual FullscreenAPI entry/exit. Opened representative actual full-viewport PNGs320×568light,320×900dark,360×568dark,390×900light. Current component SHA256: `0F59F3470E7ABB35015196A6C9A0B0CE856BFABC22F38C2A5176A98834427A2C`.

The tall captures now visibly place central Play over the video while settings remain expanded below, corroborating the corrected image-relative coordinate assertion. The ordinary22px time text doubled from its original11px, rather than the prior compounded oversized result. Long-label stress wraps within the settings region and subsequent chapter/native-controls/fullscreen controls remain present. Short captures are deliberately scrolled to the controls; absence of the picture in those frames is not player cropping. No new visible clipping/overlap blocker was found in the representative inspected output.

The fixture replaces the *first* settings button text (the previous-story MediaKey), so the long native-controls wording above another actual native-controls switch is a synthetic stress state, not shipped duplicated copy. Do not present that screenshot as ordinary product copy. Exact doubled computed font sizes and programmatic focus/scroll coverage are correctly labelled; they remain distinct from browser/OS zoom, complete Tab-order and screen-reader audit. Actual fullscreen entry/exit is asserted, but fullscreen visual/control interaction was not independently inspected in these PNGs.

**Scoped final verdict:** the reported horizontal settings overflow and central-affordance displacement are repaired in inspected source, geometry evidence and actual representative captures. Remaining coverage limitations are not new reproduced blockers. This review ran no browser/build/device actions and does not claim audio, native, broad regression or owner acceptance results.

## Final unchanged web candidate — bounded visual/accessibility-state sweep

Read current run-root `evidence/web-after/states.json`, `evidence/reflow-after-3/results.json` and previously reviewed `evidence/newsroom-extra-1/results.json`. Rehashed current BroadcastVideoPlayer.vue unchanged at `0F59F3470E7ABB35015196A6C9A0B0CE856BFABC22F38C2A5176A98834427A2C`, matching reflow-after-3 recorded sourceHash. All12 latest reflow entries have document width equal to viewport and no listed right-edge offenders; the exact measured-doubling/programmatic-focus/fullscreen coverage is recorded separately in newsroom-extra-1, not confused with the old nested stress script.

Opened actual final `web-after/1280x640-playing.png`, `390x844-paused.png`, `390x844-sources.png`, `reflow-after-3/320-dark-1.png` and `390-light-2.png`. Clips preserves the complete centered source picture, distinct four-action rail and separate item arrows. Playing short-desktop caption is clear of metadata and controls; paused phone has a single central Play plus the retained edge alternative. Sources sheet is readable and bounded, with its remaining content requiring normal sheet scrolling. The latest Newsroom normal and nested-stress frames keep central Play over the actual image and the settings within page width. No new visible blocker found in this bounded final inspection.

Raw Clips states record paused:false and currentTime about1.53–1.56s at all three captured widths, consistent with actual advancing playback during capture. Reviewer only read these results and inspected stills; this is not normal-speed watching, subjective listening, actual Tab operation or TalkBack. The mobile video's element box can include matte; its480px element height at390 is not a claim that258px-wide9:16source pixels were stretched. Prior tiny embedded-text limitation at short/compact sizes remains, as do pending owner/physical/screen-reader gates. Source/artifact consistency here is the component hash and capture provenance, not an independent reconstruction of the entire served build.

No browser, build, service, native-device or product changes were made during this review.

## Final native main4f688 — bounded still/accessibility-state inspection

Independently hashed `output/targeted-closeout-20261016/evidence/native-after/installed-main.apk` to `4F68806FB50F0A760EE4488D560B124DACC2CAEAE25CBF417B091413E009FF78`, matching installed-identity.json. Integrator states final Android change is ASCII launcher-label repair with tested Dart unchanged; this review verifies installed file identity and actual frames, not an independent full build reconstruction.

Opened requested full PNGs: tall-playing, picture-paused, sources, share-return-paused, compact-2x-more, compact-2x-transcript and landscape-paused. Tall source picture and caption/metadata remain distinct, pause affordance tracks the represented state, sources remain numbered/readable, and share feedback explicitly disclaims delivery. The2×More sheet scrolls from the enlarged title to caption/speed/copy/Previous/Next/Transcript region without the former horizontal stripe. Its initial title consumes most sheet height; actual screenshot progression establishes movement within the sheet, not that every transcript paragraph was read. Landscape retains the documented small central picture and separately scrollable caption; this is preserved behavior, not a newly proposed redesign.

Opened actual-network-failure, recovered-paused, recovered-playing and recovered-playing-later under native-retry-after. Failure shows explicit unavailable state and Retry. Recovery is first paused, then shows Pause and visibly advanced progress in the later frame. Read identity.json: only owned emulator API loopback forwarding was deliberately removed/restored, not a production/source failure. Load log records attempt3 caption-load-parse failed and retirement, attempt4 caption/video ready, followed by attempt3 late video completion correctly marked obsolete. This corroborates the reproduced recovery path and stale-attempt handling; it does not diagnose the separate historical unexplained incident or prove subjective sound.

**Concrete residual accessibility concern:** in actual-network-failure.png the Retry label is dark green on the near-black Clips background and the unavailable icon is black, materially less legible than the light error message. Contrast ratio was not measured here, so this is a visual contrast concern rather than a claimed numeric WCAG failure. Reported to integrator; do not claim all error-state contrast verified. Other inspected final states show no new clipping/overlap blocker. Existing tiny-picture/large-text reading limitations remain explicit.

This was read-only file/hash/log and still inspection: no browser, device, build, service or product action; no normal-speed video viewing, listening, TalkBack, physical-device or owner approval. Static recovery frames plus logs are narrower evidence than a reviewer-operated full journey.

## Final native r2 contrast repair — bounded unchanged still/source sweep

Independently hashed `evidence/native-after-r2/installed-main.apk`: `ED68CEB0F00CBDDB5E33A8983AAAC6D1141567B8E276DBA1FE2E370BE0EAA8E1`, matching its installed-identity.json. Read current FailureView foreground handling and explicit white foreground supplied by Clips catalogue/programme failure paths. Icon, message, Retry foreground and border now receive the intended contrasting foreground, while other consumers retain inherited defaults.

Opened actual `native-retry-after-r2/actual-network-failure.png`, recovered-paused, recovered-playing, recovered-playing-later, and native-after-r2 compact-2x-transcript. The previously dark failure icon and Retry label/border are now clearly light against the near-black canvas. **The concrete visual failure-state contrast concern is closed for this actual r2 capture.** No numeric whole-app WCAG certification is inferred. Recovery remains initially paused with a central Play, then presents Pause and progressed timeline in later stills. Existing controls/source picture/caption layout is preserved. Enlarged-text More retains wrapped Previous/Next and transcript region without a new horizontal overflow stripe; its scroll/readability limits remain those already documented.

No new concrete visible defect was found in the inspected r2 states. Prior4f candidate and contrast finding remain historical evidence rather than being erased. Integrator's59test/analyzer results are separate automated evidence; this reviewer did not rerun them. This review used only source/hash/log reads and still images, with no browser/device/build activity and no normal-speed motion, listening, TalkBack, physical-device or owner-acceptance claim.
