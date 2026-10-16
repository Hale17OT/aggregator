# The Aggregator — Radio, reader Newsroom and membership research

**Checked:** 13 October 2026. **Purpose:** decisions for the next local Codex execution, not evidence that the application already implements these features. The design, limits and sequencing below are project recommendations unless explicitly identified as a documented capability. Live paid APIs were not called, voices were not auditioned, and the user's running repository/Figma file was not independently inspected for this research.

## 1. What the supplied project evidence establishes

The newest supplied project status reports a working fixture-only Nuxt/Express reader, server-validated sessions, owner-scoped preferences/bookmarks, and existing database migration/isolation tests. It explicitly says the member/session implementation was still memory-backed at that checkpoint. The subsequent PostgreSQL adapter work was requested, but its completed result was not provided here. The execution prompt therefore inspects and verifies the actual repository instead of assuming that task succeeded.

The same reports preserve the centered blackletter newspaper identity and accepted button system. They still distinguish visual refinement from full WP02 approval, and local verification from hosted CI or production readiness. Real source rights, ingestion, publication, external identity, staff MFA and several security/release gates remain open. This runbook retains those boundaries rather than filling gaps with assumed approvals.

Basis: user-supplied `Project status — 12 October 2026`, especially Latest engineering increment / WP04 fixture identity, Persistence limits and Next executable increment; and `WP04 fixture session and member API checkpoint`, especially Session boundary, Cookies/CSRF, and Persistence boundary. These are status reports, not an independent code audit.

## 2. Product decisions

Use **Radio** in navigation and interface copy. Reserve **Newsroom** for the reader-facing programme; keep the private editorial workspace and its routes separate. Membership means a reader account and owned data. No billing/tier model is introduced.

Radio, text and Newsroom must share article-version, claim, citation and rights references. The broadcast is a transformation of vetted reporting, not two agents improvising a fresh story. A dual-anchor script can divide reporting and context naturally without inventing debate, disagreement or additional facts.

Recommend **pre-generated, cached programmes**, not real-time conversational avatars. The desired interaction is play a news programme, not talk with the anchor. This makes exact scripts, corrections, captions, voice continuity, source links and repeat playback easier to verify. Cache by content/rights/script/voice/presenter version, not by each listener. This is an architecture recommendation, not a provider guarantee.

The proposed local programme includes an opening studio shot, meaningful image, relevant evidence figure, a permitted clip, and a closing source recap. Solo and duo versions are distinct scripts/timelines, not one recording with a face hidden. Public article and programme sources remain accessible without an account.

## 3. Dqnamo reference: use the construction, not the cassette

The referenced page calls itself Cassette Audio Player. Its published usage example takes an audio source, track title and caption tracks. The Kitchen describes it as tactile, with turning reels and a compact cassette surface. This supports using it as a model for a genuinely functional physical-looking player, not a complete queue/background-playback architecture. [R01]

For The Aggregator, translate the idea to a small original tabletop radio: forest enamel face, paper display, grille, tuning indicator, restrained amber detail, tactile keys, and a usable volume/preset control. Retain the existing button family. No cassette reels or false FM frequency labels. A preset knob must select real available editions; provide native keyboard-operable alternatives. A global mini-player uses the same identity in a compact bar.

No explicit broad source-code reuse grant was established from the retrieved demo. Independently recreate the concept and review terms before copying implementation. The retrieved example is React/TSX; this project stays Vue. The research read the public page and usage example; a live browser interaction test was not completed in this environment.

## 4. Speech generation: options and recommendation

