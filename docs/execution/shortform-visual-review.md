# Short-form independent visual challenge

## Candidate 1 — 16 October 2026

Read-only independent inspection of actual full-viewport captures in `output/shortform-rebuild/candidate1/web/` (1280×640 playing/Sources, 1440×900 playing, 390×844 paused/playing/Sources) and `candidate1/native/settled.png` (1080×2424 actual main-entry intermediate). Compared with inspected `before/` captures and the six original-asset opening/middle/ending contact sheets in `output/shortform-rebuild/reference/`. No browser/device/build/product action by reviewer. Candidate is intermediate, not final artifact acceptance; exact build fingerprints remain integrator-owned.

### What visibly improved

The masthead/form stack is removed from Clips. A dark viewing canvas now holds a contained, centered portrait, four adjacent item actions and separate item navigation. On the supplied phone and short desktop frames all four primary actions fit without scrolling a commands column. Source graphics' title/evidence/footer remain in the picture; there is no apparent stretch or source crop in these settled first-clip frames. The web Sources action now presents actual numbered bibliography content in a readable sheet rather than a link panel below the video. Native Sources already had this useful behavior in baseline and should retain it.

### Concrete defects and focused follow-up

| ID | Evidence / defect | Correction or next verification |
|---|---|---|
| SV01 | Desktop1280 and1440 playing: edge play/mute pill overlays embedded publication/topic at picture top-left. | Root reports moving controls outside picture in candidate2. Reinspect actual captures before closure. |
| SV02 | Native settled: two-line caption extends into the metadata identity/title region. | Root reports separating caption/metadata bounds. Test longest six-clip captions plus2×text and short landscape; fixed current sentence alone is insufficient. |
| SV03 | Native settled: inactive bottom destinations and active Clips label are extremely dark against dark background. | Root reports contrast repair. Verify fresh actual main capture, both themes and selected/unselected states. |
| SV04 | Native settled: Android system status time/wifi/battery/cellular are black on the near-black Clips canvas. | Separate from bottom navigation. Use route-scoped light system-overlay icons, restore on exit and verify real status bar in capture. |
| SV05 | Web390paused: Read story is small inline text next to a dense title and time label; actual screenshot does not prove adequate touch target or no hit-target collision. | DOM/hit-test44px target and2×text; consider separate compact actionable line without returning to a dashboard. This is a verification risk, not a measured target failure. |
| SV06 | Both clients paused show a small edge Play and central Play simultaneously. | Retain accessible alternatives, but consider hiding redundant visual edgePlay when centrePlay is present; do not remove non-tap alternatives. Minor hierarchy issue, not an established functional defect. |

No new six-asset source crop is established by these first-clip captures. The inspected original frames show why overlays must remain outside factual content: titles at roughly y28–150, evidence at210–450 and footer543–571 in360×640 samples. Current web phone rail is outside the picture; preserve this when fitting short or2×text layouts. Candidate1 does not provide all-six composed states, so SF10/SF16 cannot be closed from this review.

Sources screenshot shows scrolling content clipped at sheet viewport bottom, which is normal for a scrollable sheet; it is not itself evidence of inaccessible content. Actual scroll, focus containment, Escape/Back, source link behavior and paused restoration still require interaction checks. Static frames do not establish audio ownership, successful Save, sharing, scrub cancellation, lifecycle or normal-speed motion.

### Status

Candidate1 challenged; SV01–SV04 remain open pending fresh repaired output. Final two unchanged-candidate review sweeps have not occurred. Owner acceptance, physical-device, TalkBack, listening, iOS and Figma gates are unchanged. Known callback/raster failures are not reclassified by appearance changes.

## Final web build6 — independent visual/evidence sweep, 16 October 15:54 EAT

Inspected newly written full-viewport `after/web/1280x640-playing.png`, `390x844-playing.png` and `1440x900-sources.png` dated15:54, plus `verification/web/320x568.png`. Integrator identifies served build6 after its final CSS correction (180px vertical reserve and caption bottom118); this report does not infer build identity from a screenshot. No product edit, browser or device operation by reviewer.

