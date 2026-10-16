# WP04 PostgreSQL identity/member checkpoint — 13 October 2026

Implemented and locally verified PostgreSQL-backed session/member repositories through the existing Express API and fixed Nuxt path. This continues F11/F27 (WP04), with bounded F10/F12 and WP13 member groundwork. It does not complete external identity, staff MFA, account UI, source services, publication locking/outbox, WP04 or release gates. Presentation and migrations 0001–0004 are preserved.

## Durable mapping and migration

`0005_member_sessions.sql` is additive. Fresh five-migration installation and populated 0004→0005 upgrade pass. Existing topic/account rows are preserved. Legacy sessions are retained but revoked because their old rows lack assurance and CSRF invariants; no verified email, OIDC or MFA proof is backfilled. A failed migration rolls back both DDL and ledger; repeat application is a no-op and checksum drift is rejected. The unchanged 54-table launch foundation still passes 37 integrity assertions and six role groups. Migration evidence (local-only evidence: `database-checks.json`).

| Runtime field | Durable representation |
|---|---|
| Account session version | New `users.session_version`, nonnegative integer |
| Issued account version | New `sessions.account_version`, nonnegative integer |
| Selector / secret verifier | Existing `sessions.id` UUID / `token_hash`; raw bearer never stored |
| Authentication method / assurance | New `authentication_method` / `assurance`; active fixture records require `fixture` / `fixture-only` |
| MFA | Existing `mfa_verified_at`; active fixture records require NULL |
| Creation / absolute expiry / activity / revocation | Existing `created_at`, `expires_at`, `last_seen_at`, `revoked_at` |
| Idle expiry | New bounded `idle_timeout_ms`, evaluated against last-seen |
| CSRF | New `csrf_token`, independent random 256-bit synchronizer nonce stored as 64 hex characters |
| Preferences / concurrency | Existing columns, including `lock_version` and `updated_at`; no duplicate fields |
| Bookmarks | Existing `(user_id,article_id)` primary key and same-article saved-version FK |

The CSRF nonce is deliberately recoverable by the trusted session lookup so the existing inspection contract works after restart and across instances. It is distinct from the session secret/verifier and cannot authenticate by itself. It is not a browser-local bearer, URL parameter, log entry or exported storage-state artifact. Active-session constraints require a valid verifier and CSRF representation, ordered timestamps, fixture-only assurance and no MFA claim. Revoked legacy records may retain their old metadata for inspection. The existing unique verifier and session/user indexes remain sufficient for selector lookup; no redundant index was added.

Fixture sessions retain 30-minute idle / 12-hour absolute lifetimes. Issuance and last-seen clocks are server-controlled; the trusted test clock is not selectable by requests. Activity uses `greatest(last_seen_at, observed_at)` with expiry/revocation/account-version checks. A process restart neither reissues sessions nor extends absolute expiry.

## Privileges and pre-authentication lookup

| Database role | Purpose and boundary |
|---|---|
| `agg_bootstrap` | Disposable-cluster bootstrap only; creates fixed roles/database, verifies target and seeds prerequisites |
| `agg_owner` | NOLOGIN migration/table/function owner; no application membership. Harness grants read-only server-setting/control-function access needed for target attestation |
| `agg_api_login` | Actual non-owner runtime; inherits `agg_member` and `agg_session_runtime`; no superuser, BYPASSRLS, CREATEDB, CREATEROLE, owner membership, private table reads or publication writes |
| `agg_session_runtime` | Execute only selector-scoped lookup/touch/revoke and target-attestation functions; no direct session/account table privileges |
| `agg_member` | Existing owner-filtered preferences/follows/bookmarks grants and RLS; no broader grants added |
| `agg_maintenance_login` / `agg_fixture_maintenance` | Separate trusted non-HTTP fixture provisioning/account maintenance; narrow account/session/role-row/audit grants; never inherited by API |

The server cannot set member identity before it has verified a session. Ordinary member RLS privileges therefore cannot perform the initial lookup. `lookup_fixture_session(uuid)` is a bounded SECURITY DEFINER boundary, not a table-reading API: one selector yields only validation-required session fields and minimal account/role state. It never returns email, arbitrary private tables or verifier details to HTTP clients. Touch/revoke have fixed SQL and selector arguments, not caller-selected object names or arbitrary statements. Runtime cannot insert sessions.

