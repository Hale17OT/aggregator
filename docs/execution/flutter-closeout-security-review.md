# Native bridge architecture review — 16 October 2026

Status: independent agent source inspection and design review only. No product code changed, no SQL executed, no services started, no authentication or migration test claimed. Reviewed master brief section 8 and the current files named below. This is not owner acceptance, penetration testing, or production authentication certification.

## Existing security boundary

- `apps/api/src/local-auth-http.ts`: `/api/v1/auth/preflight`, `/auth/request`, `/auth/confirm`. Request and confirmation require the exact configured web Origin, a unique HttpOnly pre-auth browser cookie, synchronizer verifier, JSON, and no query parameters. Captured SMTP is fixed to loopback 1025 and fictional `example.test` recipients. GET preview never signs in.
- `packages/db/migrations/0006_local_reader_auth.sql`: request and redemption are database functions. Redemption binds the browser hash, locks the challenge, creates/reuses the unique normalized account, rejects non-reader roles, consumes the challenge and issues the browser session in one transaction. The resulting assurance is explicitly `captured-mail` / `local-demo`, never verified external email or MFA.
- `packages/domain/src/identity.ts`: `IdentityService` authenticates opaque selector/secret sessions, verifies token hashes, account/session version, absolute and idle expiry, revocation and status. Its private WeakSet prevents caller-created `AuthContext` objects; staff capabilities remain unavailable. **There is currently no transport/client distinction in `SessionRecord`.** Reusing this credential unchanged in a new bearer route would permit transport substitution unless the validator is extended.
- `packages/db/src/member.ts`: `PostgresMemberUnit` attests the target and restricted `agg_api_login` role, opens one transaction/connection for the request, and responds only after commit. `PostgresMemberRepository.touchSession` sets transaction-local owner identity only after bearer verification. Session SQL locks account before session. Preserve that order and do not issue a second repository connection for authenticated operations.
- `apps/api/src/member-http.ts`: cookie-only web transport, exact Origin + synchronizer CSRF for writes; shared `MemberService`, revisions for interests/preferences/queue/progress, programme eligibility checks and publication projection. `/staff` is denied. `apps/web/server/utils/member-proxy.ts` is the existing browser proxy boundary; it must not become a native-cookie translator.
- `apps/web/app/pages/sign-in.vue` and `auth/confirm.vue`: explicit browser confirmation, fragment removal, existing account onboarding, no localStorage credential. Native handoff must integrate with this flow without putting a bearer/email token into a callback or review capture.

## Proposed minimum bridge

Paths below are proposed names, not existing endpoints or implementation claims.

1. `POST /api/v1/native/auth/start`: strict bounded JSON, fixed registered local client and exact callback, S256 challenge and random state. Reject cookies/Authorization and browser Origin on this native-only operation; rate-limit durable issuance. Native is a public client: the client identifier is an allowlist key, not proof of identity. Return a short-lived pending request identifier and a fixed-origin external-browser authorization URL. Do not accept arbitrary URLs or redirect chains.
2. A dedicated `/auth/native` browser page reads the request identifier, establishes the normal browser preflight/CSRF context, and binds pending authorization to that browser through a server operation. Continue through the existing captured-mail request and explicit confirmation. Keep the pending context across that browser navigation (a noncredential request identifier can be stored in sessionStorage); do not expand the existing return-path validator to arbitrary URLs. A fixed internal native-completion destination or narrowly validated continuation is sufficient. New and existing accounts must both be exercised.
3. `POST /api/v1/auth/native/approve`: **browser transport only**, existing session authentication plus exact Origin/CSRF. Display the account and native-client name and require explicit approval. Bind the pending request/browser/account/client/challenge/callback together. Do not silently authorize whatever previously signed-in browser account happens to exist. The server, not a submitted user ID, chooses the account from `AuthContext`. An existing authenticated browser still needs explicit approval. Cancel leaves no native session.
4. Return a short-lived random one-use handoff code and the original state to the exact registered callback. A callback intercepted by another app must remain unusable without the verifier. Keep the code out of page screenshots, analytics and logs; clear callback state promptly. Native validates exact scheme/host/path, no duplicate/unexpected fields, matching state and a live pending request before exchange. Cancellation/process restart must not accept unsolicited callbacks.
5. `POST /api/v1/native/auth/exchange`: strict JSON containing pending identifier, code, verifier, client and exact callback; no cookies/Origin or arbitrary bearer. Validate S256 (`BASE64URL(SHA256(verifier))`), not this repository's hex helper by accident. In one transaction lock/revalidate the account, pending authorization and session state, consume code and issue a distinct native session. Account suspension, version change, expired originating browser session and revoked pending authorization must fail. Never consume and issue in separate transactions. Failed attempts have a bounded durable limit and must not be rolled back along with the rejection.
6. `Authorization: Bearer <selector.secret>` is accepted only on `/api/v1/native/me/...` and native logout through an explicit native façade. No fabricated Origin, no cookie forwarding, no global CSRF exemption. Reject mixed credentials and duplicate Authorization headers. Reuse the same member operation dispatcher/contracts and one `PostgresMemberUnit` transaction, rather than maintaining a divergent implementation. Explicit transport selection is a server configuration, not user input. Web routes must reject native transport; native routes must reject web transport. Native transport has no staff capability and must not rely only on an untrusted prefix.
7. Flutter stores the bearer and pending verifier/state in reviewed platform-backed secure storage (or keeps pending values memory-only and safely cancels after process death). Storage failure fails closed, with no SharedPreferences/plaintext fallback. Disable credential backup/export, redact exceptions and routes, never attach credentials to publisher/source/media redirects. Fixed loopback services are local-demo only; release variants reject the configuration.