SV01 is closed in the inspected fresh desktop image: edge play/mute now sit outside the embedded source header. The build5 caption/title overlap reported by the integrator is closed in the supplied build6 short-desktop and phone playing images: caption, metadata and Read story occupy separate visible rows. Four primary actions remain available and the source picture is contained. The actual web Sources sheet shows numbered original evidence links and transcript, with normal viewport scrolling rather than the former link-only panel.

Raw `verification/web/results.json` contains three successful mixed runs, seek34.6s and empty error arrays. Seven viewport results report centerError0, no horizontal overflow and56×48 primary action targets. These are independent reading of actual test output, not reviewer reruns. Phone video-element bounds include matte when width limits the contained9:16 picture; element aspect ratio alone must not be called source stretching. `verification/member/results.json` has three successful Save/readback/shared Library/unsave/failure-no-success/anonymous-source rounds. `verification/failures/results.json` dated12:53:48Z records rejected play,20item transitions,20route exits, pointer-seek Escape rollback, share cancellation and finite sixth-clip ending checks. No full acceptance-matrix inference follows from these bounded cases.

Remaining visual limitation: at320×568 the complete picture is159.75×284; at1280×640 it is195.75×348. This preserves source graphics but makes embedded body/footer text quite small. The separate captions and story/source reading paths are important, and owner readability review remains necessary. This is materially better contained layout than the old cut-off page, but is not a claim of comfortable original-text reading at every size. The supplied images do not establish2×text, landscape, all-six composed caption states, dynamic browser chrome or screen-reader operation. Original six-asset samples were reviewed separately; unchanged-asset hashes belong to preservation verification, not inferred from visuals.

This is one bounded final web visual/evidence review. The separate security reviewer performs source/artifact review; neither is owner acceptance or normal-speed watching. Native final captures were not yet present when this section was written; SV02–SV04 await their inspection.

## Fresh native final-candidate challenge — 16 October 15:56 EAT

Independently opened `after/native/tall-playing.png`, `sources-return-paused.png` and `more.png` after they appeared. Integrator identifies main964c; no emulator control by reviewer. White status-bar symbols and legible bottom destinations close SV03/SV04 for this actual tall frame. First short caption is now separated from metadata in tall-playing.

**SV02 remains OPEN for longer captions.** In `sources-return-paused.png`, river clip2 at its ending has caption “Read the full story and its complete fictional source bibliography in The Aggregator. These reports describe…” whose third line is cut/covered at the metadata boundary. The filename/state is not sufficient to declare the repaired layout sound. A fixed caption region that fits the first sentence does not protect all six assets' longer cues. Reported immediately to integrator for repair and fresh long-cue verification.

`more.png` visibly shows the same underlying paused river viewer, not an opened More sheet. Do not count it as More-open evidence. This could be a capture/tap issue rather than product failure; only the image fact is established here. No final native visual acceptance is issued. Keep this failed candidate evidence before repair.

## Final native 25939 candidate — visual review 1, 16 October16:12

Independently hashed `output/shortform-rebuild/aggregator-shortform-local-demo.apk`: `25939EA8B28F9F82617200FA2A222344483A3E8D8A3E9DFA4008A7B8021AC806` (219512232bytes). Opened actual `after/native/long-caption-final.png`, `compact-2x.png`, `landscape-paused.png` from16:11. No device/build/browser action by reviewer.

**SV02 repaired for normal tall layout:** the formerly clipped river ending cue is now completely visible across three lines, including the qualification “limited trial, not an established wider result.” Metadata starts below it; the full original source graphic is contained. SV03/SV04 contrast repairs persist. Four rail actions remain distinct from playback and source imagery; no permanent centre symbol is present in prior playing frames.