Functions are owned by the controlled NOLOGIN owner, use fixed `search_path=pg_catalog`, qualify all application objects, and revoke PUBLIC execution. Only the dedicated role gets required execution. Member-only connections cannot call lookup. Read-only target attestation exposes cluster identity to the local runtime so it can verify its configured target. No user-supplied ID, role, capability or MFA flag replaces session verification.

The privileged seed path creates only fictional members, fixed schema role names and the minimal article/cluster/version graph needed by bookmark FKs. Database article/version prerequisites stay **unpublished**; no rights, evidence, approval, public-pointer or Publisher gate is bypassed to publish them. Public article responses still come from the existing fictional, publication-safe memory projection. Database-backed member persistence is not integration of the entire news database.

## Transaction and invalidation contract

`MemberUnitOfWork` surrounds the complete protected request. Express parses bounded JSON, then the PostgreSQL unit acquires one client, checks target/role identity, begins a transaction, and supplies both repository interfaces on that same client. It creates request-scoped identity/member services. Authentication, capability and CSRF checks plus owner-scoped operation all finish before commit; HTTP success and logout's clearing cookie are sent only after confirmed commit.

The lookup locks the **account first, then the session**. Trusted account/role maintenance follows the same account-first order. Locks remain held through the operation. Account changes update status/roles, increment the account version and append an audit event in one transaction. An operation serialized before invalidation may complete; one ordered after committed invalidation cannot use the old session. Revocation does not retroactively cancel responses already sent. Tests use explicit barriers and observed PostgreSQL lock waits for the races.

Only after the existing service verifies the bearer hash does the adapter use parameterized `set_config('aggregator.user_id',$1,true)` on the same client. Services still enforce capabilities; RLS is defense in depth. The custom GUC is trusted service context, not independent proof of authentication, and the runtime SQL credential is not intended for browser clients. Missing and empty settings both deny member rows.

Preference UPDATE checks the submitted expected version and increments it in the same statement. A stale edit returns 409, never an unconditional retry. Bookmark INSERT uses the existing composite unique key and `ON CONFLICT DO NOTHING`; conflict-and-read uses a separate READ COMMITTED statement, retaining the winning saved version/date. DELETE remains caller-scoped and idempotent. Per-account locking currently serializes member activity for that account; no scalability claim is made.

Connection acquisition is bounded at 600 ms, lock waits at 1 second, server statements at 2 seconds, driver queries at 3 seconds and idle transactions at 5 seconds. These are local verification settings, not production tuning. Success commits and verifies that transaction-local identity cleared. Failure rolls back and checks the connection; unusable or ambiguous-commit connections are discarded. No automatic mutation retry is performed. A COMMIT transport error may be uncertain and returns failure; it is not described as a proven rollback. The maintenance adapter also uses one checked-out client, target verification and safe release/discard handling.

## API and configuration

