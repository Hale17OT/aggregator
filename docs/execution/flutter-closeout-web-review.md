# Independent web baseline review — Flutter closeout

Reviewer: separate `/root/web_review` agent, read-only product inspection, 16 October 2026 00:11–00:13 UTC. Actual existing loopback service http://127.0.0.1:3000; Chrome154.0.8037.100. Capacity before capture: C100.74GiB / E233.37GiB. No build, account mutation, media regeneration or performance suite run.

## Finding WEB-R01 — P1 at the required narrow/short viewport

At320×568, Clips calculates remaining height after the entire masthead and descriptive header and then clamps the picture to120px. Actual video is67.5×120 at x126.25,y446.33; it is centered exactly but embedded text becomes unreadable and its controls are clipped into that tiny width. This fails readable portrait media/control treatment, despite zero document overflow. At834×700 and1440×700 the actual picture is171.91×305.63, still disproportionately small but controls remain recognizable. The390×1000 picture is legible and centered.

Reproduce: open `/clips`, resize viewport320×568. Evidence: `output/playwright/flutter-closeout/web-baseline/clips-320-568.png`, `interactions.json`. Cause located in `ClipFeed.vue` fitPicture: available height subtracts document-position top with120 minimum. Suggested bounded correction: compact/scroll the header and reserve a readable media/control minimum, maintaining centerline and finite scrolling. Do not hide options or shrink controls merely to fit. Integrator informed; repair and fresh review required.

## Actual inspected results

- Home actual outer text edges:32px desktop,18px390mobile; coherent with masthead rules. Desktop climate category and `q=trial` keep identical newspaper composition, column treatment and inset; results change to2 and6 matching stories respectively. No pageerrors or horizontal overflow in the14 baseline routes. Format navigation exposes Home,Radio,Newsroom,Clips independently of topical links.
- Radio desktop/mobile cabinet retains original physical design; icon-led transport keys are present. This review only inspected resting Radio screenshots; pointer/audio/queue tests are historical, not freshly repeated here.
- Newsroom actual Start programme click played its prepared video to1.83s; native caption track showed24 cues. Inspected screenshot shows caption above the grouped icon/timeline controls without overlap at1440×1000. Navigating to Clips yielded paused clip0, preventing automatic media takeover. This is a narrow ownership check, not full lifecycle verification.
- Interests actual guest navigation Sports→Football(soccer)→PremierLeague→ManchesterCity worked. Selecting the team produced exactly1 checked tile, green selected state, unchecked league and Across all competitions scope. Save remains disabled for guest. No durable-member claim from this check.
- Actual Next headlines click created1 fold overlay at200ms, with underside/shadow in intermediate screenshot; then URLpage2 and0 overlays after settlement. Only spread turns. This proves the interaction and inspected intermediate frame, not owner motion acceptance.

## Evidence and identity

Raw captures and scripts: `output/playwright/flutter-closeout/web-baseline/`. `review.json` includes actual geometry, headings, control sizes, pageerrors and served script URLs for14route/viewport pairs. `interactions.json` holds actual DOM/media checks. Uncut interaction capture: `page@9c6b9daed601821184df7f56e06da3f1.webm`. The recording was produced; this reviewer inspected live interaction states and captured frames, not a complete normal-speed replay or subjective audio.

Inspected source SHA256:
- ClipFeed.vue:7C1130309CC14C4C50B8981BFA6CA42254D7E81E74CCCCB93B5CD4AC65384D0A
- index.vue:4C99ACA8DD1C89B896400DB203125691C7D544461B2D6BD87155B3A9509894E2
- BroadcastVideoPlayer.vue:8F469253FF5A30C9402B0192B6E5C5A842F62D816249D873FBBA3B38D3EB5FBE
- InterestEditor.vue:74435AEB7BC2D4DDE399E3012DDF728874D46F61237C869CB005EE5C2FB9D2D8
- paperFold.ts:9502E7108E8F6BDEB4D30CD039A13964ACAF5E2168C5AC325D68B16C7E202C82

Commands, repository root:
```powershell
$env:TEMP=(Join-Path (Get-Location) '.cache/stability-tmp')
$env:TMP=$env:TEMP
$env:PLAYWRIGHT_BROWSERS_PATH=(Join-Path (Get-Location) '.cache/stability-browsers')
& .cache/runtime/node-v22.22.3-win-x64/node.exe output/playwright/flutter-closeout/web-baseline/capture.mjs
& .cache/runtime/node-v22.22.3-win-x64/node.exe output/playwright/flutter-closeout/web-baseline/interactions.mjs
```