This follows the external-user-agent and public-client principles in [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252), and the verifier/challenge exchange in [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636). It is a narrow local bridge, not a claim of OAuth/OIDC compliance.

## Additive schema and role changes to review

- Add session `transport` (`web` default for all retained sessions, or `native`) and nullable fixed `native_client_id`, with a consistency CHECK. Preserve existing authentication method/assurance and all existing rows. Return these fields from `lookup_fixture_session`; extend `SessionRecord` and `IdentityService.authenticate` with required expected transport/client, checked **before** session touch and owner context establishment. Fixture test defaults must explicitly stay web.
- Add a dedicated native authorization table rather than broadening email challenge purpose/return-path semantics. Fields cover request ID, registered client/callback, S256 challenge, state, browser binding, account/version and authorizing session, creation/expiry, code verifier, approval/consumption/cancellation. Bound counts, lengths and expiry in database constraints and functions; raw codes and bearer values are not persisted.
- Grant only narrow SECURITY DEFINER functions to `agg_session_runtime`, with `search_path=pg_catalog`, qualified object references, PUBLIC execute revoked and no API direct table read/write grant. Make approval functions verify current authenticated transaction owner, account and originating session; a submitted account UUID is not authorization. New table should have no general runtime grants and should be covered by RLS policy review. Keep `agg_pipeline`, staff and maintenance capability boundaries untouched.
- Session and authorization lock ordering must be documented against the existing account-before-session rule. Avoid authorization-row → account lock in exchange while approval/logout uses account → authorization. Two-process exchange, approval/revocation race and session-version-change tests are required.
- Inspect actual migration ledger and checksums before choosing next number. Existing `scripts/db-migrations.mjs` enumerates **all numbered SQL files**; do not infer a private/retained exclusion from stale seven-migration documentation. `scripts/apply-reader-upgrade.mjs` is pinned to earlier evidence/backup and is **not safe to rerun unchanged** for this migration. Build a fresh backup/clone/upgrade preservation record and verify a fresh disposable install before retained application.

## Tests and harness reuse

