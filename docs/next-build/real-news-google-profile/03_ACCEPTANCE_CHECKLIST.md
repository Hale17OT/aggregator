# Acceptance checklist

72 criteria. Every criterion starts **NOT RUN**. A generated document or mocked test does not satisfy a live integration criterion.

Keep implementation, live-provider verification, owner consent, device tests and release approval distinct. Do not operate a real account deletion or revoke the owner’s provider access as a routine test.

## Console and preservation

- [ ] **CFG-01** — Actual existing console tab/project and client inventory are inspected; no unauthenticated replacement browser or unrelated project writes.
- [ ] **CFG-02** — Web origin and optional redirect bindings match the real app routes and configured security origin; no wildcard/guessed domain.
- [ ] **CFG-03** — Android applicationId and signing certificate fingerprint match the delivered flavor; APK file hash is not used as certificate identity.
- [ ] **CFG-04** — Android serverClientId and Google token audience use the correct web/backend client.
- [ ] **CFG-05** — iOS identifiers/configuration are derived from the existing project; native build/device work is not inferred from console creation.
- [ ] **CFG-06** — Only required basic identity scopes and necessary project-specific settings are changed; no billing/IAM/production-consent expansion.
- [ ] **CFG-07** — Client secrets/tokens/account screenshots are absent from source, frontend/APK, logs, captures and handoff.
- [ ] **CFG-08** — Original APKs, member data, migration history and 23 renditions/93 original media hashes remain preserved.

## Identity and linking

- [ ] **AUTH-01** — Signature, algorithm, issuer, audience, expiry and actual request binding are verified server-side before app-session issuance.
- [ ] **AUTH-02** — Wrong audience/issuer/signature/nonce, expired and replayed credentials cannot issue or link a session.
- [ ] **AUTH-03** — Second sign-in, logout/sign-in, canceled retry and account switch work within one native process without invalid singleton reinitialization.
- [ ] **AUTH-04** — Concurrent first Google sign-ins on web/native create one member identity and do not overwrite defaults/preferences.
- [ ] **AUTH-05** — The same Google subject resolves to the same member on both clients using separate protected app sessions.
- [ ] **AUTH-06** — Email/name matching alone cannot merge an existing or fixture member into a real Google account.
- [ ] **AUTH-07** — Explicit provider linking requires proof of the existing account and new Google identity, with uniqueness enforced.
- [ ] **AUTH-08** — Removing the last functioning login method is rejected; provider disconnect and app logout are distinct.
- [ ] **AUTH-09** — Google reader sessions cannot satisfy staff/MFA/publisher gates or derive authority from cloud-project roles.
- [ ] **AUTH-10** — Google/JWK calls occur outside database account locks; concurrency/lock-timeout paths fail safely without blind mutation retry.
- [ ] **AUTH-11** — Account disablement/revocation, canceled exchanges and obsolete responses cannot resume protected operations.
- [ ] **AUTH-12** — User-selected display name is preserved; provider email provenance is not fabricated as verified external-email delivery.

## Real web/native sign-in

- [ ] **CLIENT-01** — Actual GIS web button completes owner-assisted real Google verification and a server-issued app session.
- [ ] **CLIENT-02** — Web anti-login-CSRF/request binding, cookie attributes and exact origin policy remain enforced.
- [ ] **CLIENT-03** — Native Android button invokes official account selection, not an Aggregator website/Chrome/WebView login flow.
- [ ] **CLIENT-04** — Native account chooser success reaches backend verification and real Profile or first-account interests.
- [ ] **CLIENT-05** — No account, cancellation, required reauthentication and missing services have usable truthful outcomes without endless loops.
- [ ] **CLIENT-06** — Native session persists in approved secure storage and works after API/app restart; logout does not instantly auto-login.
- [ ] **CLIENT-07** — No password/MFA/CAPTCHA is automated or captured; personal identity screens are not included in review recordings.
- [ ] **CLIENT-08** — iOS official system authentication behavior and build/device evidence are independently reported, including unavailable tests.

## Optional native email-code completion

- [ ] **EMAIL-01** — Native email authentication ends with in-app code entry rather than requiring website confirmation.
- [ ] **EMAIL-02** — Code verifier, challenge binding, expiry, resend invalidation, attempt limits and rate limits are enforced server-side.
- [ ] **EMAIL-03** — Concurrent verification consumes a code only once; codes never appear in requesting-app responses or logs.
- [ ] **EMAIL-04** — Captured-mail testing is distinct from approved external delivery; no unconfigured sender is advertised as operational.

## Profile and cross-client preferences