Failed setup retained: first interaction recording invocation omitted PLAYWRIGHT_BROWSERS_PATH and failed before page creation because global ffmpeg1013 was absent. No download/install performed; rerun selected existing project browser cache and succeeded. This was setup failure, not application defect. Capture script's plain screenshots worked with installed Chrome.

## Limits

No final candidate signoff. No fresh authenticated data, source eligibility, caption-full-duration, all-six-Clips, keyboard-only, screen-reader, physical touch, subjective listening, iOS, native Flutter, or three-repeat final-critical-journey gate. Historical performance results and CPU4 issue remain untouched. No native Figma work. Owner acceptance pending. Parent integrator owns final build/data/media fingerprint and unaffected-source reconciliation.

## WEB-R01 repair verification — 16 October 2026 00:39–00:41 UTC

Independent fresh review after integrator build and owned restart. Read actual revised fitPicture: minimum readable height400, bounded by available width/aspect; short viewports scroll instead of shrinking to120. Source ClipFeed SHA256 `B4D8F69FD5AD97D79EE8552EC056290DF05ED7035962872D50A78E3EA8EB9CDF`; actual served entry `/_nuxt/B7LGy9tU.js`. Capacity C93.46/E224.96GiB.

**WEB-R01 P1 closed for the reproduced defect:** matched320×568 now225×400 (previous67.5×120); all three44px media keys fit inside picture with no overlap, clipping or horizontal page overflow. Captured initial page plus scrolled-to-picture frames; the initial page intentionally requires vertical scrolling because the full masthead remains above the readable picture. Actual click Play advanced video0.51s; Pause paused; Captions toggled track hidden. Picture remains exactly on page centerline.

Matched834×700 and1440×700 now225×400 instead of171.91×305.63;390×1000 remains347.28×617.41. All four have0px centerline error, no document overflow, paused entry. Inspected320,390,1440 screenshots at native size: headline/body recognizable at320; fine-print baked-in footer remains small, not newly regenerated (existing media immutable). This is not owner acceptance or a claim that every embedded footer is large-text accessible; transcript/source alternatives remain important.

Fresh files `output/playwright/flutter-closeout/web-repair/`: `geometry.json`, `controls.json`, initial/picture screenshots forfour viewports, `320-controls-operated.png`, reproducible `review.mjs` and `controls.mjs`. Commands use the same pinned Node/browser environment as above, with these two script paths. No product edits by reviewer. No new full-suite, normal-speed replay, native-platform or final three-run claim. Existing broader limitations remain unchanged.

## Fresh functional regression pass —16October2026

All10 serialized existing scripts passed (exit0), without build or service restart: reader-refinement journeys; refinement edges;22-route lifecycle; actual emulated touch; media edges; reader/browser; shared controls; programme handoff; actual Radio dials; shared chevrons. Raw stdout/stderr retained in `output/playwright/flutter-closeout/web-final/suite.json`; pre-run historical reports preserved in `prior-reports`, current copied reports in `fresh-reports`, source/server fingerprints in `identity.json`.

The runner deliberately omitted `check-refinement-members` and `check-member-demo` because they restart the API and would conflict with concurrent native/backend work. No fresh retained account mutation was needed by these10checks. No inference of full native/authentication acceptance. Current exact lifecycle gate unchanged: at most3videos,1playing, persistent root audio, warm node spread<30/listener spread<10. Existing responsive source/SSR, stale query, failed pagination, Escape cancellation and media-owner assertions passed. Unchanged performance timing is held until integrator confirms native build/media activity has stopped.

Source-only native auth review: `/auth/native` uses same-origin browser preflight and member CSRF mutation; it requires an explicit approval after normal captured-mail confirmation and validates returned custom-scheme callback before navigation. Two continuation limitations were reported to integrator: Cancel connection only removes localStorage/navigates and does not invalidate DB handoff; Sign-in's separate Cancel and continue does not clear native continuation, so a later confirmation during its15-minute window can return to that explicit approval page. These are not silent grants; full malicious/replay/cancel service tests belong to native auth review. No claim of attack testing from source inspection.

