-- The original article_topics table is article-bound, not revision-bound.
-- Keep that history intact; exact material associations live here.
CREATE TABLE article_subject_assertions (
 article_id uuid NOT NULL REFERENCES articles(id),
 version_id uuid NOT NULL,
 topic_id uuid NOT NULL REFERENCES topics(id),
 relevance text NOT NULL CHECK(relevance IN ('primary','supporting','context')),
 classification_revision text NOT NULL CHECK(length(classification_revision) BETWEEN 1 AND 120),
 provenance text NOT NULL CHECK(length(provenance) BETWEEN 1 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(version_id,topic_id),
 FOREIGN KEY(version_id,article_id) REFERENCES article_versions(id,article_id)
);
-- Author-only writes. Public article eligibility remains a separate projection/gate.
GRANT SELECT ON article_subject_assertions TO agg_member;
