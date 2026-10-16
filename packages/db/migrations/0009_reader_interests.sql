-- Reader completion: additive metadata and explicit private interests. No source/publication grants.
ALTER TABLE topics ADD COLUMN concept_key text UNIQUE;
ALTER TABLE topics ADD COLUMN concept_kind text NOT NULL DEFAULT 'topic' CHECK(concept_kind IN ('topic','competition','team','organisation','person','place'));
ALTER TABLE topics ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(metadata)='object');
CREATE TABLE concept_relations (
 from_id uuid NOT NULL REFERENCES topics(id),to_id uuid NOT NULL REFERENCES topics(id),
 relation text NOT NULL CHECK(relation IN ('broader','sport','part_of','participates_in')),
 context jsonb NOT NULL DEFAULT '{}'::jsonb,PRIMARY KEY(from_id,to_id,relation),CHECK(from_id<>to_id)
);
CREATE FUNCTION validate_concept_relation() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE a text;b text;
BEGIN
 PERFORM pg_advisory_xact_lock(18091409);
 SELECT concept_kind INTO a FROM public.topics WHERE id=NEW.from_id;
 SELECT concept_kind INTO b FROM public.topics WHERE id=NEW.to_id;
 IF NOT ((NEW.relation='broader' AND a='topic' AND b='topic') OR
 (NEW.relation='sport' AND a IN ('team','competition') AND b='topic') OR
 (NEW.relation='part_of' AND a='team' AND b='organisation') OR
 (NEW.relation='participates_in' AND a='team' AND b='competition')) THEN RAISE EXCEPTION 'Invalid relationship kinds'; END IF;
 IF NEW.relation='broader' AND EXISTS(WITH RECURSIVE parents(id) AS(SELECT NEW.to_id UNION SELECT r.to_id FROM public.concept_relations r JOIN parents p ON r.from_id=p.id WHERE r.relation='broader') SELECT FROM parents WHERE id=NEW.from_id) THEN RAISE EXCEPTION 'Topic cycle'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER concept_relation_valid BEFORE INSERT OR UPDATE ON concept_relations FOR EACH ROW EXECUTE FUNCTION validate_concept_relation();
-- Existing follows stay intact; new rules use the same owner/topic relationship and optional scope.
ALTER TABLE topic_follows ADD COLUMN action text NOT NULL DEFAULT 'follow' CHECK(action IN ('follow','mute'));
ALTER TABLE topic_follows ADD COLUMN competition_id uuid REFERENCES topics(id);
ALTER TABLE topic_follows ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE interest_states (
 user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'not_started' CHECK(status IN ('legacy','not_started','in_progress','completed','skipped')),
 revision integer NOT NULL DEFAULT 0 CHECK(revision>=0),hidden_stories uuid[] NOT NULL DEFAULT '{}',
 updated_at timestamptz NOT NULL DEFAULT now(),CHECK(cardinality(hidden_stories)<=200)
);
INSERT INTO interest_states(user_id,status) SELECT id,'legacy' FROM users;
ALTER TABLE interest_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY interests_owner ON interest_states TO agg_member
 USING(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid)
 WITH CHECK(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
GRANT SELECT,INSERT,UPDATE,DELETE ON interest_states TO agg_member;
GRANT SELECT ON topics,concept_relations TO agg_member;
-- Existing article_topics is revision-bound. Classification remains an editorial assertion, not permission.