Fresh four-engine bounded checks also PASS:Chrome154.0.8037.100,Edge155.0.4283.45,Firefox157.0,WebKit27.2. Each actual installed engine completed page2 reduced-motion, exact typed browse path, H264/AAC portrait playback/pause and source detail. Fresh report copied to `web-final/fresh-reports/refinement-engines.json`. This is desktop automation with mobile viewport, not physical mobile coverage. No setup failures in this run.

## Unchanged reference performance gate — fresh FAIL

Three reference Radio repeats completed16October00:49UTC with original measurement script and unchanged thresholds7ms callbackp95/11.2msp99/discretep95<100ms. Dialp95:7.3,7.3,7.4ms; queuep95:7.5,7.5,7.5ms. Dial/queuep99≤7.7ms. Discretep95:12.8,13.4,12.7ms. Persistent root audio preserved all3. Gate **FAIL** on callbackp95; no thresholds weakened or repeated until favorable. Same23programme catalogue as historical refinement-after. CPU4 popup/list remains unresolved and was not retested.

Conditions:Chrome154,1440×1000,light,DPR1,CPU1×,no recording/tracing. Integrator confirmed no builds/tests/renders and native audio paused; **idle Android emulator remained running**, so this is not identical historical machine state and cannot establish regression causation. Current client SHA256 `a9e4e503464d63df16b62078ddab9d5430ba290b1b269a7d7c75ef978e61cac6`, served entry SHA256 `2d8cd85f2569ba4d13254866cb5be5f1ee23706afa2746e44e98621b506b31c9`.

Raw `output/playwright/performance/flutter-closeout-web/radio-1440-light-1.json`; derived unchanged gate `output/playwright/flutter-closeout/web-final/performance-gate.json`. Verified command:
```powershell
& .cache/runtime/node-v22.22.3-win-x64/node.exe scripts/measure-refinement-performance.mjs --phase flutter-closeout-web --scenario radio --repeats 3
```

These3performance repeats are not the protocol's3complete critical-journey runs or2finalreview sweeps. Those broader native/web closeout gates remain separately owned by integrator. No performance redesign performed.

## Independent native motion repair verification

Reviewer authored only `apps/mobile/test/native_motion_test.dart` (9focused widget tests), then independently reran after integrator product repairs. Initial6PASS/3FAIL retained in `output/playwright/flutter-closeout/native-motion-attempt1.log`: mid-turn reduce-motion change left outgoing sheet; actual pointer cancel retained changed preview; Tab/ArrowRight did not adjust face. Assertions were preserved.

Read repairs: PaperTurn now stops/drops old sheet on reduce-motion updates and platform dependency changes; HardwareDial has a disposed FocusNode, keyboard arrows/Home/End/Escape, raw pointer cancellation with deferred commit guard, focus indication. Fresh independent rerun **9/9PASS** in `native-motion-independent-repaired.log`. Test-only maintenance replaced deprecated pipelineOwner semantic dispatch with current SDK binding.performSemanticsAction(SemanticsActionEvent), matching installed Flutter framework tests. This still executes actual semantics action; assertions unchanged. No product edits by reviewer.

Verified: initial app/platform reduce-motion, semantic exclusion of outgoing spread, reversal bounded toone outgoing sheet and final cleanup, mid-turn disposal/no pending ticker, mid-turn reduce-motion; actual face pointer cancellation/seam/endpoint/reversal and one committed ending; semantic increase, visible decrease alternative, Tab/ArrowRight. These are isolated widget/runtime checks, not physical touchscreen/TalkBack/VoiceOver or visual motion acceptance, and do not replace integrated real-audio dial behavior.

Command atapps/mobile with workspace environment:
```powershell
. ../../scripts/flutter-env.ps1
C:/flutter/bin/flutter.bat test test/native_motion_test.dart --no-pub --reporter expanded
```

## Bounded native accessibility/source review — current candidate

New test-only `apps/mobile/test/native_accessibility_test.dart` exercises actual widgets at constrained logical size and enlarged text with explicitly synthetic in-memory API responses. No emulator, retained account, real authentication or persistence touched. Result **1PASS/3FAIL** retained in `output/playwright/flutter-closeout/native-accessibility-attempt2.log`:

