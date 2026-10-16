# Radio and reader Newsroom implementation

The original newspaper layout, blackletter masthead, themes and control primitives remain in use. `/radio` and `/newsroom` add reader modes; they are not the private editorial workspace. New aesthetics still require owner review.

`AppAudioHost.vue` mounts one native audio element outside `NuxtPage`. `useProgrammeAudio.ts` owns its media events, playback intent, elapsed position, queue, speed, volume, absolute sleep deadline, per-action guarded Media Session handlers and best-effort BroadcastChannel focus. The visible scene reads the native media clock; animation frames only refresh that projection, and background progress uses native media events. Radio continues through progressive in-app navigation. A hard reload offers a saved position and requires an explicit Play gesture.

The flat mini-player is in document flow and cannot cover source links. Local guest progress stores only a programme ID and seconds; queue storage holds IDs. Storage exceptions do not prevent playback. Clear-history prevents a later tick from immediately restoring deleted guest progress. Authenticated preference loading disables guest progress writes. Logout pauses audio, empties programme state and clears local history. Member persistence is a separate adapter; this controller does not claim local storage is an account save.

The tabletop radio uses original CSS forest-enamel, paper display, speaker grille and a position needle. The needle represents playback position, not frequency analysis. Native selects, ranges and the existing custom buttons operate real media properties. Edition presets come only from eligible ready programme manifests.

Ada and Eli are original SVG illustrations authored for this repository in `BroadcastPresenter.vue`: distinct head, hair, shoulders, clothing, torso and hands. They are fictional synthetic presenters, not representations of real people or stock photographs. Three mouth poses use the generated manifest's measured cues; paused and listening presenters close their mouths. No image-generation or hosted avatar provider was called for this art. Source code is the editable artwork.

Newsroom's separate solo/duo audio and manifest variants determine dialogue, speakers, visuals and captions. A format change pauses at the corresponding story boundary. Native audio is master; permitted video is muted and follows programme time minus the manifest visual offset (the master-clock time at which the clip begins). An essential video's buffering/error pauses the programme with an explicit explanation. Leaving Newsroom pauses by default; Listen instead authorizes continuation of the same soundtrack. Other foreground media pauses programme speech, and starting programme speech pauses other audible media in the document.

`ProgrammeTranscript.vue` renders complete dialogue, visual descriptions, time labels, per-turn citations and original item source links as SSR HTML. No-JavaScript users retain the full transcript and bibliography. Client playback controls require JavaScript.

Verification command, with generated programmes and supervised local services already running:

```powershell
./scripts/npm.ps1 run test:programmes:ui
```

Additional focused checks are `node scripts/check-radio-ui.mjs` and `node scripts/check-radio-background.mjs` (the latter opens an owned test Chrome window and removes Playwright background-disable flags). The underlying combined runner is `scripts/check-programme-ui.mjs`; it writes actual results to `docs/engineering/programme-ui-checks.json` and captures to `output/playwright/programmes/`. Do not infer a pass from this implementation note. The runner measures route continuity, real seek/rate behavior, controlled autoplay rejection, distinct variant audio, mouth pause/speech state, scene cue delay, the actual observed background visibility state, reflow, enlarged text and no-JavaScript transcript/source output.

Limits: no physical iOS/Android lock-screen, Safari/Firefox or assistive-technology certification. Sleep stopping can be delayed while an OS suspends the process. Device-controlled volume may override the HTML property. Headless Chrome visibility must be reported as observed, not labelled a physical background test. Downloaded media bytes cannot be recalled after withdrawal. This implementation does not claim photorealistic rendering, live news ingestion, external email delivery, final aesthetic approval or release readiness.

## Recorded local verification — 13 October 2026

Chrome 154.0.8037.100: the focused Radio runner recorded 17 checks and the combined programme runner recorded 29 checks without assertion failure. Native audio survived Radio → Home → article → Radio with the same element identity. Actual seek/rate, rejected-play handling, storage denial, individually unsupported Media Session actions, foreground article-video focus, absolute sleep-deadline handling, distinct solo/duo recordings, talking/paused mouth poses, both muted video treatments, source links and no-JavaScript transcripts were exercised. Light/dark 320/390/834/1440 reflow and 200% text checks passed after repairing native-select intrinsic sizing.

Four foreground scene/caption seeks resolved in 10, 7, 9 and 8 ms in the final run. Actual video offset differences were 0.009637 seconds for narration-over-visual and 0.008791 seconds for clip-then-commentary. A test of the real underlay caught and corrected an initial cue-offset interpretation error before this result; video now subtracts the manifest's master-clock offset.

AUD07 remains **PARTIAL**. Both headless and headed Chrome reported the original document as `visible` after opening/foregrounding another tab. A second headed run removed the automation defaults that disable background throttling; it still reported `visible`, although native playback advanced 2.273 seconds. This proves continuing audio during that observed interaction, not hidden-tab background behavior. No visibility property was overridden. Physical mobile lock-screen testing is NOT RUN.

The fixed programme includes both media treatments. A member's saved treatment preference does not currently select a separately generated alternative; the page explicitly discloses that fallback. The subsequent `scripts/check-media-recovery.mjs` run held a real local video request: native narration paused at the visual boundary, its clock stayed stable during the delay, and explicit resume stayed synchronized after release. A separate real 404 response produced the paused descriptive fallback; Retry visual reloaded the restored endpoint and resumed in sync. Both paths passed (TV05/TV11).

Captures: `output/playwright/programmes/` contains Radio/Newsroom in light and dark at 390 and 1440, plus cropped duo opening and duo clip stages. These are actual browser captures and original SVG presenters, not Figma frames or hosted avatar renders. Owner aesthetic and listening review remains pending.

Member navigation now opens /library. Stored reading preferences apply on the client: theme (including system), article/transcript text size and reduced motion; explicit URL preferences take precedence. Preference-change and sign-in events refresh presentation, logout resets account defaults, and stale asynchronous preference reads cannot restore logged-out account styling. Controlled preference-response/event/query tests passed in media-recovery-checks.json; backend persistence is verified separately by member suites. Accepted anonymous control geometry is unchanged.