| Scope | Existing foundation | Required extension |
|---|---|---|
| Native and web identity contracts | `tests/member-contract.ts`, `scripts/check-identity.mjs`, `scripts/check-identity-db.mjs` | Valid native identity; cookie/bearer cross-transport rejection; mixed credentials; expired/revoked/version mismatch; staff denial; same ownership/revision semantics |
| Fresh and upgraded PostgreSQL | `scripts/disposable-database.mjs`, `db-migrations.mjs`; prior backup/clone reader-upgrade scripts | New ordered migration, retained checksum prefix, backup restore, unchanged member row hashes, restricted function grants, RLS, two API processes exchanging one code |
| Real captured-mail browser | `scripts/check-member-demo.mjs`, `check-refinement-members.mjs` | Existing/new account browser→callback flow; GET preview remains unauthenticated; wrong browser fails; explicit account approval; web/native refetch round trip |
| Adversarial PKCE | New test runner using the actual router/services/PostgreSQL, not only helper tests | Wrong verifier/state/client/callback; duplicate callback fields; expired/consumed code; simultaneous exchange only one success; cancellation; malicious deep link; abandoned request; code not exchanged by GET |
| Persistence and pending-write safety | Current identity DB/member tests | Native session survives API restart; process death/restart and secure-store failure; logout during write; two owners; revision conflict; no old-owner data restored after session switch |
| Browser security regression | Existing exact-Origin, CSRF, strict JSON, fixture issuer rejection tests | New façade must not change web failures or permit native session passed as `agg_session`; browser session passed to bearer route must fail |
| Artifact/network boundary | Existing secret-canary/worktree scanner | APK/config/log scan, no secret callback recordings, no credential forwarding to source hosts/redirects, production rejects local-demo endpoints |

## Blocking risks before a verified claim

1. No transport binding exists today: a naïve bearer wrapper would be a new P1 security defect.
2. Reusing memberRouter by manufacturing Cookie/Origin/CSRF headers violates the brief and conceals the trust boundary.
3. Browser confirmation continuation and native explicit approval must not bypass onboarding or select a different account silently.
4. An in-memory pending-code store loses restart/concurrency guarantees; use PostgreSQL and atomic consumption.
5. Relying on the private-use callback scheme alone permits interception; verifier/state checks remain mandatory. Local cleartext loopback is a documented device-debug trust assumption, never production transport security.
6. Existing `example.test` captured mailbox assurance remains a local demonstration; session transport does not upgrade it to real email verification, human editorial approval, MFA, or release readiness.

All runtime, device, migration and adversarial checks in this document are NOT RUN by this reviewer. A follow-up review must inspect the actual implementation and test evidence before changing that status.

## Independent implementation review — first candidate, 16 October

Reviewed the actual new migration/router/identity/member mapping, browser continuation, Dart client and Android manifests, plus `scripts/test-native-auth.mjs`, `scripts/test-native-upgrade.mjs` and their raw reports. This review did not execute tests or mutate the retained database. The reports at `docs/engineering/flutter-closeout/native-auth.json` (00:24:36Z) and `upgrade.json` (00:24:10Z) record passing isolated HTTP/SQL and fresh/clone upgrade checks. Those are implementer-run tests inspected independently, not reviewer-executed tests or a device/browser journey.

Candidate fingerprints (SHA256):

- `0012_native_reader_handoff.sql`: `15a62d996400d3d4ecaa5c8499ff7a6e37f42d7ee4103e2c80b7e445b4907592`
- `native-auth-http.ts`: `1a9cbc215daac17ead3dbb3d83a12338dd0036d2ec361ab1b45f65d14ba3ba66`
- `apps/mobile/lib/member.dart`: `25afd05e0f95d311613a0946d4a3f068e0e32704236f56429bf2d6b92d2c1df4`
- `apps/mobile/lib/data.dart`: `bc49a52001495bb6729814a068fc262847aecc14a52b2cd3fe480b26b8475272`

### Findings requiring repair

**SEC-01 — P1: an operation can be sent under a different account from the one that initiated it.** `Api.request` captures `generation` at line 58, awaits `_client.openUrl`, then reads mutable `credential` at line 72. If A starts a preferences/bookmark/interest write and B signs in while the connection is pending, the request sends A's body with B's bearer. The response generation check at line 86 occurs after the server mutation and cannot undo it. Snapshot the credential before the first await; check generation immediately before sending headers/body and abort stale requests. Never retarget an existing operation to a new identity. Add a deterministic delayed-open transport test that switches accounts and asserts no B mutation is transmitted.

**SEC-02 — P1: a pending sign-in can resurrect authentication after logout/cancellation.** `MemberState.callback` awaits secure-storage write at line 110 and then unconditionally installs the credential, loads the session and navigates to Library. Logout can clear state/delete storage during that await; callback then reinstates its session, and ordering can also leave a saved token behind. `signIn` likewise has no operation identity protecting its delayed start response from overwriting a newer pending request or cancellation. Use a dedicated auth operation generation/serialization spanning API, secure storage, session inspection and navigation; invalidate immediately when logout or a newer flow starts. Do not delete a newer session when cleaning a stale callback. Add delayed storage and delayed exchange tests for logout, overlapping flows and account switch.