- NATIVE-A11Y-01 (P1 recovery): actual shared FailureView with offline ApiFailure at320×240 body and2×text overflows252px bottom. Retry is below a non-scrollable Column. The realistic constrained body represents short landscape/keyboard/large-text combinations. Add bounded scroll/reflow; retain full readable error and Retry.
- NATIVE-A11Y-02 (P1 navigation at enlarged text): Home Previous/Next Row at320px and2×text overflows141px right. Use wrapping/adaptive layout; preserve both actions, no text-scale cap.
- NATIVE-A11Y-03 (P1 required interest actions at enlarged text): interest Explore/Mute Row at320px and2.5×text overflows156px right. Reflow/wrap actions without changing expansion versus selection semantics.
- Retry semantic node has enabled tap action and expected label in ordinary1.3×layout PASS. This is framework semantic dispatch/tree inspection, not actual screen-reader review.

Initial attempt1 was a test-author compilation error (missing SemanticsAction import), retained in `native-accessibility-attempt1.log`; import repaired before application assertions ran. No product files changed or assertions weakened. Future repairs must rerun exact layout cases plus adjacent journeys.

Source-only parity finding READ-03: HomePage currently hardcodes All/Culture/Climate/Science/Business/Technology chips, while web/current eligible catalogue has14desk categories. Nine actual desks cannot be chosen through native topic navigation. API query path itself supports topic intersections; fetch the existing discovery metadata rather than inventing or trimming coverage. This finding is code inspection, not a completed end-to-end category gate.

The inspected new FormatLinks service correctly selects by article slug/version/block IDs and uses destination segment startMs rather than copying another format's timestamp. It silently renders nothing while failed catalogue fetch remains snapshot.hasData=false; consider explicit unavailable/retry feedback for this secondary action so API failure is not confused with absent format support. No success claim for actual handoff from this source inspection.

## Independent repaired accessibility rerun and Radio frame inspection

Only the3unbraced-if lint sites in `native_accessibility_test.dart` were changed; original layout assertions retained. Fresh combined accessibility/motion run **13/13PASS** (`output/playwright/flutter-closeout/native-accessibility-independent-repaired.log`). Shared FailureView is now scrollable; pagination and interest actions wrap. Earlier failures remain retained. New Home topic list reads actual API articles instead of5hardcoded desks; current synthetic Home test does not supply that extra fetch, so its pass is pagination layout coverage only, not topic coverage.

Inspected actual emulator capture `output/flutter-closeout/android/radio-endurance.png`: masthead/readable editorial typography/cabinet/physical transports and dials present. Concrete visible state mismatch: main edition/cabinet says “Field notes — water, measurement and uncertainty”, root mini-player says “Civic evening — transport and public s…”. Integrator subsequently added media listener, selected-edition synchronization and keyed dropdown; source inspection indicates intended fix, but this old frame cannot establish repaired visual result. Chapter step sizing and position synchronization are being updated by integrator; fresh actual-screen evidence remains needed.

PaperTurn integration source clarification: current Home FutureBuilder only removes content when `!snapshot.hasData`; Flutter retains prior successful data while a replacement future waits, so same-route normal pagination should retain PaperTurn state. The code does not currently use `connectionState!=done` here. No concrete missing-turn defect follows from this source alone. An error branch does replace the sheet with FailureView; actual normal-speed native page-turn evidence is still required, distinct from isolated widget passes.

## Independent actual-output review sweep1 — candidate10C2336C

Integrator identifies APK SHA256 `10C2336CA082EFFE7995C4F50742FE75EA60DC282ECD3C268D714B3C28BB91A2`. Inspected supplied native Home candidate, persistent Library, settled fullscreen Newsroom screenshots; extracted actual journey/fold recording frames. Reader scroll-to-top source edit was not yet in this APK, so this is **not a final unchanged candidate sweep**.

**NATIVE-VIS-01 OPEN — paper turn transparent overlap:** actual recording clearly superimposes outgoing and incoming headlines/body text throughout part ofturn. Full extracted frame `output/flutter-closeout/review-sweep1/fold-overlap-9.9.png` (normalized PTS~9.9s) demonstrates unreadable doubled text, beyond the curl seam. Dense frame contact sheet shows moving rightward fold/shadow and cleanup, so animation does occur. Root cause consistent with transparent outgoing Column painted over target in PaperTurn. Add opaque theme surface to outgoing sheet while retaining old layout constraints; source scroll-to-top alone cannot fix this. Requires rebuilt actual recording review. This blocks paper visual acceptance, although isolated reduced-motion/ticker/semantic tests pass.

