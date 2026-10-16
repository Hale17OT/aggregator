# Short-form review and repair ledger

16 October 2026. Functional verification, image inspection, motion/listening and owner acceptance are separate.

| Finding | Action and evidence | State |
| --- | --- | --- |
| Old Clips was a video box beneath newspaper chrome | Route-specific web/native canvases, contained centred portrait, four actions and separate item navigation | Implemented; full before/after captures |
| Native caption/title overlap and low-contrast navigation/status icons | Separate caption/metadata regions and scoped system/navigation colours | Initial short caption repaired; longer cue prompted another native repair |
| Long native ending caption exceeded the reserved area | Enlarged normal/enlarged-text caption allocation; retained scrollable text | Requires final image review; not inferred from widget tests |
| Web captions overlapped the taller Read story target | Increased bottom allocation to 180 px and moved captions above metadata | Build 6 captures and explicit bounds assertion pass |
| Web caption layer intercepted phone Next | Reserved side gutters and moved clip navigation clear of caption area | Actual pointer/negative journey rerun passes |
| Native scrub cancellation committed a later Slider callback | Cancellation flag blocks that callback | Original 10-second rollback oracle retained; reviewer test passes |
| Save and history responses could outlive their owner/context | Owner/epoch/slug checks; loading guard; explicit clear separated from ordinary initialization | Unit and three actual web member journeys pass |
| Native Save lacked feedback when article metadata had not loaded | Explicit unavailable/retry message and metadata retry | Implemented in second native candidate |
| Recording script pressed Back before More opened | Added visible settling time; keep failed attempt rather than label its screenshot a menu | Recording rerun required |
| Android graphics counter returned zero Flutter frames | Rejected sentinel percentiles; actual Flutter profile entrypoint used instead | Diagnostic only; no performance gate waived |
| Emulator exited and ADB briefly failed after instrumentation | Relaunched the same project AVD without wiping data; restored scoped forwarding | Failed setup logs retained |
| Web restart requested before an earlier build completed | Owned stack exited; verified free ports and used guarded retained-data startup | Recovered; subsequent restarts wait for completed builds |
| Historical Newsroom test searched inside closed settings | Test now opens the existing settings disclosure | Original failed log retained; no product gate removed |
| Newsroom still overflows at 320 px | Updated regression reaches and fails its original reflow assertion | OPEN; source of long-form player was not changed in this pass |
| Tiny embedded video text on short screens | All original pixels retained; captions, transcript, story and sources provide readable alternatives | LIMITATION; no universal readability claim |
| Native chooser cannot distinguish cancellation from selection | UI says chooser opened and delivery is unverified | OPEN; no recipient-delivery claim |
| Native static subtree still rebuilds with controller notifications | No broad optimization or framework change | OPEN; functional tests are not progress-isolation acceptance |

The older web callback, CPU4 popup and mixed native raster failures remain open. Physical Android, TalkBack, subjective listening, native Figma, iOS and owner approval remain pending. Local video preview was unavailable under tool policy; supplied recordings and sampled frames are not claimed as normal-speed listening/watching.

## Final repair addendum

- Native compact/enlarged captions and landscape were inspected in the actual main APK. Adaptive caption height, side gutters and contained landscape picture repaired overflow and Share interception. Actual caption and transcript scrolling are captured.
- Enlarged More Previous/Next row exposed a 15px RenderFlex overflow. Row changed to Wrap; a dedicated 2× widget test opens and scrolls the sheet. First test failed because the lazy-list target was not built; corrected to scrollUntilVisible, then all39 tests passed. Original failed image/test log retained in candidate4-native and .cache/shortform-unit11.log.
- Web normal phone ending cues were clipped. Build7 enlarged the caption allocation, and54 samples passed full-cue fit. Independent inspection then found the 320px caption covered More. Build8 moves the mobile rail to the upper edge; capture checks now assert all four buttons are unobstructed at every sampled cue, not just inside viewport bounds.
- Recording now waits for actual More/system chooser presentation. New main APK is separately hashed; prior candidates are preserved. Instrumentation, profile and normal main identities are not conflated.
- Matched emulator timings still fail raster budget and vary between runs. Final More-only wrap was applied after the recorded profile candidate; no final-main performance pass is inferred.

Evidence handling correction: a final web capture invocation omitted its phase argument; the script defaulted to before and overwrote this pass's initial web screenshots. The overwritten files were identified and moved to capture-mislabel-final8, not presented as baseline. The packet uses preserved earlier web-closeout baseline captures with explicit labels/different dimensions, alongside fresh final after captures. Native original-APK before captures remain intact. Script now requires an explicit before/after phase. Exact matched initial web playing captures cannot be recovered; this limitation is not a before/after pass.

Final main-capture attempt encountered `Video or required captions unavailable` after the first vertical item change. The visible Retry restored the same second clip and Play control without substitution. Root cause is not established by the available log; do not call it setup-only or silently discard it. Failure image, uncut attempt and .cache/shortform-native-493-final.log are retained. A fresh capture follows; transient load failure remains an explicit limitation despite three passing integration journeys.

## Targeted repair pass — 16 October

Current execution/evidence: `TARGETED_CLOSEOUT.md`, `output/targeted-closeout-20261016/`. Historical OPEN rows above describe the prior493 artifact.

| Finding | Current supported result | State |
| --- | --- | --- |
| Original normal-main load incident | Old recording/log does not distinguish video initialization, caption HTTP/parser or transport; Retry is not causal evidence | NOT REPRODUCED / OPEN |
| Current attempt could outlive item/revision/controller or retire newer ownership | Binding/generation/controller guards, cancellation, joined required-caption/video readiness and ownership epochs; both completion orders and late outcomes tested | FIXED AND VERIFIED in unit/widget and three real targeted journeys |
| Catalogue GET failed before creating a new controller | Actual pre-header connection closure reproduced; one fresh read connection only for precise closure/current identity, no retry for HTTP denial or writes | FIXED AND VERIFIED for separately reproduced failure; not attribution of original incident |
| Protected native member request returned503 | Retained PostgreSQL log records account-row lock timeout; final assisted member run passes, earlier failures retained | INTERMITTENT LIMITATION; no timeout/security-policy change |
| Newsroom320 open-settings overflow | Wrapped real settings/toolbar, bounded tooltip and picture-local Play anchor;12 matched stress plus12 exact enlarged-font/long-label/focus/fullscreen cases | FIXED AND VERIFIED |
| Static Clips content rebuilt on controller progress | Local value slices and stable static subtree;20-tick regression proves isolation | IMPLEMENTED / FUNCTIONALLY VERIFIED; raster result separate |
| Profile cold startup exceeded measurement warm-up | Two failed setup attempts retained; identical diagnostic templates in preserved baseline/current source start warm-up at actual playback | Separate matched playback diagnostic; no threshold relaxation |

The original48 acceptance cases remain in the register. No new rendition, schema, authentication system or publication capability was introduced. Normal-speed watching/listening, physical device, TalkBack, same-device Chrome, Figma, iOS and owner acceptance remain distinct unavailable gates.
