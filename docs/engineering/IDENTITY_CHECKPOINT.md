# WP04 fixture session and member API checkpoint

The memory implementation below is the historical first checkpoint. The [13 October PostgreSQL increment](POSTGRES_IDENTITY_CHECKPOINT.md) adds durable repositories through the same access matrix and HTTP contracts. Memory remains a supported database-free mode.

This increment implements request authentication, explicit capability checks and owner-scoped operations through Express and the fixed Nuxt API path. It is bounded preparation for F10/F11/F12/F27/F28, FL07/FL08 and SC09/SC11/SC12, with limited WP13 API groundwork. It does not complete those flows/screens or WP04. The accepted presentation and anonymous SSR reader are unchanged.

## Access matrix and HTTP contracts

All API routes use `/api/v1`. Responses use the existing `{data,meta}` or `{error:{code,message,requestId}}` envelope. Member metadata says `fixture:true` with `persistence:"memory"` or `"postgresql"` for the actual configured adapter. Roles retain schema names: `reader`, `editor`, `publisher`, `curator`, `rights_reviewer`, `operator`, `administrator`. The small capability vocabulary below names the permitted operations; it does not replace the role model. Unknown capabilities deny. Administrator has no editorial bypass.

| Method / route | Required server capability | Ownership / behavior |
|---|---|---|
| GET `/articles`, `/articles/:slug`; GET `/health` outside API prefix | Public | Session-independent published projection; full sources remain anonymous |
| GET `/me/session` | `session:inspect` | Any valid active fixture session, current caller only; safe identity, expiry, fixture assurance and synchronizer CSRF token |
| POST `/auth/logout` | `session:logout` | Current session only; JSON `{}`; revoke verifier record and clear cookie; 204 |
| GET `/me/preferences` | `preferences:read` | `reader` role; server-derived caller only |
| PATCH `/me/preferences` | `preferences:write` | `reader`; strict patch plus expected `lockVersion`; stale version returns 409 |
| GET `/me/bookmarks` | `bookmarks:read` | `reader`; only caller's rows; safe current summary or unavailable tombstone |
| PUT `/me/bookmarks/:articleId` | `bookmarks:write` | `reader`; JSON `{}`; UUID resolves through public projection; 200, idempotent first saved version/date |
| DELETE `/me/bookmarks/:articleId` | `bookmarks:write` | `reader`; JSON `{}`; delete only caller's composite row, 204 even when absent |
| `/staff/**` | Unavailable | Anonymous 401; authenticated fixture reader or staff 403; no publishing handler exists |

Allowed preference fields: `theme` (light/dark/system), `textSize` (small/standard/large), `reduceMotion`, `homeMode` (editorial/following), `language` (only supported en) and validated IANA `timezone`. `lockVersion` is concurrency input; `updatedAt` is server-owned. At least one editable field is required. Unknown/ownership/role/capability/MFA fields reject with 422. The service repeats authorization and schema validation, so calling a repository helper is not the API's only enforcement. There is no user ID route parameter for preferences, no single-bookmark GET, and no cross-user list/count endpoint. Unexpected member query parameters reject. Deleting another member's article ID can only target the caller's own nonexistent row; it discloses nothing about the other member.

Bookmark storage retains article ID, original saved version and date. Responses re-evaluate the existing public projection on every read. Draft/withdrawn/rights-suppressed content is not returned; a previously saved unavailable item has `article:null,status:"unavailable"`. This is a private saved-item status, not authorization to read historical withdrawn text. Concurrent duplicate saves return one memory record. Durable cross-process uniqueness is later PostgreSQL work.

Errors: missing/malformed/unknown/expired/revoked credentials or inactive/version-invalid accounts return generic 401 `UNAUTHENTICATED`; denied capability 403 `FORBIDDEN`; origin/CSRF failure 403 `CSRF_REJECTED`; inaccessible/unimplemented resource 404; concurrency conflict 409; malformed JSON 400; oversized JSON 413; unsupported content type 415; unacceptable parsed payload 422; repository/validation failure 503 with Retry-After. No request payload, token or internal exception is echoed. The Nuxt allowlist may reject unsupported routes/methods before Express with 404/405.

## Session boundary and controlled bootstrap

`IdentityRepository`, `IdentityService`, `MemberRepository` and `MemberService` separate storage, verification, capabilities and owner-scoped behavior. Middleware obtains a request-scoped context only from a verified cookie. The service recognizes only contexts created by its own validator, then rechecks current account/session state. `X-User-ID`, role/capability/MFA headers and submitted IDs are never identity.

The non-HTTP `fixtureIssuer` requires explicit `mode:"local-test",nodeEnv:"test"` and refuses an actual production NODE_ENV. It allows only three known fictional IDs: A and B are distinct readers with independently owned preferences; the staff-denial fixture has publisher/administrator roles but no reader or staff assurance grant. Normal server startup never calls the issuer and refuses any `FIXTURE_SESSION_ISSUANCE` setting. No login/impersonation endpoint, account picker, hardcoded bearer or shared browser-accessible secret is installed.

Each issuance generates a new UUID selector plus 32 cryptographically random bytes (256-bit secret) with Node crypto. The returned bearer exists only in the trusted harness and HttpOnly cookie. Storage holds the SHA-256 secret verifier, not the bearer; secret verifiers are compared with `timingSafeEqual` after format/length validation. Random high-entropy session secrets do not require a password KDF. No password, JWT or cryptographic primitive was invented.