Home screenshot has balanced visible insets, centered blackletter masthead, first-class fiveformat navigation, clear query/topic/pagination context and readable editorial typography. Library screenshot shows real saved story/account surface with preferences/interests/queue; no clipped controls in thisframe. P2polish: saved date renders raw ISO timestamp and version rawUUID, exposing implementation metadata rather than reader-friendly date/version label. Fullscreen Newsroom frame has correct preserved landscape picture letterboxed inportrait, caption visible above actual pause/exit controls; no overlap in thisframe. Staticframe cannot prove audio ownership or controloperation.

Video metadata correction: `native-journey-uncut.mp4` actual106.011311s, SHA256 `768F1BFEB52599B311CFC387435F6117919EF975C01A136CA5238257907DC33D`; `native-fold-uncut.mp4` actual11.765311s, SHA256 `A2E6FCDA53FAC8206ECC0D7EB7A4A7A9CCAF0CCEF1FA5F9390CF32E8E5E5BB72`. Both1080×2424 withvideo/data streams **no audio stream**. Do not call them120/20s or subjective listening evidence. This reviewer inspected sampled actualframes/contact sheets, **not complete normal-speed playback**. Initial single-frame extraction attempts missed the VFR transition; preserved outputs show resting frames. NormalizedPTS9.9s extraction captures defect unambiguously.

Journey sampledframes demonstrate actual Home→Radio→Clips1/2→sources→Newsroom→guestLibrary surfaces and correct styledcaption/source presentation. They do not prove each operation or complete sixclip/nativeauth journey. Current web10suite/fourengine independent checks and freshFAILperformance retained above; no new heavybrowser tests run for thissweep. No owner/TalkBack/physicaldevice/iOS/Figma/listening acceptance inferred.

## Independent repaired fold profile review

Inspected actual `output/flutter-closeout/android/native-fold-repaired-profile.mp4`,16.605544s,1080×2424,noaudio; recording SHA256 `F2BBF996C2C232D7E6AE74B533E3E6118DD7609554C9F8DBA5B49AC18F73BB19`. Verified on-disk profile APK SHA256 `9648085D01886411AB3BB655EE87A3E6BBD6ADE58717474CD0DBB0F0A64E812A`. Integrator associates capture with that APK; no device manipulation by reviewer.

**NATIVE-VIS-01 transparent text overlap repaired in inspected actual frames.** Extracted20fps sequence oflast1.6s shows opaque outgoing page2covering incoming page1; no old/new text superimposition away from moving fold. Previous moves fold right-to-left, consistent with reverse direction. Masthead, topic/query controls, persistent mini-player and bottomformat navigation do not turn. Navigation first scrolls story list back toits beginning, then turns only storyspread. Dense frames `review-sweep1/fold-repaired-dense.png` substantiate transition geometry; full last frame `fold-repaired-last.png` shows readable incoming firstpage.

Limit: recording ends as fold approaches leftedge (tiny outgoing text sliver remains atlastsample), so this evidence closes transparent overlap but does not independently prove final visual cleanup after animation; prior isolated ticker/semantic cleanup tests remain the separate evidence. This is sampled actual-frame review, **not complete normal-speed playback or owner motion approval**. Profile capture differs from forthcoming finaldebug build; subsequentJUnit notice-only change does not make this a two-sweep unchanged-finalcandidate claim.

## Additional connected native review tests authored, not yet run

`apps/mobile/integration_test/reader_journeys_review_test.dart` contains3tests using actual app/loopback API and full23programme catalogue, no server mocks. Static Flutter analyze PASS; device execution intentionally deferred while integrator owns endurance session.

1.J01/J02: actual Climate dropdown +trial search, compare visible story list tosame real eligible API intersection; URLscope; open actualarticle, compare standard/brief text and complete sourceid/ordinal/URL maps, enabled original-source affordances, Sourcesjump, standardrestore, nativeBack preserves exact query/category URI. Originalexampledomain URLs are not launched externally.
2.Unavailable requested programme: Newsroom andClips routes withnonexistentID must showhonest unavailable message, noVideoPlayer andnoRadioautoplay. These two routes explicitly acceptrequestedId; Radiodoesnotexpose thatquerycontract. Source review caught missingVideoCatalogueguard; integrator reportsrepair, pendingactualrun.
3.J15: local2×reading scale/reducedmotion, traverse all5actualprimaryroutes, checknoFlutterlayoutexception andallprimarynavlabelsreachable. Existingsettingsrestoredfinally; nomemberpreferenceswrite. This doesnotclaimlargestOStext, physicaldevice, TalkBack, orfullscrollablecontentcoverage.