- [ ] **PROFILE-01** — Both web and Flutter have a discoverable dedicated Profile destination, not only an overflow menu.
- [ ] **PROFILE-02** — Profile exposes account, interests, reading/appearance, media, sessions and privacy/data sections using real contracts.
- [ ] **PROFILE-03** — Google-connected account fields and member-editable display values have clear independent semantics.
- [ ] **PROFILE-04** — Existing hierarchical interest tiles, team/competition scopes, mutes, skip and onboarding state remain coherent.
- [ ] **PROFILE-05** — Profile preference edits on mobile appear on web, persist across restart and preserve unavailable rendition choices honestly.
- [ ] **PROFILE-06** — Pending/failed/conflicting saves retain drafts and cannot overwrite a newer account or profile revision.
- [ ] **PROFILE-07** — Session list/current-device labels are truthful; revoke-other-session actions are owner-scoped and recently authenticated.
- [ ] **PROFILE-08** — Export contains only the requesting member’s permitted data, no tokens/private source payloads, and has bounded delivery/cleanup.
- [ ] **PROFILE-09** — Deletion invalidates sessions and owned data according to policy; tests use disposable members and never the owner’s account.
- [ ] **PROFILE-10** — History clearing cannot be undone by a late playback-progress write; provider restore cannot silently recreate a deleted account.
- [ ] **PROFILE-11** — Avatar handling uses initials or validated provider data, not unrestricted image URLs or sensitive-data upload.
- [ ] **PROFILE-12** — Both themes, long names, keyboard/semantics, large text and narrow layouts are inspected; unavailable device/reviewer gates remain open.

## Live source acquisition and permissions

- [ ] **NEWS-01** — At least two suitable real providers are attempted through verified terms/permissions; actual successful coverage is reported.
- [ ] **NEWS-02** — Live intake performs real network requests and durable imports, not only copied fixtures or mocks.
- [ ] **NEWS-03** — Source permissions separately cover metadata, text/excerpts, reproduction, synthesis, visuals, narration and video.
- [ ] **NEWS-04** — Article-level exceptions, author/original-source attribution, primary-vs-independent status and media credits are retained.
- [ ] **NEWS-05** — Unlicensed or restricted providers are disabled with exact reasons; an API key/RSS endpoint is not treated as blanket permission.
- [ ] **NEWS-06** — Outbound source destination/redirect/DNS/connection checks reject private and metadata targets without disabling local app transport.
- [ ] **NEWS-07** — No Google credentials, member cookies, email or private headers are sent to news providers.
- [ ] **NEWS-08** — Payload type/size/decompression/deadline and safe parser limits reject hostile or incomplete material.
- [ ] **NEWS-09** — Conditional requests, provider quotas, 429/Retry-After, bounded retry and idempotent updates are tested.
- [ ] **NEWS-10** — Actual publication/update/fetch dates, canonical IDs and revisions survive restart without dates being refreshed artificially.
- [ ] **NEWS-11** — Correction/removal/rights expiry invalidate relevant editions/search/saved projections while keeping proper tombstones.
- [ ] **NEWS-12** — Live originals/links and private synthesized drafts have explicit distinct projections; no invented reviews or publication bypass.
- [ ] **NEWS-13** — Real multi-source candidates concern the same development; mirrors/reprints and an aggregator provider do not inflate independence.
- [ ] **NEWS-14** — The live worker is supervised and configurable, not a hidden OS background task or arbitrary-URL public endpoint.

## Real news in the product

- [ ] **READ-01** — Web Home and native Home show actually retrieved permitted source items in the existing newspaper composition.
- [ ] **READ-02** — Category/search/personalization/pagination operate on the live collection and remain stable and meaningfully tagged.
- [ ] **READ-03** — Publisher text, headline-only links, licensed adaptations and Aggregator synthesis are visibly and structurally distinguished.
- [ ] **READ-04** — Current real stories are not mixed with invented demo events or relabeled sample programme assets.
- [ ] **READ-05** — Source detail/original links and complete applicable attribution work on web/native, including anonymous SSR reading.
- [ ] **READ-06** — A real live source item can be saved using its stable typed identity and seen from the other client without fabricated article FKs.
- [ ] **READ-07** — No live-story Watch/Listen button plays an unrelated sample; retained recordings remain accurately labeled.
- [ ] **READ-08** — Transient provider failures show freshness/empty states, not silent fiction or expired-permission content.

## Final verification and handoff

- [ ] **FINAL-01** — Integrated Google/Profile/live-news journeys run against actual services; mock security tests are separately labeled.
- [ ] **FINAL-02** — Retained upgrades pass backup/clone/upgrade/preservation verification before mutation; no reset or checksum rewrite.
- [ ] **FINAL-03** — Web/native build and regression commands are recorded for the actual candidate; old failures are not relabeled.
- [ ] **FINAL-04** — A new main-entry signed-compatible APK is installed in place and its hash verified separately from instrumentation.
- [ ] **FINAL-05** — Console changes, current sources/use rights, item/date coverage, app routes and all remaining owner actions are documented safely.
- [ ] **FINAL-06** — Secret/dependency/license findings and existing performance/human/platform gates remain truthful; no automatic push/deployment.

