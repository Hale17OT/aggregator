-- Do not expose classifications of unpublished versions through a broad member grant.
REVOKE SELECT ON article_subject_assertions FROM agg_member;
CREATE VIEW public_subject_index WITH (security_barrier=true) AS
SELECT s.article_id,s.version_id,s.topic_id,s.relevance,s.classification_revision
FROM article_subject_assertions s JOIN public_article_index a ON a.id=s.article_id AND a.version_id=s.version_id;
GRANT SELECT ON public_subject_index TO agg_member,agg_reader;