Onlytestfileedited. Exactcommand afterintegrator permitsdeviceuse: workspaceFlutterenvironment then Flutterintegrationtest invocation viaexistingroot-ownedselecteddevicewrapper/flavor LOCAL_DEMO. Do not inferPASSfromstaticanalysis. Appmaininitializesoncewithinfile; subsequentcasesremount AggregatorApp anduseexistingservices. Testsuse normal logout onlyifprecedingtestslefta dedicatedauthenticatedsession; noreset/reseed/storageclear.

## Final visual review preparation — candidate not frozen

No device/browser/build action during integrator reader/endurance tests. Current source has actual14-topic API discovery, explicitEditorialoverride, missing-ID VideoCatalogueguard, realClippicture swipe handling and reduced-motion jumpToPage. Those source observations are implementationstatus only. Reader connected suite first failure occurred because the test observed categoryURL before rebuilt search field existed; integrator's explicitwait for actualTextField preserves realinteraction/assertions and addresses a test synchronization error. Failedrun mustremain retained; rerunpending atreviewtime.

Final bounded capture/review checklist for the eventual unchangedAPK:
- Record APK/sourcehash andshow Homepage1, matching category+query, emptyintersection, page2andBack. Confirm realtextinsets andtopicindicator; do notsubstitute historicalwebcaptures.
- Capture full Radio cabinet andmini-player together aftercross-programme handoff andchapterchange: bothprogramme/title andtime mustagree. Old radio-endurance mismatch isnotclosed bysource alone.
- Capture Newsroom inline/fullscreen withcaption/controlclearance andexit; Clips portrait withactions,actualswipe,pausedBack andlast-six boundary. Realtexture/playerstate must bevisible; priorpreparation/seektests aren't motionapproval.
- Capture interests expandedSports→Football→PremierLeague withonlyManchesterCityselected, scope, saved/draft state; 2×text inshortheight includingnegative/empty/errorrecoveryactions.
- Record NextandPrevious fold through a settledpost-turn frame (≥1s afteranimation). Opaque previouspage mustnotbleedtext; masthead/navstaystationary; oldrepaircaptureendednearleftedge. Reducedmotion shouldchangecontent withoutfold.
- Reconcile allcapturedhashes tofinalbuild. Currentnative reader/controls edits mean earlierprofileframe review isaffected-evidence, nottwofinalsweeps onunchangedcandidate.

Readily testable remaining gaps in thisreview's coverage (notnewly assertedproductdefects): actualsource-return/context afterexternalbrowser; varianttoggle afterselectedFormatLinkssection; short/large-text missingprogramme andemptyFollowingClips branches (theirCenter/Columnerrorlayout remains separate fromscrollableFailureView); directincomingarticle section andunavailablelocator state; delayedcategory/query/error sequencewitholdUIvisible. Favorboundedactualreproductions overclaiming thesePASSEDfromsource. No extraoptimization/rendering requested.

## Independent inspection of three connected reader XML results

Inspected allthree actual XMLreports under `output/flutter-closeout/android/reader-20261016-054646/results-{1,2,3}/debug/flavors/localDemo/`: each records3tests,0failures,0errors. Namedcases are J01/J02 scopeddiscovery/variants/Back, J15 200percent/reducedmotion primaryroutes, and missingrequestedprogramme no substitution. This is realAndroid emulator/API evidence executed byintegrator, independently inspected bythisreviewer; notthisreviewer's own device rerun.

Historical testcorrections retained: URL observation couldprecede rebuiltlazy search field; explicitfieldwait added, productscope nowresets scroll0. Climate+trial hadzeroactualeligiblematches; Climate+rain chosen toexercise a realarticle while comparing exactliveAPIresults, notchangingcatalogue. Outgoingpagefold cleanup waited before readingwidgetcounts. NativeGoRouter imperativepush preserves baseRouteInformationURI, so assertion checksactualArticlePage.slug; pop stillassertsexactscopedHomeURI. Standard/briefbody andcompletebibliographyidentity/ordinal/URL assertions preserved. These are test synchronization/data/observablecontract corrections, notwaivedproductfailures.

