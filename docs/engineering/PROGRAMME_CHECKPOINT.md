# Local programme pipeline (WP11 / reader broadcast addendum)

This is a trusted local bootstrap worker for original fictional content, not ingestion, publication, or a remote rendering service. `scripts/generate-programmes.mjs` reads the existing vetted fixture repository and writes immutable content-addressed WAV/visual assets and manifests under `.cache/programmes/`. The API reads existing renditions; it exposes no generation or arbitrary-text endpoint.

## Startup and reproducibility

From the repository root on Windows:

```powershell
./scripts/install-programme-tools.ps1
./scripts/npm.ps1 run programmes:generate
./scripts/npm.ps1 run test:programmes
```

The first command downloads reviewed, pinned tools and model assets into the workspace. The generation and playback paths use no network model/provider calls. The separate speech dependency lock is `packages/programme/runtime-lock.json`; it intentionally stays outside the app/client dependency graph. Existing generated sentences are reused by exact text/voice/model/runtime key. Missing tools fail explicitly; browser speech is not substituted.

The speech engine is `kokoro-js@1.2.1`, with converted q8 Kokoro model revision `1939ad2a8e416c0acfeecc08a694d14ef25f2231`. Voices are `af_heart` (Ada), `am_michael` (Eli), and `am_puck` (the clearly disclosed synthetic route-illustration narrator). These fictional presenter labels do not identify or impersonate real people. Actual sample counts determine every caption/turn boundary. PCM is 24 kHz, 16-bit mono. Sentence captions are not claimed as word alignment. Rhubarb 1.14.0 uses the exact generated sentence WAV and dialogue with two threads; its estimated mouth shapes are mapped to closed/open/wide artwork poses.

The original route animation has no second soundtrack. Its meaningful spoken description is embedded in the canonical programme WAV with `speakerId: clip`; anchor dialogue pauses throughout that interval. It illustrates an announced route and explicitly does not prove actual service reliability. The count figure compares eighteen waiting people with twenty-four boardings and preserves the incompatible units/time windows. Neither visual is a new reporting source or extra threshold item.

## Integrity and local worker limits

- Rendition keys bind exact script, article/evidence/rights digest, voice/model version, asset hashes and clip treatment. Solo and duo have separate text, voices, timelines and keys. Full/brief use their actual respective article blocks.
- Every segment carries validated block/claim/source references. Unknown citations, mismatched article versions, timing gaps and ungranted visual transformations fail eligibility.
- Exclusive atomic job-file creation prevents two processes claiming the same rendition. Active worker PIDs cannot be displaced by a time-only lease. A dead worker's lock can be recovered; sentence cache and immutable result files make retries safe. State files record rendering, ready and failure category. Readiness is an atomic rename after a fresh fixture eligibility check.
- Every public manifest and asset request rechecks current publication state, source permission, current approval/content digest and article version. SHA-256 and byte length are checked before serving an asset. Requests use internal IDs, fixed local storage, safe MIME, no-store, and single bounded byte ranges. No arbitrary URL fetching or path access exists.
- New requests after withdrawal fail closed. Bytes a client previously downloaded cannot be recalled. The authoritative public repository remains the existing fixture projection.
- Existing `processing_jobs` was reviewed. This increment uses an explicit **single-machine filesystem spool**, not that PostgreSQL table; it does not claim distributed worker leases, production object storage, complete WP11 or durable editorial job integration. Runtime protected DB-role guarantees are unrelated to this local spool.

## Licenses and release boundary

Primary references checked: [Kokoro JavaScript](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/README.md), [converted model](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX), and [Rhubarb](https://github.com/DanielSWolf/rhubarb-lip-sync). Kokoro package/model declare Apache-2.0; voice files are bundled in the pinned package and their hashes are inventoried. Phonemizer wrapper declares Apache-2.0 but incorporates eSpeak NG (GPL-3.0), which must retain its separate notices/source obligations if distributed. This demo does not bundle the worker/model with the public client. Rhubarb is MIT with bundled permissive third-party notices retained in its downloaded archive. No redistribution clearance beyond this local demo is claimed.

The isolated speech-runtime audit is `docs/engineering/speech-runtime-audit.json`: **3 high, 4 moderate, no critical**, with no compatible fix reported at installation. These are additional worker-runtime findings, separate from the root app audit baseline. The app audit/release gate was not suppressed. The local worker processes only trusted authored fixture scripts and runs offline; this constraint is not a claim that the findings are fixed. Provider/asset hashes and actual durations are written to `programme-assets.json` and `programme-generation.json`; measured decoder/HTTP checks go to `programme-checks.json`.

The hosted extension boundaries are TypeScript `SpeechProvider` and `PresenterRenderer` interfaces only. Future OpenAI speech, ElevenLabs timestamped dialogue, or HeyGen audio-driven rendering require explicit provider authorization, scoped credentials, approved source rights, retention policy and budget. No hosted adapter executed, no external provider calls, no photorealistic output. Owner listening and visual review remains pending.