| Option | Documented basis | Fit and trade-off for this project |
|---|---|---|
| Local Kokoro with kokoro-js | The maintainers document an 82-million-parameter model and JavaScript operation using WASM/WebGPU or Node CPU, with saved WAV output and multiple voices. [R02, R03] | Recommended no-credential local path. Generate once in a worker, persist assets, and keep weights out of the browser. Actual speed, voice quality, pronunciation and the full transitive/model/voice license stack need local testing. |
| OpenAI text-to-speech | The speech API accepts text, voice and output format, supports streaming, and requires disclosure that the voice is AI-generated. [R04] | Good optional hosted narration boundary. Use the speech API for this non-conversational job, not a real-time chat architecture. It still requires approved credentials, content use and spend. |
| ElevenLabs Text to Dialogue | Its timestamped dialogue endpoint accepts turns with voice IDs and returns audio, speaker segments and character alignment. Its documentation advises keeping requests around 2,000 total text characters for reliable generation. [R05] | Particularly relevant to a two-anchor hosted upgrade and subtitle timing. It is not a video renderer. Split coherent turns, preserve pronunciation context, and validate output rather than assuming a seed is deterministic. |
| Browser SpeechSynthesis | A voice exposes whether it is local or remote via `localService`. [R06] | Only a declared limited-preview fallback. It is not a substitute for an actual persisted audio rendition or proof of cross-device background playback. Do not silently send text to a remote browser voice. |

Kokoro's primary project states an Apache license for its weights/library; that does not automatically settle every converted model, voice file, phonemizer, encoder or bundled asset. Record the actual artifacts downloaded, revisions and notices. Do not infer uniform redistribution rights from one repository's license. [R02, R03]

For the initial local demo, select two existing distinguishable English voices and generate paragraph/turn WAVs. Derive timing from their actual sample lengths. When precise word alignment is unavailable, accurate sentence or turn captions are better than invented word timing. One continuous 4–6 minute Radio edition avoids depending on a hidden tab to schedule every next sentence. These durations and implementation choices are proposed acceptance targets.

No fixed cloud-price estimate is included: endpoint/model availability and plan entitlements must be checked on the account before enabling calls. The implementation should estimate generation duration/characters, enforce a spending ceiling, persist job IDs and avoid repeating successful renders. Suggested capacity model: stories × average duration × prepared variants, then add any re-renders, storage and delivery. Listener count should not multiply generation jobs for identical renditions.

## 5. What an anchor Newsroom requires

A speech model creates audio; it does not, by itself, create a speaking presenter, shot direction, source provenance, permitted B-roll or synchronized captions. Treat these as separate components with a common timeline.

### Local default: original animated presenters

Rhubarb Lip Sync documents Windows/macOS/Linux command-line operation, WAV/OGG input, optional dialogue text and timed 2D mouth-shape output, including JSON. It is therefore a suitable candidate for driving original illustrated presenters from actual rendered speech. [R07]

The proposed local stage uses two original presenter figures, not static circular avatars, with mouth cues, closed mouths on silence, a coherent desk/media composition and clear speaker changes. This is **animated presenter output**, not photorealistic avatar video. Validate the timing against the generated files; mouth recognition is an approximation and must not be advertised as perfect viseme alignment.

### Hosted upgrade: audio-driven rendered presenters

HeyGen's current Audio to Video documentation uses `POST /v3/videos` with audio URL or uploaded audio asset plus an avatar/image subject. Generation is asynchronous, with polling or a callback. This supports rendering a reviewed narration without outsourcing the factual script. Render individual anchor turns and compose them explicitly; the documented single-person image path is not proof that one call creates an entire two-presenter news programme. [R08]

HeyGen documents transparent WebM output for compatible matting-trained avatars. Treat that as an optional composition capability: test actual avatar eligibility and browser behavior; keep an ordinary opaque-video/studio-shot fallback. Do not claim transparency merely because a filename ends in WebM. [R09]

Its current endpoint comparison directs new integrations toward v3. Do not rely on older v2 tutorial payloads without checking current documentation and the account. [R10]

D-ID is another candidate: its talk endpoint accepts a source image plus text or audio script. That is useful for a talking-head alternative, but it does not remove the need for a studio timeline, media grants and programme composition. Avoid integrating both avatar providers in the first run. [R11]

**Recommendation:** finish the local animated programme and preserve a small renderer interface. Choose HeyGen for an optional evaluated photorealistic branch only after the owner authorizes a provider, assets and budget. Existing keys alone are not consent. Do not promise photorealistic anchors on waking when no such dependency is established.

## 6. Background listening and media synchronization

Use a root-level native audio host that survives Nuxt page transitions, not a new audio element inside each route. Normal media transport owns playback and the media clock owns programme time. A script timer or animation frame loop must never be the master clock.