**Compact accessibility/landscape limitations remain explicit.** At640×1136physical/2×text the picture is approximately138×244physical (about69×122logical atdensity320), making embedded text unreadable; only the first three lines of the large caption are visible at once. Metadata ellipsis hides the visible Read story suffix. Landscape likewise contains a small central portrait and a side caption whose remainder is offscreen within its region. Source confirms `SingleChildScrollView` around captions and a More transcript entry, so this is a deliberate bounded reading fallback, not proof of lost caption data. However a still capture cannot verify scrolling or transcript reachability. Actual caption-scroll/More/transcript and matching-story operation at these sizes are required before claiming accessibility parity; do not call these layouts universally immersive or comfortably readable. All rail icons remain visually present; large-text labels are omitted, making retained semantic names and More discoverability important.

This is a bounded visual review of the actual new main artifact, not all48criteria, normal-speed viewing, TalkBack or owner acceptance. Integrator reports38widget tests; reviewer has not rerun them. Final repeated interaction evidence and second unchanged-artifact review remain pending.

## Second final visual challenge — build6 / native25939, 16 October16:16

Opened all six actual phone ending-cue captures `after/captions/390-{1..6}-0.95.png` and desktop ending captures1280clips1,5,6. Desktop endings show the full qualifying caption in two lines and retain all original graphics. Phone endings all show only approximately two-and-a-half lines, with the third visibly cut at the48px caption-region boundary. Source confirms `overflow:auto`, so text is not deleted; nevertheless the normal390px presentation requires scrolling a transient caption to see the important qualification. `nonoverlap:true` in the raw results does not establish full cue readability. Reported immediately to integrator for a larger normal-phone caption region or explicitly verified accessible scroll/transcript fallback. Retain these images as the failed full-cue-readability attempt; do not call all36 composed captures a visual pass from geometry alone.

This second challenge does not invalidate the independently inspected native tall25939 repair. It also does not close the pending native compact2×/landscape fallback operation. If the web product changes following this finding, final web review identity must advance and the affected caption/mixed checks must be fresh; this section is not relabelled as review of unseen repaired bytes.

## Build7 repair review — 16 October16:25

Opened fresh54-state caption output (results count54), including390clips2/5ending,390clip3middle,1280clip6ending and320clip2ending. The390normal-width long-cue clipping is repaired: full qualifying text is visible without scrolling, separate from metadata. Desktop ending remains readable. Raw final mixed results timestamp16:23:01, member three-round successes and negative checks timestamp13:23:12Z were independently read; no reviewer rerun.

**New compact composition conflict:** in actual `after/captions/320-2-0.95.png`, Save/Sources/Share remain visible but More is absent where the enlarged full-width caption occupies the lower right rail region. This is a possible occlusion, not proven by element bounds alone; integrator immediately notified to perform actual hit/paint-order check. Caption-versus-metadata nonoverlap does not test caption-versus-rail. Do not mark compact four-action access passed until this is resolved or disproved by real interaction. The picture now approximately115×204 at this smallest viewport preserves source context but has very small embedded text; external captions/transcript remain necessary.

Build7 therefore closes normal390cue clipping but is not a blanket compact-layout visual pass. Native More2× Row overflow repair/new artifact is pending and is not reviewed here.

## Frozen web build8 — bounded final visual sweep1, 16 October16:34

Independently inspected fresh `after/captions/320-2-0.95.png`, `390-5-0.95.png`, `1280-6-0.95.png` (caption result set timestamp16:33:03). The compact More occlusion is repaired: all four actions are visible in the upper-right rail above captions. Full ending qualification is visible in normal320/390 captions; desktop remains separate from metadata. The picture is contained and original evidence/title/footer are not covered by controls. Small embedded text at320 remains a readability limitation, not solved by geometric fit.

Read all54 result count and the actual capture-test assertions: `scripts/capture-shortform-captions.mjs` checks full cue `scrollHeight <= clientHeight+1` and `elementFromPoint` for each of four action centres at every capture. This addresses the prior insufficient rectangle-only oracle. Three fresh mixed runs in `verification/web/results.json` dated16:32:17 each pass, seek34.6s, errors empty. Reviewer did not rerun them. Independently hashed current ClipFeed.vue SHA256 `89756F5F357EBC553A480980A58CC3A784E511FA8C9CD8A4DAD9C7926E11EC8A`; full served-build identity remains in integrator manifest.