Authored concise localpacket `output/review/flutter-closeout.html` withrealexistingcaptures/recordings/routes, canonicalreport/acceptanceregister/APK links andoneownerdevice checklist. Everycapture/recording explicitly intermediate; finalAPKfingerprintpending andinstrumentationoverwritecaution. No unavailablehuman/platformgate markedPASS. Maincandidate source stillchanging; this doesnotclose twofinalunchangedcandidate sweeps.

## First final-candidate invalidation — native short Clips

Independent inspection of `output/flutter-closeout/android/final/clips-320x568.png` confirms unreadably tiny actualportrait (integrator measured67.5×120logicalpixels), with centralPlaydominatingpicture andbelow-picturecontrols clipped byavailablebody. This is a nativecounterpart ofearlier webshortviewportdefect, notcoveredbythewebrepair. **Firstfinalcandidate invalidated; finalreview/sweepstatusreset.** Preserve earliercaptures/reports asfirstcandidate evidence.

Read latest ProgrammeVideo repair: portraitheight=min(width×16/9,max(400,availableheight−170)); existingSingleChildScrollView retained. This plausibly repairsreadability andcenteredpicture withoutmediachanges. Integrator reports7videoidentity/layouttestspass including320×240, but reviewer hasnotrerun orseenrebuiltactualoutput. **NativeClipsactualvisualrepair pending.**

Requiredadjacentactualinteraction: atshortheight picturecanfilltheavailablebody; itsverticaldrag handlerclaimsClipsnavigation, whilebelow-picturecontrolsmustremainreachablethroughrealpointer/touchscroll. ProgrammaticensureVisible alone cannotestablishthis. Verify a realaccessible scrollpath orretainedcontrols afterrepair. This is a specificrisk/check, notanewreproducedfailure. No device/build/browser actionbyreviewer andno productedit.

## New repaired main candidate — final visual review1 (scoped Clips)

Candidate identified byintegrator as clean mainAPK SHA256 `0ee4b8052aeb9e5079b757baee895ea53164f1ee43d64c3119b76cab53c3d5b1`. Independent reviewer openedactualnewimages withview_image; noemulator/browser/buildcontrol. This replaces theinvalidatedfirstcandidate's Clipsvisualresult, nothistoricalfailureevidence.

Inspected `output/flutter-closeout/android/final/clips-320-picture-repaired.png`, `clips-320-controls-touch.png`, `clips-320-sources.png`, `clips-default-repaired.png`. At640×1136physical/density320 (320×568logical), picture now spansapproximatelyx95–545physical, center320 exactly byvisibleedges:225logicalwide, consistent with400logicalheight. Headline/evidencenote/body nowreadable; centralPlaynolonger overwhelmsthepicture. Pictureisverticallyscrollable/cropped byshortbody, notshrunk intoanunreadablethumbnail. Atdefault1080capture picturealsovisiblycentred withsymmetricgutters andreadablecaption/body. Noasymmetricactionrail offsetseen.

Actualpost-touchimage showswrappediconcontrols,timeline,caption/transcript action andstill“1of6”; sourceimage showsreadable numberedbibliography andoriginalitem URLaffordance. Integrator reportsactualgutterdragsx40,y790→350 twice, followedbySources tap486,540, preservingclipindex; imagescorroborate resultingcontrol/source states. Reviewer didnotperformorwatchthosetouchsequences, so independentclaimis**actualresultframeinspection**, notseparatephysicaltouchverification. Onshortscreens owner shouldunderstandpictureverticalswipe navigatesClips whilegutterscroll revealscontrols; discoverability remainsownerinteractionreview, notafailedfunctionalclaim.

**Native tiny-picture defect closed for theseinspectedactualframes.** Caption/source accessatshortheight hasconcretepost-actionevidence; widget-onlyassumptionnolongerused. Remaininglimits: nofullnormal-speedrecordingreview, subjectiveaudio,TalKBack/physicaldeviceorowneracceptance; notallotherprimaryscreensfreshlyreinspectedinthisscopedreview. Guest/reader3affectedregressionsarerunningseparately; noresultinferred. Asecondunchangedcandidatevisualsweepstillrequired. Preservedfailed `clips-320x568.png` mustnotbereplaced.