**SEC-03 — P2: secure-store deletion failure leaves the UI uninformed and may restore an old credential later.** `logout` clears memory, then awaits `storage.delete` outside a catch/finally before notifying listeners. A plugin failure escapes without publishing signed-out state or a storage-remediation error; if server revocation also failed, the saved token may authenticate on next launch. Always publish the cleared state, distinguish unconfirmed server revocation from failed local credential removal, and do not claim a complete durable sign-out. Test injected delete failure and restart handling.

**SEC-04 — P2: callback validation accepts an unregistered explicit port.** `callback` validates scheme/host/path but not `u.hasPort`; `aggregator-local://auth:123/callback?...` passes. PKCE/state still limit abuse, but this violates exact callback matching and creates an unnecessary alternate accepted URI. Reject explicit ports and add malformed authority tests. The Android filter does not replace application validation.

**SEC-05 — P2: native-auth pool handling loses the existing ambiguous-COMMIT discard invariant.** The raw pool branch in `native-auth-http.ts` lines 18–22 has no client-error listener or `committing` guard, unlike `PostgresMemberUnit.run` and local-auth. If COMMIT throws and ROLLBACK returns, it releases the connection as healthy and does not distinguish unknown commit outcome. Preserve the existing guarded transaction pattern, never report success before commit, discard on ambiguous commit/client error, and record issuance as unknown rather than claim rollback. The existing success tests do not inject this failure.

**SEC-06 — P2 product/auth-journey gap: first-account interest setup is bypassed.** Web confirmation now returns to native approval before its normal first-use check; successful native callback always navigates to Library. Neither branch in the reviewed candidate ensures the required first-account native interest setup/Skip journey. Read the actual interest status after native session inspection and route appropriately without changing account identity or fabricating completed setup.

### Positive findings, bounded to inspection

- Sessions now have explicit transport/client fields; `IdentityService.authenticate` checks transport before token touch/owner establishment. The shared member dispatcher has native-only bearer validation, rejects mixed cookie/Origin credentials and duplicate Authorization headers, and keeps browser CSRF checking intact.
- Code exchange is one database transaction with account → originating session → pending locks. It rechecks account/session version, status, expiry, revocation, challenge and code; replay/concurrent redemption has one winner in the inspected test. New native sessions remain captured-mail/local-demo and cannot use staff routes.
- Browser bind and explicit approval use existing preflight/member CSRF and browser binding. The account name is displayed at approval. The callback contains code/state rather than email token or bearer. Exact fixed client/callback constants are validated on start/exchange.
- New-table direct reads are denied to the four tested restricted roles. The upgrade report preserves eight table hashes and existing sessions default to web. This supports the tested schema operations, not an unrestricted security verdict.
- Android main manifest disables backup/cleartext; the localDemo overlay permits only 127.0.0.1 cleartext and registers the narrow callback. No microphone/location/contact permission was observed. iOS main Info.plist has no callback scheme in the inspected file: iOS configuration/flow remains unverified and may need a local-only configuration.

### Evidence gaps before native authentication can be VERIFIED

The isolated auth test obtains a browser session by calling the real SQL challenge/redemption functions, not by operating captured mail/browser UI. It does test actual HTTP start/bind/approve/exchange and member persistence, but does **not** exercise external browser confirmation, Android callback delivery, storage, Flutter state matching or process death. Its concurrent exchange uses two requests on one API process, not the requested multi-process case. No expiry, revoked-origin session, account-version race, wrong-browser approval, secure-storage failure, rate-limit persistence or late-identity-write test appears in this runner. Add those cases and the actual browser/device journey; keep missing platform checks separate. Existing passing reports must remain preserved rather than relabeled as this broader coverage.

Verdict: **repair SEC-01 and SEC-02 before accepting native account flows**. This review found no demonstrated need to alter old migrations or bypass existing web authentication. The remaining findings and missing adversarial/device evidence prevent a blanket security-complete claim. Retained migration application is an integrator decision after the schema/transaction fixes and fresh clone revalidation; no retained SQL was run by this reviewer.

## Repair review — second candidate

