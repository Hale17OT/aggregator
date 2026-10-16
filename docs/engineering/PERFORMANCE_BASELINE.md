# Built-app baseline — 13 October 2026

Owner reports lag; it remains an explicit unresolved defect until measured repair. No build, renderer or screen recorder ran during lightweight baseline measurements. The pre-existing retained demo was stopped and resumed through its owning supervisor. No reset/reseed or member writes were used for measurements.

Frozen reference: Chrome 154.0.8037.100, Playwright default flags, headless foreground document, 1440×1000 at DPR1, Light/default motion, media1×, Ryzen57600X /12 logical processors/~33.4GB RAM, RTX5060Ti, Windows High Performance. OS reports180Hz; measured callback median T=5.6ms. This is a callback proxy, not demonstrated compositor/display FPS. Workspace256.9GB/system5.9GB free initially. Other unrelated apps were not stopped. Raw browser/OS/asset identities and complete samples are in `output/playwright/performance/baseline/`.

Three warm UI repeats, each with actual ten-second-plus face dragging, 30 dropdown open/keyboard/dismiss operations, guest queue changes and reader navigation:

| Observation | Baseline |
|---|---|
| Dial callback p95 / p99 | 5.7ms / 11.1ms, all three runs |
| Queue callback p95 / p99 | 5.6–5.7ms / 5.7ms |
| Dropdown next-two-RAF feedback proxy p95 | 10.5, 10.6, 11.3ms; 88 discrete events/run |
| Dial/queue long-animation frames | zero observed; observers supported |
| Read→Radio readiness | 220–231ms after warm reader navigation |

These normal desktop controls do not reproduce a broad main-thread hitch. Do not describe the reported lag as disproven, or these short sessions as field INP. Cold route load is separately recorded and excluded from warm feedback comparisons.

Separate diagnostic traces (`radio-diagnostic-trace.json`, `newsroom-diagnostic-trace.json`): 151 knob geometry reads during 150 pointer movements; 170 layout passes in the approximately six-second Radio diagnostic. Newsroom incurred341 layout passes in10seconds (42.95ms cumulative layout,47.18ms script). Runtime Vue instance hooks were unavailable in the built DOM: the empty hook counters are UNAVAILABLE instrumentation, not zero component updates. Trace overhead is not part of the lightweight acceptance samples.

Demonstrated authored-motion defect: same-presenter/same-medium-shot sentence boundary at42.4s solo /44.25s duo resets camera push from0.025 to0, a nominal16px edge jump at1280px. `motion-continuity.json` evaluates immediately adjacent scene times; it is not a dropped-frame metric. A continuous shot-run push is the proposed measured fix; preserve editorial cuts and lip closures. Actual decoded-frame/normal-speed pilot inspection remains required before full regeneration.

Protected video baseline runs compare the same eligible asset via the real app and a fresh test-only document fulfilled inside the browser. The protected API route is unchanged; no static bypass or public test endpoint exists. Initial harness using setContent could retain old page callbacks and was discarded (`video-discarded-harness.json`), then replaced with fresh document navigation before accepted repeats. Video quality uses counter DELTAS; total includes dropped. Full baseline still running at this document's initial write; consult final results for completion.

Candidate repairs under test: cached drag geometry with safe cancellation/integration of coalesced samples; visible-only interpolated meter isolated from semantic playback time; bounded video UI reports without changing the decoded frame rate; cached immutable-file byte verification with per-request stat/path/current eligibility and bounded range streaming. None removes the cabinet, custom controls, ordinary motion, captions or security gates.

Primary references reviewed: [Vue update performance](https://vuejs.org/guide/best-practices/performance), [video callback semantics](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), [quality counters including dropped frames](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/getVideoPlaybackQuality). These support the method, not the project's measurements.

## Lifecycle investigation (13 October, subsequent evidence)

The 20-journey baseline retained 3,118 → 51,558 DOM nodes and 455 → 6,291 listeners, despite one root audio and no active departed video. An uninstrumented five-journey repetition reproduced growth, excluding the pending-callback wrapper as its cause. Heap snapshots identify browser StyleEngine → TextTrack → detached video retention. Explicit track disabling/source release fixed the Newsroom instance; a second snapshot found the same retention in article inline video. Both route-owned media now share teardown; SSR markup/captions remain unchanged while mounted.

A separate timer diagnostic found orphan 2-second AutoAnimate polling intervals. In pinned 0.10.0, poll's delayed startup was untracked and could create an interval after destroy. The local hash-guarded postinstall patch cancels delayed startup and rejects retired observer work, retaining normal queue animations. With this patch, the remaining growth was exactly ~506 nodes / 5 listeners per article visit; the second snapshot located the inline-video retention described above. Final lifecycle recheck pending. Raw candidate stages are retained, not substituted for baseline.

Protected 64 KiB sequential range requests: baseline warm 93–103ms; first candidate warm 25–33ms. Current eligibility still runs per request; only verified immutable byte integrity is reused by stat signature, and streaming is bounded to the requested range. Same-size corruption/deletion/repair unit coverage passes. These are local request latencies, not audible/playback smoothness measurements.

All twelve accepted baseline video intervals finished: each 61 seconds, solo/duo × app/fresh protected minimal player × three repeats, zero dropped-frame deltas and zero post-start buffering events. General foreground lag remains not reproduced by those measurements.

Final follow-up: `PERFORMANCE_RESULTS.md` and `performance-delivery-results.json` supersede the pending candidate notes above. The final20 journeys are flat at1,792 nodes/404 listeners; all24 final visible-video windows have zero drops/waits. Earlier baseline/candidate data is retained separately.