## Delivered owner packet update

Updated `output/review/flutter-closeout.html` tostable `output/flutter-closeout/aggregator-local-demo.apk`; independently hashedactualfile SHA256 `0EE4B8052AEB9E5079B757BAEE895EA53164F1EE43D64C3119B76CAB53C3D5B1`, matchingintegratorcandidate. Packetnowincludesretainedfailednative320Clipsframe, repairedpicture, actualpost-gutter-touch controls/sourceframes anddefault-sizecapture. Olderuncutvideos remainexplicitlyintermediate. Alllocalpacketreferencesexist. Same-hashsecondreviewstillpending; repairartifactreviewisnotrelabelledasecondfinalsweep. No device/build/browser action.

## Final notification candidate bounded visual/evidence sweep1

16October06:36EAT. Independently rehashedstableAPK: `48806FB446EAA6AE8F0BDBF5B8BA99A2DB62D3A56185871E0CAA88FB14FC23C0`. Inspected actual `final/notification-icon-repaired.png`: originalmonochromenewspaper icon visible inrealAndroidmediapanel, alongsideactualtitle/transport. Read `final/final-notification-paused.txt`: systemPlaybackStatePAUSED(2),position24096,errornull. Reviewer didnotpressnotificationbutton; rawsystemstate andcapture inspected independently.

Inspected `final/fold-settled-final.png` andsampledactualnew `final/fold-both-directions-final.mp4`, metadata35.180611s,video/data/noaudio. Sequencecontains page1→page2→page1andlongsettledfinalpage1; readablebody,stationarymasthead/nav/mini-player, noresidualfold insettledframe. Thisissampledframereview, notnormal-speedwatching. Denseintermediateframes checked separatelyinsecondpass. Earlier `fold-next-only-attempt.mp4` remainsfailedcaptureofrequiredtwo-directionjourney; notdeletedorrelabelled.

Reparsed `reader-20261016-061838` all3XML:3cases each,0failures/errors. Thoseinstrumentationruns predatefinalnotification-onlyrepair anduse testentrypoint; do notclaimreruncompletejourneys onfinalmainAPK. ShortClipsrepaircaptures bindto0ee4b805predecessor; rootstatesonlynotificationresource/configchanged. Preserveaccurateprovenance ratherthanretroactivelyassigningnewhash. Scopeofthissweepisactualnotification/fold/resultartifacts, notall88criteria orowneracceptance.

## Final notification candidate bounded visual/evidence sweep 2

A separate second inspection on 16 October, 06:36–06:39 EAT independently rehashed the delivered APK to the same `48806FB446EAA6AE8F0BDBF5B8BA99A2DB62D3A56185871E0CAA88FB14FC23C0`. No product edits, builds, emulator actions or browser actions occurred in either review sweep.

Inspected the dense eight-frame-per-second extraction of the first eight seconds of `final/fold-both-directions-final.mp4`, saved at `output/flutter-closeout/review-sweep1/final-fold-dense.png`. Actual intermediate frames show the Next fold progressing left to right and Previous reversing right to left, an opaque outgoing sheet without the formerly reproduced overlapping text, and unchanged masthead/navigation/mini-player. The full sampled sequence and settled screenshot establish readable final page 1 without a residual fold. The recording SHA256 is `10FB19FD359CF9180002E3E4B7E99D6086232C7527CAF818810DB886A593E31E`. This is sampled-frame inspection, not normal-speed viewing or motion acceptance.

Also inspected `final/interaction-contact.png` from the actual final `interaction-final-uncut.mp4`: Home, Radio paused/playing states, paused Newsroom, Clips 1 then 2, and guest Library are visible. The integrator performed the navigation and Clip swipe. The recording does not include a video Play action, so it is not a fresh exclusive-video-ownership test. No subjective listening is inferred from silent screen evidence. Root reports Radio subsequently paused and scoped reverse ports restored; that operational report is not an independent device action here.

Both final reviews are explicitly bounded artifact/evidence sweeps on the unchanged final APK, not two complete acceptance-matrix executions. Earlier reader runs and predecessor short-screen captures retain their actual provenance. No new concrete visual defect was established in the inspected final frames; large-scale coverage, normal-speed owner motion acceptance, subjective listening, TalkBack, physical devices and iOS remain separate pending gates. The known web callback gate remains FAIL and CPU4 issue remains open.
