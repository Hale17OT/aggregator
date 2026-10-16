-- WP04: only the dedicated bootstrap provisions these NOLOGIN capability roles.
-- Database membership is not application identity or Publisher authorization.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE agg_owner REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE agg_owner REVOKE ALL ON TABLES FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO agg_reader, agg_member;

-- A supplied media grant must belong to the exact evidence version it illustrates.
ALTER TABLE source_item_versions ADD CONSTRAINT uq_version_grant UNIQUE (id, rights_grant_id);
ALTER TABLE media_assets ADD CONSTRAINT fk_media_version_grant
  FOREIGN KEY (source_version_id, rights_grant_id) REFERENCES source_item_versions(id, rights_grant_id);

-- A minimal read foundation, not the complete public DTO or a publishing service.
-- Neither drafts nor withdrawn versions can be selected through this view.
CREATE VIEW public_article_index WITH (security_barrier=true) AS
SELECT a.id, a.slug, v.id AS version_id, v.version_number, v.headline, v.deck, v.published_at
FROM articles a JOIN article_versions v ON (v.id=a.current_version_id AND v.article_id=a.id)
WHERE a.status='published' AND v.state='published';
GRANT SELECT ON public_article_index TO agg_reader;

-- Future trusted middleware must set identity only after authenticating a session.
-- A SQL client can set custom GUCs: this is defense-in-depth, NOT authentication.
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_owner ON user_preferences TO agg_member
  USING (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid)
  WITH CHECK (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
CREATE POLICY follows_owner ON topic_follows TO agg_member
  USING (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid)
  WITH CHECK (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
CREATE POLICY bookmarks_owner ON bookmarks TO agg_member
  USING (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid)
  WITH CHECK (user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences, topic_follows, bookmarks TO agg_member;
-- No grant to users, sessions, challenges, user_roles, editorial/evidence tables,
-- public pointer writes, audit mutation, migration history, or worker operations.