Read the updated `data.dart`, `member.dart`, `native-auth-http.ts` and `test/auth_lifecycle_test.dart`. This remains source inspection; the reviewer has not executed the Dart tests or inspected a newly captured passing Dart test report. The integrator reports the retained upgrade applied after the fresh/clone checks; this reviewer did not perform or independently attest that mutation.

- SEC-01's identified cross-account send defect is **repaired in inspected source**: bearer and generation are captured before `openUrl`, stale opened requests are aborted before headers/body, and headers use the captured bearer. Require the delayed-open test before calling it automatically verified.
- SEC-02's original delayed-write/logout resurrection sequence is **repaired in inspected source** by auth epochs and serialized storage with stale completion cleanup. The supplied Dart test targets that specific sequence. A separate remaining ordering defect is below.
- SEC-03 now catches secure-store deletion failure and notifies the user. The post-logout UI has no explicit retry-sign-out control while `session == null`, although the error asks the user to retry sign-out. Provide a reachable cleanup retry/recovery action if that error occurs. A failure-injection test is still needed.
- SEC-04 explicit callback ports are rejected in source. The new test's name mentions unsolicited state, but its body tests only the explicit-port case; add an independent wrong-state assertion rather than claiming that name as coverage.
- SEC-05 now discards on COMMIT exception with a committing flag. A pool client error listener is still absent in this raw branch; retain the existing transaction pattern for unexpected client error events as well. No ambiguous-COMMIT test is shown.
- SEC-06 now queries real interest status and routes new native users to `/interests`; implementation addressed, actual onboarding/Skip journey still awaits execution.

**SEC-07 — P1 lifecycle ordering: late old logout deletes the newly signed-in account's durable credential.** Updated `logout` invalidates memory immediately but waits for `retiring.request('/auth/logout')` before queuing `storage.delete`. During a slow or failed old-session revocation, the now-visible Sign in action can complete a new account callback and persist its credential. The old logout then queues unconditional deletion behind that new write, deletes the new credential and overwrites the new flow's error state. The in-memory session can remain signed in while secure storage is empty, losing durable sign-in on restart. This is a reproducible operation ordering from source, not an executed device result.

Repair by queuing local deletion immediately as part of logout's synchronous invalidation, before any remote await; queued subsequent sign-in writes then follow it. Capture the logout epoch, and ensure late remote/storage failure messages do not overwrite a newer flow. Alternatively use serialized compare-and-delete against the exact retiring credential, with the same UI epoch rule. Do not guard deletion solely on current epoch if that can leave the retiring credential persisted when the new sign-in is abandoned.

Required race cases for the next test pass:

1. Delay A's remote logout response; sign in and persist B; release A's response. Assert B remains in memory and secure storage and A's completion does not change B's error/navigation state.
2. The same sequence with A revocation failure and with local deletion failure; show distinct errors only for the still-current operation and maintain a reachable cleanup action.
3. Delay initial `start` response for A, start B, then return A success/failure. Only B may own pending ID/verifier/state; an old `signIn` catch currently has no epoch check and can overwrite the current error message.
4. Delay A exchange/storage, begin B, then release A. A must not install state, navigate, remove B storage or become the credential used by B operations. Any orphan server session from a cancelled successful exchange must remain bounded/expiring and preferably be explicitly retired; do not call cancellation server revocation unless actually performed.
5. Inject duplicate callback, wrong state, explicit port, secure-store write/delete failure and delayed member session response. Assert no cross-owner UI data or credential restoration after cancellation/logout.

The two present Dart tests use a fake API, and `TestApi.forRevocation()` returns the same object rather than the independent snapshot transport used in production. They cannot currently reproduce SEC-07's delayed independent revocation or SEC-01's real HTTP open race. Extend the harness accordingly. No broad native authentication acceptance is given by this repair review.

## Repair and listening-consent review — third candidate

Inspected current `member.dart`, `data.dart`, `listening_sync.dart`, `preferences.dart`, `native-auth-http.ts`, main wiring and `auth_lifecycle_test.dart`. No device/browser journey or test execution was performed by this reviewer.

Prior repairs now observed:

- SEC-07's late-delete ordering is addressed: local credential removal is queued before remote revocation and late logout messages are epoch guarded. The new test uses a separately delayed revocation fake and checks the later credential survives; it still manually creates flow B rather than exercising the browser/native sign-in journey.
- Stale `signIn` error completions are epoch guarded. Signed-out Library exposes `Clear local sign-in again` for storage failure recovery. Wrong-state callback now has an explicit negative assertion.
- Raw native auth pool client installs/removes an error listener and discards clients on error or ambiguous COMMIT. These are inspected source repairs, not a reviewer-executed fault-injection result.