MDN documents that the Media Session API supplies platform metadata and media-key/notification/lock-screen actions, but support is not universal. Feature-detect individual handlers and retain in-page controls. It cannot be treated as a promise that every mobile OS will keep the process alive. [R12]

Playback with sound is subject to browser autoplay rules. Start with an explicit user gesture, handle rejected play requests, and distinguish a pending request from actual playback. [R13]

Browsers throttle timers and often stop animation-frame callbacks in background tabs. That is why a continuous rendered edition is the proposed playback resource and hidden-tab animation is nonessential. On visibility return, recompute presenter, captions and media from the current media time. [R14]

A controlled local clip can use the same programme audio mix while its video is muted and aligned to a cue offset. A clip with original speech needs an explicit no-anchor-speech interval, correct captions and a verified return to narration. If it buffers, choose an honest pause/fallback instead of letting the narration describe footage the viewer never saw. Radio and Newsroom must share an audio-focus controller to prevent simultaneous speech.

Do not claim seamless playback through hard page reloads, killed tabs or OS suspension. Persist position and support a user-initiated resume. Test real desktop background playback and label physical mobile lock-screen checks as unperformed until done.

## 7. Critical constraint: YouTube is not a background/audio source

YouTube's Developer Policies prohibit isolating or modifying its audio/video components, applying alternative audio tracks, and offering a background player as described in the policy. They also prohibit obstructing player functionality and marks. [R15]

Consequently, Radio narrates **The Aggregator's own eligible script**, not extracted YouTube audio. For Newsroom, talking over footage uses original or independently licensed direct media with suitable transformation/display rights. A YouTube API player remains intact and foreground-visible, with commentary before or after and user activation when necessary. Do not mute and dub it into the programme, download it, put it behind another canvas, or treat an ordinary embed permission as a remix grant.

Display, synthesis, transformation, retention and broadcast use must remain separate permissions in the existing rights model. Original-source linking is required, but it is not a substitute for those rights. Real agreements and operating-market review remain owner/legal decisions, not outcomes of this technical research.

## 8. Captions, transcript and attribution are part of the feature

W3C guidance recommends planning captions, descriptive transcripts and accessible controls with the media itself, not adding them after production. Prerecorded synchronized video captions include dialogue and meaningful audio, not just a summary of the story. [R16, R17]

Provide an exact programme transcript with speaker labels, timestamps, current article/version, synthetic-presenter disclosure and a complete source list. The visual and spoken treatment must preserve uncertainty and attribution. Narration should communicate important visual-only facts, or descriptive text/audio must carry them. Use accurate sentence captions until better alignment is verified. Keep sources and transcript as accessible HTML even when the media fails.

A generated programme remains bound to its evidence and article version. Corrections/withdrawals must invalidate derivatives and new asset requests as well as the article card. Revoking new access cannot recall already downloaded media; the implementation must describe that limit honestly.

## 9. Membership that actually works locally

Preserve the existing opaque-session service, owner-scoped repositories and protected APIs. Use email-token account creation/sign-in, delivered through a loopback captured mailbox, so the owner can exercise a real browser authentication flow without a production email service.

Mailpit documents a single executable including Windows builds, an SMTP receiver, web mailbox and testing API. Its usual ports are 1025/8025, but the supervisor should resolve conflicts safely and bind them to loopback. Disable relay/forwarding. Capturing a message locally is not proof of external delivery or control of a real-world mailbox. [R18, R19]

OWASP's email guidance supports verifying ownership before activation, consistent normalization and limiting account-enumeration leakage. Use a hashed, expiring, one-use token; do not create provider-specific email aliases or expose a raw login link in the application API. [R20]

Preserve secure cookie/session lifecycle and server-side validation. Protect pre-authentication confirmation and authenticated writes against CSRF rather than relying only on SameSite. Use an explicit confirmation POST so link-preview GETs do not log in or consume a credential. The POST/scanner handling is a proposed design derived from these security principles, not an assertion that OWASP prescribes this exact application flow. [R21, R22]

A local captured-email session stays explicitly local-demo assurance and cannot grant staff or publishing access. If a future external OIDC login is chosen, use a maintained client with authorization-code/PKCE and proper response checks. The openid-client documentation provides that client boundary; no Google login is claimed configured here. [R23]