The [existing access matrix](IDENTITY_CHECKPOINT.md#access-matrix-and-http-contracts), roles, HTTP envelopes, strict preference allowlist, CSRF/origin and cookie semantics remain. Routes implemented in both modes:

- GET `/api/v1/me/session`; POST `/api/v1/auth/logout`.
- GET/PATCH `/api/v1/me/preferences`.
- GET `/api/v1/me/bookmarks`; PUT/DELETE `/api/v1/me/bookmarks/:articleId`.

Member responses say `meta.fixture:true` and accurately report `meta.persistence:"memory"` or `"postgresql"`. Health identifies the member adapter. Public routes remain anonymous and independent of identity/database failures. Staff stays unavailable. Saved items are re-projected on every read; withdrawn/private content becomes a tombstone, never a historical access grant.

Database-free reader development:

```powershell
./scripts/npm.ps1 ci
./scripts/npm.ps1 run dev
```

This defaults to explicit memory fixture mode; no sessions are automatically issued. Web: http://127.0.0.1:3000 ; API: http://127.0.0.1:4000/health . It creates no database connection.

Complete database-backed verification (PostgreSQL 18 binaries and Chrome installed):

```powershell
./scripts/npm.ps1 run test:identity:db
```

This builds, extends the existing disposable harness, installs five migrations, seeds fictional prerequisites, starts separate API processes and a built Nuxt process, exercises persistence/concurrency/browser behavior, and stops its owned processes and cluster. It uses a fresh `.cache/pg18-UUID` on 127.0.0.1:55440; stopped data remains available for inspection, never reused by a later run. `PG_BIN` can select a PostgreSQL 18 binary directory, not an existing target.

Internally, actual `apps/api/src/server.ts` starts with `PERSISTENCE_ADAPTER=postgresql`, `DISPOSABLE_DB_TARGET=<harness-created runtime-target.json>`, `FIXTURE_POOL_SIZE=1`, `NODE_ENV=test` and exact `APP_ORIGIN`. The manifest contains no bearer or password. It binds purpose, real workspace directory, cluster system identifier, loopback address/port and allowlisted `aggregator_identity` database. Every runtime connection is attested before work. Ambient PG variables cannot redirect the harness; driver host/port/database/user/options are explicit. DATABASE_URL is rejected. Invalid/missing target, wrong role, connection failure or query failure cannot select memory. Database mode is rejected in production; local trust authentication is a disposable fixture setting, not a deployment recipe.

Do not manually point this profile at another cluster or treat the stopped test manifest as authorization to reuse it. The test command provisions sessions through the existing non-HTTP issuer using the separate maintenance adapter. No login-as-user endpoint, account screen or staff permission bypass exists.

## Evidence and remaining gates

Database identity evidence (local-only evidence: `identity-db-checks.json`) records 14 verification groups, including:

- An actual API process stops and a new process reuses the same session, preference version/timestamp, bookmark version/date and CSRF nonce without reseeding; revoked credentials remain invalid.
- Two independent API processes share session/member state, observe logout/account invalidation, and produce one 200 / one 409 for competing preference edits and one durable row for duplicate saves.
- A size-one pool uses the same backend PID across A/B, missing/empty identity and rollback; failed member updates leave no mutation; killed connections are replaced.
- Account/role/version/audit failure rolls back completely; lock-controlled operations respect invalidation ordering. HTTP pool exhaustion and lock timeout fail within bounds and recover.
- Runtime role/private table/publication restrictions; idle/absolute expiry; nondecreasing last-seen; unavailable bookmark tombstones and cross-owner delete isolation.
- Real Chrome through built Nuxt/Express verifies database metadata, cookies, no-store, CSRF, logout, no credential serialization and anonymous no-JS full bibliography. Database connection denial returns protected 503 while public articles remain available.

The identical shared member contract runs against memory and PostgreSQL. Memory-only identity suite remains separate: 11 groups / nine browser checks. All tests total 21. A fresh source-snapshot npm ci, lint, typecheck, tests, build and worker run passes with the new lockfile unchanged (installation evidence (local-only evidence: `reproducible-install.json`)). Existing reader suites, migration checks, secret scanning and CI static validation are recorded in PROJECT_STATUS/VERIFICATION. No database crash at the precise COMMIT acknowledgement boundary, restore drill, production load test, deployed HTTPS browser profile or hosted CI run is claimed.

Dependency changes: exact `pg@8.23.1` runtime and `@types/pg@8.23.1` development dependency, MIT; no ORM/framework downgrade. Reviewed [node-postgres transaction guidance](https://node-postgres.com/features/transactions), [pool/release documentation](https://node-postgres.com/apis/pool), and installed licenses. Fifteen lock entries added. Inventory: 844 locked / 770 installed, 22 installed metadata-only notice follow-ups (the new two are `pg-types` and `pgpass`, MIT). Audit remains **11 high, zero critical**, with no new pg advisory in this audit. Existing braces/node-forge findings remain blocking; audit enforcement is unchanged. Audit (local-only evidence: `dependency-audit.json`), [license inventory](dependency-licenses.json), [notice bundle](THIRD_PARTY_NOTICES.txt).

Next bounded backlog task: WP04/F11 single-use `auth_challenges` persistence and fixture-only consumption tests for expiry/replay and unverified account-link rejection. External email/OIDC delivery and staff MFA require their own authorized implementation and assurance review. Do not expose a fixture impersonation endpoint. This task is identified only; it was not started in this increment.
