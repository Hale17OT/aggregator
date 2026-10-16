-- RNM-F05: private reader listening state. No public analytics or media cache input.
ALTER TABLE user_preferences ADD COLUMN playback_speed numeric NOT NULL DEFAULT 1 CHECK(playback_speed IN (0.75,1,1.25,1.5));
ALTER TABLE user_preferences ADD COLUMN anchor_count integer NOT NULL DEFAULT 1 CHECK(anchor_count IN (1,2));
ALTER TABLE user_preferences ADD COLUMN narration_voice text NOT NULL DEFAULT 'prepared' CHECK(narration_voice='prepared');
ALTER TABLE user_preferences ADD COLUMN media_treatment text NOT NULL DEFAULT 'narration_over_visual' CHECK(media_treatment IN ('narration_over_visual','clip_then_comment'));
ALTER TABLE user_preferences ADD COLUMN listening_history boolean NOT NULL DEFAULT true;
CREATE TABLE listening_queues(user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, programme_ids jsonb NOT NULL DEFAULT '[]', revision integer NOT NULL DEFAULT 0 CHECK(revision>=0),updated_at timestamptz NOT NULL DEFAULT now(),CHECK(jsonb_typeof(programme_ids)='array' AND jsonb_array_length(programme_ids)<=50));
CREATE TABLE listening_progress(user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,programme_id text NOT NULL,rendition_key text NOT NULL,position_ms integer NOT NULL CHECK(position_ms>=0),duration_ms integer NOT NULL CHECK(duration_ms>0 AND position_ms<=duration_ms),completed boolean NOT NULL,revision integer NOT NULL DEFAULT 0 CHECK(revision>=0),updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,programme_id));
ALTER TABLE listening_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_queue ON listening_queues TO agg_member USING(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid) WITH CHECK(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
CREATE POLICY member_progress ON listening_progress TO agg_member USING(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid) WITH CHECK(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
GRANT SELECT,INSERT,UPDATE,DELETE ON listening_queues,listening_progress TO agg_member;