**SEC-08 — P1: clear-history can delete the next account's data after an await.** The Preferences clear handler awaits `listeningSync.clear()` and only then invokes `api.request(DELETE /me/progress)`. `clear()` waits for an existing progress write. If A clicks Clear, then logs out/signs in as B while that write completes, the later DELETE snapshots B's credential. The corrected per-request API generation check cannot help because this new request begins after the identity change. Capture owner and API generation at the start of the whole clear operation and check them before DELETE; preferably move clear/drain/delete into one owner-bound `ListeningSync.clearHistory` service operation. Navigation/unmount is not sufficient: the asynchronous handler continues even after its widget is gone. Add a delayed-progress/account-switch test asserting no DELETE for B.

**SEC-09 — P1: stale consent refresh can resume progress writes during history clearing.** `ListeningSync.clear()` sets `consent=false` but does not invalidate the refresh generation/history epoch. A refresh already awaiting preferences/listening can complete during or after clearing and restore `consent=true`; then the next position event can recreate the deleted progress. Also a preference save remains enabled during Clear because that handler never sets `busy`; its `historyChanged()` listener can start a new refresh during clearing. Add a separate monotonically increasing sync-operation epoch plus an explicit clearing/suppressed state that refresh cannot override. Freeze writes, invalidate refresh, drain the old pending write, perform the owner-bound delete, then deliberately define when future progress is allowed again. Do not silently reset the user's saved listening-history preference. Test both a delayed refresh and simultaneous preference-save completion around DELETE.

**SEC-10 — P2: current clear-history flow permanently disables this instance's syncing without explaining that state.** With no racing refresh, `clear()` leaves `consent=false` and never refreshes because owner/historyRevision are unchanged. A user whose durable `listeningHistory` remains true will stop receiving further progress until an unrelated preference change/account change/restart. Define and expose the intended policy: suppress the current playback after clear, then resume only on a deliberate new play, or explicitly refetch consent at a documented boundary. Avoid automatic immediate resaving of the just-cleared position.

**SEC-11 — P2: old local resume positions survive clear-history/logout.** The reviewed flow clears only `ListeningSync.revisions` and server history. `MediaCoordinator.videoPositions` remains populated, including exact positions loaded from account queue/history in `preferences.dart`. Neither clear-history nor logout clears/owner-scopes that map, so returning to the same video can reuse a removed or prior-account position. Preserve current playback continuity as required, but clear or owner-key the history-derived resume cache and ensure a delayed old controller completion cannot repopulate it. Test A stored video position → clear/logout → B/guest open same rendition.

**SEC-12 — P2: response bodies lack a deadline, and caption size is checked only after full buffering.** `Api.request` times out open/response headers, but its response `await for` has no timeout. `captions` joins the entire response before applying its 1 MB limit, with no body deadline. A stalled/malformed local service can hang member operations and `ListeningSync.clear()` indefinitely or exhaust memory for captions. Bound body time and size incrementally, abort/close on timeout, report uncertain write outcomes honestly, and do not automatically retry mutations. Existing 4 MB JSON counting counts decoded characters rather than input bytes; make the documented limit match the implementation.

Suggested focused tests, outside device claims:

1. A progress write held pending; A Clear starts; logout and B sign-in complete; release progress. Assert no B DELETE, no owner-cache reset affecting B, and no success toast for A after unmount.
2. Hold a consent refresh with `listeningHistory=true`; start/complete Clear; release refresh; emit position. Assert no recreated history until the chosen explicit resume boundary.
3. Preference opt-out save and pending progress race: actual service must reject any progress transaction occurring after saved opt-out; client discards buffered work and does not revive it on later refetch. Preserve 409 HISTORY_DISABLED semantics.
4. Clear while a preferences save completes and while account logout occurs. Assert clearing is serialized/disabled in UI and old callbacks cannot set new-account sync state.
5. Slow/chunked body and over-limit caption tests assert bounded rejection, aborted transport, no uncontrolled retry and a recoverable UI state.

