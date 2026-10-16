# PostgreSQL identity/member foundation — WP04

Current: five migrations plus durable session/member repositories are locally verified on PostgreSQL 18.1. Read the [13 October checkpoint](../../docs/engineering/POSTGRES_IDENTITY_CHECKPOINT.md) for the schema mapping, actual API startup, privilege matrix, transaction contract, cross-process evidence and limits. The first four migrations and original SQL remain unchanged.

`./scripts/npm.ps1 run test:identity:db` builds and runs the complete isolated PostgreSQL/Express/Nuxt/Chrome suite. `./scripts/npm.ps1 run test:db` retains the foundation migration/role checks. Both reuse the same verified disposable-target harness and stop their own cluster.

## Historical first database checkpoint

The unchanged reference is `docs/specs/engineering/001_launch_schema.sql`; provenance is recorded in `reference-provenance.json`. Ordered migrations are 0001 identity, 0002 sources/evidence, 0003 editorial/operations and 0004 isolation. The runner owns atomic transactions, checksummed history and advisory locking; unknown or changed applied migrations fail closed.

Run `./scripts/npm.ps1 run test:db`. PostgreSQL 18 binaries default to `C:/Program Files/PostgreSQL/18/bin` on Windows or `/usr/lib/postgresql/18/bin` on Linux; `PG_BIN` may override the binary directory. The harness always creates a fresh workspace cluster, verifies its identity before SQL, uses 127.0.0.1:55440, ignores ambient connection settings and stops its cluster in cleanup. It never adopts an existing database. Local trust authentication is restricted to disposable fictional tests. Data and logs remain under `.cache/`.

| Role | Granted boundary |
|---|---|
| agg_owner | NOLOGIN schema owner used only by the verified migration/test harness |
| agg_reader | SELECT on filtered public_article_index only |
| agg_member | Preferences, topic follows and bookmarks with ownership RLS |
| agg_worker | No data grants yet; later work must explicitly justify capabilities |

No application credentials are created. Test login roles only exercise these groups inside the disposable cluster. PUBLIC access/default function execution are revoked. RLS requires transaction-local `aggregator.user_id`; a future trusted service must derive it from authenticated identity. A custom SQL setting is not an authentication mechanism. Staff roles, sessions, private evidence and publication writes are not granted to reader/member roles.

The public index requires both current-version and article published states and exposes only index fields, not private evidence or a complete public DTO. It is not a substitute for rights, evidence, approval, withdrawal or Publisher service gates. Media's composite FK conservatively requires its rights grant to equal its exact source version's grant; an inconsistent upgrade fails rather than silently altering data. A future separate-grant model requires a reviewed migration.

PostgreSQL 18.1 checks pass: fresh four-migration install; populated 0003→0004 upgrade; idempotence/checksum drift/atomic rollback; 37 integrity assertions; six actual non-owner role groups. Evidence (local-only evidence: `../../docs/engineering/database-checks.json`). This supersedes the old PostgreSQL 17 reference probe.

The application still uses a disposable memory repository. The subsequent fixture-only application session/member boundary is documented in `docs/engineering/IDENTITY_CHECKPOINT.md`; it is not wired to this database yet. This schema groundwork does not implement external authentication, runtime persistence, publication locking/outbox or production migration deployment. [Full checkpoint and limitations](../../docs/engineering/FOUNDATION_CHECKPOINT.md).

## Local editorial engine profile — 14 October 2026

Migration0008 and the restricted agg_pipeline role are verified only on isolated test/pipeline targets. Retained member demo startup is pinned to0001–0007. Read [connected engine evidence](../../docs/execution/SOURCE_TO_DRAFT_ENGINE.md) before using editorial runners. No staff or publication authority is conferred.