Records include owner, creation/last-seen/absolute-expiry times, revocation, idle timeout, account/session version and explicit `authenticationMethod:"fixture",assurance:"fixture-only",mfaVerifiedAt:null`. This never means verified email, OIDC or completed MFA. All fixture sessions use a conservative **30-minute idle / 12-hour absolute** lifetime, rather than claiming the proposed 30-day reader production policy. Tests use an injectable clock and test the exact expiry boundary without sleeping. Issuing another independent session always generates a fresh credential; supplied request credentials are never adopted.

Every validation reads current account status and session version. Trusted fixture account/role changes increment the version and invalidate existing sessions. Subsequent service authorization also rechecks state; unknown capabilities deny, and no staff capability is available under fixture assurance. Logout revokes only the current record; reuse fails. The fixture repository's revoke operation also supports controlled non-HTTP invalidation. A production role-management endpoint is not implemented; the later PostgreSQL checkpoint adds a trusted fixture account/role/version/audit transaction.

## Cookies, CSRF and Nuxt forwarding

Local API profile: expected origin `http://127.0.0.1:3000`, cookie `agg_session`, host-only (no Domain), Path=/, HttpOnly, SameSite=Lax, browser-session lifetime. HTTP is permitted only on explicitly checked loopback hosts outside production. HTTPS profiles use Secure and `__Host-agg_session`; production rejects HTTP even on loopback. `APP_ORIGIN` is the exact configured origin, not a request-provided host. Proxy trust/CORS wildcard exceptions are not enabled.

Cookie-authenticated mutations require all of: exact expected Origin, no cross-site Sec-Fetch-Site, a matching session-bound random synchronizer CSRF token in `X-CSRF-Token`, application/json and a valid bounded JSON body. SameSite is supplementary. Session inspection returns the CSRF nonce under no-store; it is not the session bearer and does not authorize a request without that session. Logout is POST with the same protection. GET never updates preferences/bookmarks or logs out (successful session validation does update internal last-seen time).

Nuxt forwards only allowlisted member/logout paths and methods to the configured loopback Express base. Query-supplied destinations, redirects and arbitrary hosts/paths are refused. Only the two recognized session-cookie names and explicit request security headers are forwarded; identity headers are discarded. Public article routes do not forward credentials, and no source/media provider receives them. Logout's Set-Cookie is forwarded back. Personalized API responses are `private, no-store` at Nuxt and `no-store` at Express, with no shared user state. Requests time out and fail closed when Express is unavailable.

No personalized SSR screen was added. Public SSR remains anonymous even when a cookie is present; tests verify no bearer in rendered HTML/Nuxt payload, JavaScript-readable cookies or web storage. Future personalized SSR must use request-scoped internal forwarding and serialize only safe member DTOs, never a bearer. See [Nuxt request-scoped fetch guidance](https://nuxt.com/docs/4.x/api/composables/use-request-fetch).

## Historical memory persistence boundary and proposed handoff

Accounts, hashed sessions, CSRF nonce, preferences and bookmarks are currently bounded memory fixtures. Restart loses sessions and member changes; fixture accounts/default preferences are recreated, with no sessions minted. A configured DATABASE_URL or non-memory adapter makes normal server startup fail, rather than silently falling back. No database target is connected by this increment. Migrations 0001–0004 and originals are unchanged.

Schema gap recorded for later additive review: session authentication method/assurance and account session-version revision are not columns in 0001. Idle expiry can derive from `last_seen_at` plus reviewed policy; absolute expiry maps to `expires_at`. CSRF lifecycle also needs a documented durable representation or established replacement. Do not rewrite migration history or pretend these runtime fields already persist. Future PostgreSQL adapters must preserve service contracts, atomic session/account-change semantics, idempotent bookmark uniqueness, optimistic preferences, and failure propagation.

Only verified server context may set transaction-local `aggregator.user_id`. Request-supplied IDs cannot select it; the custom GUC is not proof of authentication. Next bounded task: add justified schema fields in a new migration, implement the session/member repository adapters on the verified disposable PostgreSQL 18 target, and test pooled transaction context cleanup, cross-user concurrency and rollback under non-owner roles. Publication locking/outbox remains separate.

## Historical verification and limits

One reproducible command (supported Node, installed Chrome):

```powershell
./scripts/npm.ps1 run test:identity
```

It builds the application, runs real Express HTTP identity tests, and launches owned isolated Express/built Nuxt servers plus Chrome. Two sessions are provisioned by the trusted non-HTTP harness, never a login endpoint. No screenshot, trace, storage-state file or credential output is produced. Temporary servers and browser contexts are closed afterward. Browser cookie installation uses the harness; production login issuance and deployed HTTPS behavior are not claimed tested. Local Secure-profile configuration is unit tested.

Machine evidence: API checks (local-only evidence: `identity-api-checks.json`), browser checks (local-only evidence: `identity-browser-checks.json`). Additional checks are recorded in PROJECT_STATUS and VERIFICATION. No runtime dependency added or version changed; existing 11 high audit findings, 20 distribution-notice follow-ups and absent hosted CI remain open. External identity, email, MFA, full durable persistence, account UI, production assurance and publication are unavailable. This is not WP04 completion or release authorization.