SEC-08/09 remain blocking for the affected account/history flows in this inspected candidate. Earlier repaired findings stay recorded as historical failed candidates, not erased. Device auth, actual secure storage, background audio and cross-client journeys remain separate gates.

## Reviewer-executed deterministic listening tests

Added only `apps/mobile/test/listening_sync_test.dart`; no product edits by this reviewer. Tests instantiate the production `ListeningSync` and `MemberState`, replacing HTTP and platform playback with explicitly controlled fakes. They do not prove PostgreSQL behavior, real media playback, secure storage or device interaction.

Verified command from `apps/mobile/`:

```powershell
. ../../scripts/flutter-env.ps1
flutter test test/listening_sync_test.dart --no-pub --dart-define=LOCAL_DEMO=true --reporter expanded
```

Result: **3 passed**, raw output `docs/engineering/flutter-closeout/security-listening-test-second.txt`.

1. A clear started while its progress write is pending cannot send a DELETE after credentials switch to B.
2. A consent refresh started before Clear cannot restore its stale consent afterward.
3. A newly triggered preferences refresh while DELETE is in flight cannot enable consent or issue another progress write.

This successful run includes the integrator's additional `clearing` flag and write/refresh suppression, which were added after the prior source finding. Production file `listening_sync.dart` SHA256 at inspection immediately after the run: `0265f16174b904a1d854f2d5193a7d44d0b2c7ac923313c5168e310a9664d98d`. Test SHA256: `98011b482e94d5121d4f34803bf990d917b58c6b6d17fe34d89ef2b2bf6b9ffe`.

The first attempt is preserved in `security-listening-test-first.txt`: an incomplete test fake lacked the newly used `videoPositions` property and left the pending test future unresolved. The reviewer interrupted that owned test process and added the missing fake property before rerunning. This was a test setup failure, not a demonstrated product failure; it is not erased or reported as a pass.

SEC-08/09's specified deterministic races are now **VERIFIED AUTOMATICALLY** on that source snapshot. Remaining limitations: intentional post-clear consent suppression still needs truthful UI and a deliberate resume policy; preference changes during suppression and real service opt-out races need their own journeys; clearing a map does not prove late video-controller disposal cannot repopulate it. No blanket account/media/security or device acceptance follows from these three tests.

## Reviewer-executed isolated adversarial HTTP/PostgreSQL verification

Added `scripts/test-native-auth-adversarial.mjs` with its own test-only child entry. It starts two separate API OS processes on dynamic loopback ports, against a newly created and repeatedly attested disposable PostgreSQL 18 target on 55440. It never uses the retained manifest or mutates retained data. Both test API children and disposable PostgreSQL were stopped by the runner; a subsequent listener check found no listener on 55440.

Verified command from repository root:

```powershell
. ./scripts/stability-env.ps1
& $aggregatorNode --import tsx scripts/test-native-auth-adversarial.mjs
```

Final run at `2026-10-16T00:56:27.247Z`: **7 groups PASS**, raw sanitized report `docs/engineering/flutter-closeout/native-auth-adversarial.json`.

- Two distinct API processes exchanging the same code simultaneously yield exactly one 200 and one 401; subsequent replay fails.
- Mixed/cross cookie and bearer transport, wrong client, wrong callback authority, extra exchange-state field and wrong verifier fail; callback echoes the original state exactly.
- Expired pending request and expired approved code both reject, with no consumed code and no native session for that account.
- Originating browser logout through the real protected HTTP route prevents later exchange; account session-version invalidation before exchange also prevents issuance.
- Native logout and account-version invalidation after issuance reject protected native reads/writes on the other API process.

Fingerprints at final inspection:

- Test script: `ee2b93953708dd4b546abf9d9db9228e9ea2e32345131c758f46c3aa9df191f8`
- Native HTTP router: `fac33185d94fcd9e67af9f7482ed80e9e15351d60779f642f93f6befddef5e02`
- Migration 0012: `15a62d996400d3d4ecaa5c8499ff7a6e37f42d7ee4103e2c80b7e445b4907592`

Scope remains precise: browser sessions are created by test-only SQL calls to real captured-mail challenge/redemption functions. This is actual service/repository/PostgreSQL verification, **not** a real captured-mail browser or Android flow. Flutter callback-state rejection is tested in the separate Dart lifecycle test; the exchange API deliberately has no callback-state parameter. No credentials, code/verifier values, private URLs, mailbox contents or account details are written into this report. No product or schema edits were made by this reviewer.