Scoped verdict: previous observed normal-width caption clipping and compact More occlusion repaired in inspected actual output and strengthened test evidence. This is not owner acceptance, subjective listening,2×web-text or every lifecycle gate.

## Frozen web build8 — separate bounded final visual sweep2

In a subsequent read-only pass, independently opened320clip6ending,390clip1ending and1280clip3middle from the same final54-state set. Qualifying captions remain complete, rail remains unobstructed and next is visibly disabled for sixth/final clip. No new concrete overlap in those states. Rehashed ClipFeed.vue unchanged at `89756F5F357EBC553A480980A58CC3A784E511FA8C9CD8A4DAD9C7926E11EC8A`.

These are two bounded visual/evidence sweeps on frozen build8, not two complete journey reruns. Source frames are preserved but their small text at minimum viewport remains difficult; readable captions and source/transcript/article routes are part of the fallback. Normal-speed recording viewing and subjective listening were not performed by this reviewer. Native new493da1 candidate still requires separate actual repaired-More inspection; no prior native verdict is silently transferred.

## Final native493da1 — bounded visual sweep1, 16 October16:41

Independently hashed delivered APK SHA256 `493DA1C98C960C15E4174CDB889E761EE96A1C864E491A695F48B8FB22E94CE8`; read `after/native/installed-identity.json` with the same installed-main hash. Opened fresh `compact-2x-transcript.png`, `landscape-caption-scroll.png`, `tall-playing.png` dated16:38–16:40.

The enlarged-text More surface now wraps Previous and Next vertically with no visible overflow stripe. Playback speed, captions and copy actions remain readable. The transcript heading is reached, but this single frame does not show transcript body or establish that the full transcript was read. Landscape caption-scroll now visibly shows the latter qualifying sentence, corroborating the integrator's actual scrolling action and resolving the prior concern that only the first lines could be reached. Tall playing frame preserves source graphics, has no centre pause overlay, and separates captions/metadata. Status and destination contrast remain repaired.

This is actual result-frame inspection, not reviewer-operated touch or normal-speed watching. Compact/landscape picture and large-text metadata discoverability limitations remain as already documented. New retained issue reported by integrator: the first final recording encountered media/caption unavailable after swipe; Retry recovered, cause unknown. A later successful recording must not erase this failure or convert it to a diagnosed setup issue.

Evidence provenance correction: integrator reports the initial new-run web before directory was accidentally overwritten by the capture script's default phase. Earlier baseline descriptions in this report reflect the original images actually opened at that time; current files at those paths no longer prove the original baseline. Owner packet must use explicitly dated older closeout baseline and disclose this limitation. The explicit phase guard is now added. No invented recreation of lost before evidence.

## Final native493da1 — separate bounded visual sweep2

Subsequent pass independently opened fresh `after/native/more.png`, `sources.png`, `share-return-paused.png` and `compact-2x-caption-scroll.png`. More now visibly contains supported caption/speed/copy/navigation options and readable transcript body at ordinary scale. Sources shows three numbered original-item entries and exact URLs. Share return visibly remains paused and explicitly says delivery is not verified; its closeable transient status is not confused with receipt by a recipient. Compact2× caption has changed from the initial wording to later words after the integrator's actual scroll, confirming a working scroll path in the supplied result evidence. It still shows only a few words/lines at once, with a tiny contained picture and truncated metadata; that tradeoff remains an owner accessibility/readability limitation rather than a polished immersive2×experience.

Rehashed stable final APK unchanged at `493DA1C98C960C15E4174CDB889E761EE96A1C864E491A695F48B8FB22E94CE8`. Both final native sweeps are bounded actual artifact/capture inspections, not full acceptance reruns, independent device operation, normal-speed watching, subjective listening or owner approval. No further concrete overlap or overflow stripe found in these final inspected states. Unknown-cause recovered media/caption failure remains open; successful later screenshots do not resolve its cause. Physical Android/TalkBack/iOS/Figma remain separate unavailable or pending gates. Web baseline provenance loss remains explicitly recorded above.
