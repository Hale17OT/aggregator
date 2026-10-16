# Reader interest schema review

0001–0008 remain unchanged. 0009 extends existing topics and topic_follows, with a separate private onboarding/revision record. Stable seed keys map deterministically to UUIDs on first import; existing unmapped topics/follows are preserved. One explicit rule per target may optionally scope a team to a competition; changing that scope replaces that target rule. This is intentionally not multiple contradictory rules per target.

Topic edges and entity relations are distinct and database-kind checked. Serialized relation writes reject cycles; service validates the entire authored graph before transactional import. No runtime taxonomy mutation grant. Article classification is not an editorial approval or rights grant.

Member operations run inside existing verified session unit, account-before-session lock and transaction-local owner context. RLS covers interest state; existing follows RLS is retained. Expected revision guards an atomic selection/onboarding commit. Existing accounts receive legacy state without changing their preferences or follows; newly created accounts have implicit not_started until first save. No HTTP fixture issuer.

Upgrade procedure: attested retained custom dump and role inventory → distinct disposable restore → full ordered migrations → transactional seed → member hashes → actual non-owner API tests. Only then apply the same hashes to retained. Keep the dump private. Recovery is restore to a verified separate cluster and inspect, not destructive automatic rollback of retained data.

Research: official IPTC JSON inspected 14 October; released 2026-07-02, CC BY 4.0. Full payload not yet imported. Only the supplied checked football mapping is retained; other concepts remain explicitly authored/unmapped. Official Premier League Manchester City and UEFA pages identify the 2026/27 competition context. No roster expansion, logos, news or rights inferred.

## Additive review: 0010 and 0011

Original `article_topics` is article-bound, not revision-bound. The earlier 0009 comment claiming otherwise is incorrect and is retained unchanged as immutable migration history. 0010 adds exact `(article_version_id, article_id)` composite integrity to subject assertions, with classification revision and provenance. Authored fictional assertions mirror the exact JSON catalogue revisions; a changed version receives no inherited tags.

0011 removes the initial broad member read grant on raw assertions. Members/readers receive only the security-barrier `public_subject_index`, joined to current public article eligibility. Pipeline/editorial raw classifications remain private. No member can mutate taxonomy, raw evidence, permissions, approvals or publication pointers.

Each extension followed a new private backup, separate clone restore/full ordered upgrade and checksum/member-hash comparison before the retained transaction. Retained profile is now exactly 0001–0011; startup pins it explicitly rather than consuming future migrations. Full owned restart preserved eight member-state table hashes and the complete ledger; see `completion-full-restart.json`. The original private pipeline profile remains separate.