## Later source-only lifecycle sweep

Read the latest member, reader, preferences, media, players and HTTP client source during the integrator's endurance run; no competing build/device operation was started.

- SEC-12's unbounded body issue is addressed in inspected source by a shared incremental byte-limited body reader with a total deadline and stream cancellation; captions use the same bounded reader. Network fault injection remains separate.
- Account-history Radio handoff now checks captured API generation, media epoch, programme and error after loading and before seeking/navigation. New radio/video play ownership captures API generation so an older account's continuing playback is not automatically recorded to a newer account.
- Clear-history UI now states that saving preferences resumes opted-in progress. This clarifies the previously unexplained suppression without silently changing durable consent.

**SEC-11 remains OPEN in this sweep:** `ProgrammeVideo.dispose` writes its position back into `media.videoPositions` without testing account or history generation. Consequently the account-change/clear code can empty the map, then route teardown repopulates it with the old account's controller position. Capture the owner/history generation when the controller becomes eligible for resume caching; require it to remain current on disposal. Keep intentional guest-to-guest paused navigation behavior. Validate clear/logout while a video controller is alive, then dispose it and reopen the same rendition.

**SEC-13 — P1 exact-rendition persistence defect:** `ProgrammeVideo.progress()` passes `widget.programme.raw['renditionKey']` to `ListeningSync.write` even though the playing resource is `programme.video['url']`. The programme's root key identifies the audio rendition; prepared video has its own `videoRendition.renditionKey`. The server accepts both identities, so this mismatch does not necessarily raise an error: it can save the video's clock under the audio recording identity. Use the actual playing video rendition key and test that the saved progress retains that exact key through refetch/resume; do not copy seconds across unrelated scripts or pass because both keys are syntactically accepted.

**P2 source observation:** `FormatLinks.open` checks the media epoch after `loadRadio` but, unlike the repaired account-history handoff, does not inspect `media.error.value`. `loadRadio` catches load failure internally. A failed format load can therefore proceed to seek/navigation instead of its safe error state. Add the same concrete loaded-programme/error check; test a rejected source load without substituting old playback. No runtime reproduction was performed for this observation.

These findings were sent to the integrator while the candidate remained editable. They are not evidence that the latest owner/device gate failed, nor do prior passing guest instrumentation tests cover them.

## Reviewer-executed video identity/cache repair tests

Added only `apps/mobile/test/video_identity_review_test.dart`. Six widget tests use the real `ProgrammeVideo` widget and `VideoPlayerController`, with an explicit fake native video platform and fake HTTP/member/media coordination boundaries. They exercise actual widget mount, initialized controller notifications, disposal and retry; they do not decode a real video or prove device playback.

Verified from `apps/mobile/`:

```powershell
. ../../scripts/flutter-env.ps1
flutter test test/video_identity_review_test.dart --no-pub --reporter expanded
```

Final result: **6 PASS**, raw output `docs/engineering/flutter-closeout/security-video-test-repaired.txt`:

1. Live controller disposal after a changed history operation cannot restore its old position.
2. Live controller disposal after changed account generation cannot seed the next owner's resume cache.
3. Unchanged guest navigation still preserves a paused position under the actual video rendition key.
4. Playing video emits the actual video key, never the distinct audio key; changed account generation suppresses old-account progress.
5. Delayed initialization does not restore a cache position from before the history epoch changed.
6. Explicit retry after controlled initialization failure captures the current account/history epochs and can preserve a new position.

The first five-test pass is preserved in `security-video-test-first.txt`. Adding retry initially failed because the fake `PlatformException` omitted the message that this installed video_player expects; the log `security-video-test-final.txt` preserves that test-fixture failure. Supplying a realistic error message in the fake (without product changes) yielded all six passes. These are not renamed or weakened expectations.

SEC-11 and SEC-13 are **VERIFIED AUTOMATICALLY for these widget boundaries** after the integrator's repairs. Actual PostgreSQL progress persistence, real decoding/device lifecycle and owner listening remain separate. Source review also confirms `FormatLinks.open` now checks loaded programme/error before seeking, and AccountQueue rejects progress whose rendition key does not match its intended current media. Those additional source checks were not independently exercised by this widget file.
