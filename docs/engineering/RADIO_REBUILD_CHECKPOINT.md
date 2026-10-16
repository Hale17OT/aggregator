# Radio corrective checkpoint — 13 October 2026

Functional verification: passed locally. Visual review: actual desktop/mobile browser captures and decoded interaction frames inspected and refined; owner acceptance remains pending. Native Figma: pending, no editable frames claimed. This is an original CSS/Vue object, not copied Dqnamo source or assets.

Radio remains at http://127.0.0.1:3000/radio. The newspaper and root audio session are retained. New RadioReceiver.vue constructs a forest enamel cabinet with an inset cream front chassis, recessed woven speaker, smoked display, warm printed scale, rotary volume/story indicators, and physically depressed transport keys. The compact version gives transport keys their own full-width row; it does not shrink desktop targets. AppAudioHost.vue adds scoped related mini-player styling. radio.vue keeps queue, edition, speed, sleep, preferences and transcript access.

The visible level meter consumes the existing version-bound PCM envelope endpoint. It advances only when the matching recording is playing without waiting/error. No random bars, fake frequency or live claim. The programme slider previews while dragging and commits through the existing controller. Dials retain visible native range controls and arrow-key semantics; device hardware volume may take precedence. Prepared Radio still uses the one persistent root audio element.

Evidence:
- Before: output/playwright/radio-rebuild/before-radio.png.
- After: after-radio-desktop.png, after-radio-object.png, after-radio-light-390.png, after-radio-dark-390.png, after-radio-light-1440.png, after-radio-dark-1440.png in the same directory.
- Actual interaction recording: radio-interaction.mp4, 1280×900, H.264/AAC, 25 fps, 22.8 seconds, 1,216,417 bytes. It shows play, volume, story 2, pause/resume, article navigation and return. This is a real Playwright browser recording with native audio.captureStream recorded through MediaRecorder; it does not replace/reroute the playback audio through AudioContext. Audio mux alignment uses measured browser-start wall time and is approximate within startup latency. CaptureStream records media audio, not the user's physical speaker output. The volume control's actual HTMLAudioElement value is tested separately.
- Probed video/audio streams and decoded the complete recording; measured non-silent audio peak −5.1 dB. Inspected decoded frames at 6, 10, 13 and 16 seconds, including chapter selection, resumed physical key/meter state, unchanged article and return.
- radio-rebuild-checks.json: 15 groups including actual RMS samples [1,7,3,1,3,1,1,0], paused/buffering meter rest, keyboard volume, real chapter selection, same native element across navigation, 320/390/834/1440 light/dark reflow, keys ≥44×44, reduced-motion transition removal.
- radio-ui-checks.json: existing 17 checks passed, including no-JavaScript transcript, 200% text enlargement, deadlines, failed play and unavailable storage. AUD07 remains PARTIAL because genuine hidden-tab behavior was not demonstrated.

Verified commands from the project root (existing supervised demo running):

```powershell
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-radio-rebuild.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/check-radio-ui.mjs
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe scripts/record-radio-interaction.mjs
./scripts/npm.ps1 run lint
```

The recording script reuses the reviewed FFmpeg binary at .cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe through a workspace-local hard link in .cache/playwright/ffmpeg-1013. It downloads no dependency. No supervisor restart, database change, account reset or unrelated backend work was performed by this Radio task.

Remaining limits: no direct qualitative listening was possible through the available tool interface; do not treat non-silent probing as an audible review. The owner must judge craftsmanship and interaction recording. Physical mobile/browser-engine/hidden-tab limits and existing security/audit gates remain open. A final 4px increase makes desktop rotary range targets at least24px high; mobile ranges remain30px high with independent labels and no overlapping hit regions. General controls were not redesigned.