Persist member bookmarks, queue, progress and playback preferences, but retain anonymous reading/listening. Guest history should not be uploaded without a clear choice. Use neutral account terminology throughout the implementation; do not add a billing abstraction or pricing-dependent flags.

## 10. Making a long Codex run useful

OpenAI's current long-horizon guidance describes a plan → edit → test → observe → repair → update → repeat loop, with milestone acceptance and externalized project state. The runbook follows that pattern, extending the previous single-checkpoint stop instruction while retaining permission boundaries. This is a workflow recommendation, not a guarantee of overnight completion. [R24]

The recommended ten increments are: verify durable storage; establish additive contracts/design; finish reader discovery; build programme pipeline; generate real audio; build Radio; build solo/duo Newsroom; add local self-service sign-in; connect the member area; run integrated verification and leave a supervised demo.

A blocked Figma tool or optional provider must not stall unrelated local implementation. Paid generation remains disabled absent specific authorization. The owner should leave the machine powered/awake and the active Codex session able to run approved local commands. Do not turn off security protections to avoid prompts; resolve necessary permissions before the unattended run and record externally blocked work.

The honest desired outcome is a substantial **local functional alpha**. It is not live-source aggregation, production identity, real editorial staffing, distribution clearance, externally rendered photorealism, or public-release approval. A model/tool/runtime error can still limit progress. The final milestone report must show exactly which experience works and which does not.

## Source registry

The following are primary documentation, maintained standards guidance or original project sources. Software/provider capabilities can change; recheck before enabling production use.

- **R01 — Dqnamo, Cassette Audio Player / Kitchen.** `https://www.dqnamo.com/experiments/cassette-player` and `https://www.dqnamo.com/kitchen`
- **R02 — Kokoro primary repository and license context.** `https://github.com/hexgrad/kokoro`
- **R03 — Kokoro JavaScript README, generation/runtime/output.** `https://github.com/hexgrad/kokoro/blob/main/kokoro.js/README.md`
- **R04 — OpenAI, Text to speech.** `https://developers.openai.com/api/docs/guides/text-to-speech`
- **R05 — ElevenLabs, Create dialogue with timestamps.** `https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps`
- **R06 — MDN, SpeechSynthesisVoice.localService.** `https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService`
- **R07 — Rhubarb Lip Sync, primary README.** `https://github.com/DanielSWolf/rhubarb-lip-sync`
- **R08 — HeyGen, Audio to Video.** `https://developers.heygen.com/audio-to-video`
- **R09 — HeyGen, Transparent Background Videos.** `https://developers.heygen.com/transparent-background-videos`
- **R10 — HeyGen, Endpoint Version Comparison.** `https://developers.heygen.com/endpoint-version-comparison`
- **R11 — D-ID, Create a talk.** `https://docs.d-id.com/reference/createtalk`
- **R12 — MDN, Media Session API.** `https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API`
- **R13 — MDN, Autoplay guide.** `https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay`
- **R14 — MDN, Page Visibility API and background throttling.** `https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API`
- **R15 — YouTube API Services, Developer Policies, especially prohibited audio/video modification and background playback.** `https://developers.google.com/youtube/terms/developer-policies`
- **R16 — W3C WAI, Making Audio and Video Media Accessible.** `https://www.w3.org/WAI/media/av/`
- **R17 — W3C, Understanding Captions (Prerecorded).** `https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html`
- **R18 — Mailpit, Installation.** `https://mailpit.axllent.org/docs/install/`
- **R19 — Mailpit, Features and captured-message testing.** `https://mailpit.axllent.org/docs/`
- **R20 — OWASP, Email Validation and Verification.** `https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html`
- **R21 — OWASP, Session Management.** `https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html`
- **R22 — OWASP, Cross-Site Request Forgery Prevention.** `https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`
- **R23 — openid-client, maintained OIDC client documentation.** `https://github.com/panva/openid-client`
- **R24 — OpenAI, Run long horizon tasks with Codex.** `https://developers.openai.com/blog/run-long-horizon-tasks-with-codex`
