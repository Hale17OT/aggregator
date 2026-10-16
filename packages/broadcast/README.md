# Original forest studio renderer

`scene.mjs` authors a 1920 × 1080 editorial animation. `sceneAt(programme, timeMs)` reconstructs shot, speaker, raw Rhubarb phoneme, gaze, eyelid, head and arm state from media time without prior frames, clocks or randomness. `renderSvg` is the same deterministic scene boundary for previews and offline frames. Ada and Eli are original vector artwork, not likenesses or photorealistic avatars.

Eight motivated shot categories: establishing wide, active medium, two-anchor handoff, evidence shoulder, full illustration, original route clip, count comparison and source recap. All text comes from the existing fictional script/evidence. No additional reporting claims are generated. Each full variant retains its distinct existing WAV narration.

## Verified local commands

Run from the repository root with the bundled Node 22 (normal supported Node also works):

```powershell
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode benchmark --variant duo
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode pilot --variant duo
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/inspect-broadcast-pilot.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode full --variant solo --pilot-reviewed
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/render-broadcast.mjs --mode full --variant duo --pilot-reviewed
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-broadcast-scene.mjs
```

`--pilot-reviewed` records the deliberate local inspection step; it does **not** imply owner visual approval. Default FFmpeg is the separately reviewed local Gyan 9.0.2 essentials build. `--ffmpeg`/`--ffprobe` allow an explicit equivalent local path. No tool is downloaded by rendering. Its GPL build is a local tool, not a redistribution clearance.

The renderer decodes the source clip to constant 30 fps JPEGs, indexes exact source offset frames and rasterizes authored SVG through Chrome canvas. A bounded single browser streams JPEG frames into a two-thread H.264/AAC encoder. Frames are not accumulated on disk; only the 16-second source decode is retained. Complete files are 1280 × 720 at 30 fps with fast-start metadata. FFprobe and full decode validate each output. Render reports measure Node RSS only, not combined browser/encoder memory. Source timing and narration padding are measured in the render report. Files use content/version-derived directories under `.cache/broadcast/renders/`; completed files are hash-checked and reused, never silently overwritten.

Full renditions use sidecar captions so the player can toggle them. Sentence segment boundaries come from actual audio; divisions inside a multi-sentence segment are proportionally estimated, not word-level forced alignment. The 55-second review pilot retains baked captions, whose shorter display chunks are approximate; this is separate from the final player's native captions.

Raw nine-shape Rhubarb alignment is recovered from existing sentence cache and is not the earlier collapsed three-pose manifest. Jaw movement follows phonemes; the silent presenter and clip handoffs remain at rest. Gestures are bounded anticipation/emphasis/return pulses at seven explicitly authored emphasis beats; all other segments rest. Small deterministic breaths and blinks are staggered between anchors.

Browser playback and inspected decoded images establish concrete local evidence. They do not establish owner visual acceptance or natural pronunciation. Direct human listening remains required. The renderer does not publish files, modify the retained database, serve unrestricted assets or alter programme eligibility.

