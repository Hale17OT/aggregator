# Short-form candidate: independent review 2

Second read-only source/artifact/evidence pass on 2026-10-16. No product edits or build/device/browser operations. This is not a whole-journey rerun, subjective listening assessment or owner acceptance.

Independently rehashed the stable main APK: **964c451e13625a464b989359f3b96eb02c3e8736e0b9c50223efcb2bfb28af78**, unchanged from review 1. Current reviewed source hashes are in `docs/engineering/shortform-review2-source.json`. Native product files in that review set remain unchanged; web ClipFeed changed following the earlier finding. Therefore these are two passes over the same native APK, but **not two passes over unchanged web source**.

## Repaired web paths

Owner initialization now resets previous-owner progress and immediately allows ordinary local resume caching again; explicit history clearing still suppresses it, while deliberate playback reenables local caching. Owner/history-epoch checks still protect awaited history and persist results. This resolves the specific source path reported in review 1.

Save now waits for member-session checking and bookmark loading, requires the article slug to match the current clip, and guards completion against owner/bookmark epoch changes. The reviewed CSS reserves 180px below the picture and places captions at bottom 118px, with a 44px seek target. These are source observations plus saved geometry results, not independent visual acceptance by this reviewer.

## Raw results inspected

Read `output/shortform-rebuild/verification/web/results.json`: three successful functional runs with no recorded errors, plus viewport geometry records. Read member results: all three runs record actual Save readback, shared Library, unsave, no false success after injected failure, and anonymous Sources. Read failure results timestamped 12:53:48 UTC: rejected play, 20 item transitions, 20 route exits, actual pointer-seek Escape rollback, injected Web Share cancellation, and finite sixth-clip end checks. These are inspected saved executions, not reruns; historical failed attempts remain separately preserved.

The previously inspected native three-run mixed-journey XML and 37-unit-test log remain relevant to the unchanged native source/APK with the existing instrumented-entrypoint caveat. A subsequent guest regression log reports successful execution; it is not represented here as main-entry APK byte-identical testing.

## Preservation and artifact scope

Compared actual `preservation-before.json` and `preservation-after.json`: retained database system identifier and migration/checksum list match. The after report records 23 renditions and 93 original assets. Its explicit scope permits added member rows and excludes sessions/progress because normal sign-in/playback mutates them; it must not be described as a byte-identical whole database. Original APK remains preserved as independently verified in review 1.

Review 1 inspected actual packaged manifest, loopback policy and seven unchanged notice/license hashes. The APK is unchanged in this pass. No new short-form-specific full APK credential-pattern report was present in the inspected engineering report directory at this pass; do not relabel the older flutter-closeout `apk-final.json` as covering this different artifact. Full payload scan, if subsequently supplied, needs this exact new hash.

## Remaining limitations

Native Share reports opening the chooser and explicitly does not verify delivery. It does not distinguish chooser cancellation from selection/delivery; this remains a platform integration limitation rather than a successful-cancellation claim. Native static metadata/actions still rebuild under fast controller updates, so progress isolation remains incomplete and no performance acceptance follows from functional passes. Physical Android/iOS, TalkBack, subjective listening, owner acceptance and measured performance failures remain separate gates. No new demonstrated P0/P1 is asserted by this bounded second pass; it is not release authorization.
