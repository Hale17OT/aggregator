# Radio / broadcast corrective checkpoint — 13 October 2026

Superseded by the [interaction/performance refinement](INTERACTION_PERFORMANCE_REVIEW.md). The review hub (local-only evidence: `../../output/review/quality-rebuild.html`) now contains the latest recordings and programmes. Counts and pilot details below are historical.

Implemented in the existing application. Staff/MFA remains paused. The retained database, sign-in, member features, accepted newspaper and general controls remain in place. No migrations or resets were required. No commits, paid services, external email, real ingestion, production changes or publication occurred.

## Open the result

- Review page with before/after images and playable clips (local-only evidence: `../../output/review/quality-rebuild.html`).
- [Working Radio](http://127.0.0.1:3000/radio), [working Newsroom](http://127.0.0.1:3000/newsroom), [reader](http://127.0.0.1:3000), [captured mailbox](http://127.0.0.1:8025).
- Radio before (local-only evidence: `../../output/playwright/radio-rebuild/before-radio.png`), after desktop (local-only evidence: `../../output/playwright/radio-rebuild/after-radio-desktop.png`), hardware detail (local-only evidence: `../../output/playwright/radio-rebuild/after-radio-object.png`), 390px (local-only evidence: `../../output/playwright/radio-rebuild/after-radio-light-390.png`).
- Actual Radio interaction recording (local-only evidence: `../../output/playwright/radio-rebuild/radio-interaction.mp4`): 22.8s H.264/AAC. Play, volume, chapter, pause/resume, article navigation and return. Real browser capture with captured native media audio; startup mux alignment is approximate, and this is not a recording of physical speakers.
- Final quality pilot (local-only evidence: `../../.cache/broadcast/renders/13ddd69f76a58e7fdc648a2f6544a8e1107d3317a58808ee543087c14ac89785/programme.mp4`): 55s, programme window 60–115s, inspected before full expansion.
- Complete solo MP4 (local-only evidence: `../../.cache/broadcast/renders/ab664966aa35f51d52cf22d41088458fb894c39b2f44bbb5073f06c22f61443a/programme.mp4`): 148.55s audio; 8,131,130 bytes.
- Complete duo MP4 (local-only evidence: `../../.cache/broadcast/renders/777440788b75f19b514a13acff6b596bfdc21f542a7925b7f9d812943348b3ce/programme.mp4`): 157.275s audio; 8,690,568 bytes.

Both complete files are H.264/yuv420p and AAC 48kHz mono, 1280×720 at 30fps with fast-start metadata. Final video padding is less than one frame. Each render directory also contains poster.png, captions.vtt, sourcemap.json and render.json. The pilot has embedded review captions; full files use selectable captions in Newsroom. Internal phrase timing is proportionally estimated within speech segments, not claimed word alignment.

## What changed

RadioReceiver.vue builds an original enamel cabinet with substantial edges/feet, recessed woven speaker, smoked glass, tactile transport keys and real rotary volume/story indicators. Keyboard ranges remain visible and independent. Mobile hardware deliberately rearranges controls. A version-bound 50ms PCM envelope drives the meter; paused/buffering/error states rest. The root audio element, queue, speed, sleep, transcript and preferences are preserved. Dqnamo was inspected interactively as a craftsmanship reference; its code and branded assets were not copied. See [reference study](../engineering/RADIO_REFERENCE_STUDY.md) and [Radio checkpoint](../engineering/RADIO_REBUILD_CHECKPOINT.md).

packages/broadcast/scene.mjs replaces the previous basic stage with original articulated illustrated presenters, nine speech-driven mouth shapes, authored gestures, listening/handoffs, coherent studio lighting/depth and eight story-led shot types. Existing permitted imagery and route clip are composited into evidence and media shots. Output is animated, not photorealistic. A revised pilot was played and inspected before rendering both full programmes. Frame generation is deterministic; clip frames use decoded source offsets.

BroadcastVideoPlayer.vue and newsroom.vue play a single muxed video as sound/time authority. Radio pauses on video play; returning to Radio clears video ownership. ProgrammeTranscript.vue seeks the actual video. MemberProgressSync.vue and Library preserve current video revision/position with a paused resume and stale-revision rejection. Small screens display active captions at 16px outside the picture. Native fullscreen, captions, failure/retry and explicit audio/transcript alternatives remain available. Reduced-motion CSS does not claim to alter baked camera motion.

Controlled import adds immutable video/poster/VTT/source-map assets bound to the unchanged eligible audio programme. All ancillary assets are rights checked and withdrawn together. Corrupt/stale derivatives do not become playable. No generation endpoint or public static bypass was added. render-broadcast.mjs uses bounded encoder resources, revokes frame image URLs and cleans up its owned browser/encoder on failure. Full renders took 83.145s solo and 93.731s duo; reported peak Node memory was about 167/170MB, not total browser/encoder memory. Later failure-cleanup changes were separately tested; stored render reports retain the code hash actually used for those full files.

## Separate verification and acceptance

| Field | Current evidence |
|---|---|
| Functional verification | Local PASS: 33 unit tests, typecheck, lint, build, worker; Radio 15 corrective + 17 existing groups; prepared-video UI 15 groups; controlled assets four groups; deterministic scenes five groups; programme checks nine groups; listening DB eight groups; member demo eleven groups including API restart. |
| Reader preservation | 36 reader cases + 12 Pretext observations; 32 newspaper cases + 14 journeys + four media checks pass. Retained six-table state preserved through owned supervisor stop/start; seven migrations unchanged. |
| Actual playback | Final pilot and both complete files continuously played to completion in Chrome. Representative advancing frames, handoffs, clip/evidence transitions and endings inspected. Full playback report records decoded frames and no drops at sampled checkpoints. |
| Visual/motion review | Agent inspected actual output and repaired generic gesture timing, render memory growth and unreadable mobile captions. Owner acceptance remains PENDING. |
| Listening review | Direct subjective listening unavailable through these tools. Stream/decode/non-silence and uninterrupted playback checks do not certify voice performance or mix quality. |
| Native Figma | PENDING: current server 9227 has no bridge. No native edits claimed. Original editable SVG storyboard and structured handoff supplied. |
| Security/release | Secret scan passes, including redaction canary. Four false-positive public content hashes received explicit SHA256 report labels; no allowlist/gate suppression. Root 11 high and speech three high/four moderate findings, notices, hosted CI and release gates remain open. |
| Other limits | Genuine hidden-tab playback unverified; physical mobile, Safari/Firefox and screen-reader review unrun. Fixed prepared media-treatment fallback remains disclosed. No external delivery, live aggregation or release authorization. |

Machine evidence lives in docs/engineering: radio-rebuild-checks.json, radio-ui-checks.json, broadcast-video-ui-checks.json, broadcast-scene-checks.json, broadcast-pilot-playback.json, broadcast-files-playback.json, broadcast-solo-render.json, broadcast-duo-render.json, broadcast-render-cleanup.json and the existing reader/member reports. The prepared-video suite replaces the old weak-stage DOM suite behind test:programmes:ui; it tests current playback, failure, media ownership, revision and member resume behavior.

## Verified commands

Run from `E:\Hale\Coding\Personal\aggregator`. The retained supervisor is already running. Use owned restart commands after a rebuild, not a second dev server:

```powershell
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-web
./scripts/npm.ps1 run demo:restart-api
```

When the stack is stopped, start it with the following. Stop is non-destructive; it preserves the retained PostgreSQL cluster and member data.

```powershell
./scripts/npm.ps1 run demo:start
./scripts/npm.ps1 run demo:stop
```

Portable tool installation was verified against a pinned SHA256 before extraction. This is local FFmpeg 9.0.2 essentials with its GPLv3 license retained; it installs no system service. Provenance: docs/engineering/local-tools.json.

```powershell
./scripts/install-broadcast-tools.ps1
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode benchmark --variant duo
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode pilot --variant duo
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode full --variant solo --pilot-reviewed
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode full --variant duo --pilot-reviewed
./scripts/npm.ps1 run broadcast:import -- solo
./scripts/npm.ps1 run broadcast:import -- duo
```

These direct Node render commands were run. Default FFmpeg path is `.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe`. `--pilot-reviewed` records actual agent pilot inspection, not owner approval. Future source changes create different content-derived render directories. The existing nine speech recordings were reused.

```powershell
./scripts/npm.ps1 test
./scripts/npm.ps1 run typecheck
./scripts/npm.ps1 run lint
./scripts/npm.ps1 run worker:check
./scripts/npm.ps1 run check:secrets
./scripts/npm.ps1 run test:broadcast:assets
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-broadcast-scene.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-broadcast-video-ui.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-radio-rebuild.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-radio-ui.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/record-radio-interaction.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/build-quality-review.mjs
```

No clean reinstall or hosted CI run is newly claimed for this corrective increment. Earlier clean-install evidence remains historical. The next action is owner review of this quality package; the proposed staff/MFA work stays paused.
