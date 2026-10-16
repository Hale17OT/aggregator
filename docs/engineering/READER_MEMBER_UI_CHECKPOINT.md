# Local reader discovery and member interface

Increment 3 / F01–F06 / SC01–SC05 now has twelve distinct fictional article IDs, version IDs and slugs across Culture, Climate, Science and Business. Eight original dispatches extend the existing four design fixtures. New stories deliberately use a text-only image decision; all have three distinct fictional evidence items and independently assigned, simulated reviewed origins. No real source retrieval or publication is implied.

`GET /api/v1/discover` accepts a 120-character query, desk slug, positive page and a maximum 24-item page size. Every request applies the current public projection before searching, counting or paging. Ordering is publication time then slug. This is bounded local fixture search, not PostgreSQL full-text ranking. Search, topic pages and pagination use restorable URLs. Forms and links work without JavaScript; hydrated navigation uses Nuxt routing to preserve the root audio host. Generic evidence inspection no longer shows shuttle-specific disputed counts on unrelated dispatches. Full article text and the version-wide bibliography remain server-rendered.

The member UI uses the existing member/session service and exact-Origin/synchronizer-CSRF path. Sign-in obtains a pre-auth nonce on the client, requests a fictional example.test address and uses a captured mailbox. The confirmation fragment is removed immediately, held only in memory and submitted only after an explicit button click. No credential is embedded in SSR, review screenshots or browser storage. A captured-mail account is local-demo assurance, not external email ownership or staff authorization.

My library operates on real bookmark, queue and progress APIs. Preferences preserve optimistic lock versions. Guest queues require an explicit import action; guest progress is never imported automatically. Progress synchronization is opt-in, revision-aware and throttled, with meaningful pause/seek updates. A conflict stops further writes rather than silently overwriting. Clear history stops new writes and drains an in-flight write before deleting account history; logout clears the root player’s personalized cache and revokes the server session.

## Evidence

- `./scripts/npm.ps1 test`: focused discovery/domain/API coverage, with all existing tests retained.
- `node scripts/check-discovery.mjs`: 28 passing checks: 18 reader journeys plus ten immediate-Back anchor restoration cycles, four widths (320/390/834/1440), both themes, JavaScript enabled/disabled, pagination and empty states. Results: `discovery-checks.json`.
- `node scripts/check-member-demo.mjs`: captured-mail browser flow, non-authenticating preview, explicit confirmation, bookmark and preferences writes, queue, actual audio progress on pause, real API-process restart against the same retained database, progress deletion, link replay, second-account isolation and logout. Results: `member-demo-checks.json`.
- Add `--capture` to the member command for actual safe public/member captures at 390/1440 in both themes. Token pages are never captured. These checks require the supervised retained demo on 127.0.0.1:3000/4000 with Mailpit on 127.0.0.1:8025.
- `node scripts/build-product-review.mjs` assembles existing captures and measured narration evidence into `output/review/product-review.html`. Media is referenced through the running application, not copied to a static review URL.

Chromium automation is not a physical-device, full accessibility or human listening review. Owner visual approval remains pending for new screens. The Figma status tool reported no Desktop Bridge connection (transport none, WebSocket unavailable, port 9223); no native frames were created or modified. Original accepted frames and controls were preserved.
