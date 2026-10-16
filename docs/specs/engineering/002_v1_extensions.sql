-- Optional V1 only; not needed for launch. Apply after 001_launch_schema.sql.
BEGIN;
-- Explicit communication opt-in; not enabled at launch.
CREATE TABLE notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  cadence text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('daily','weekly')),
  timezone text NOT NULL DEFAULT 'UTC',
  quiet_start time,
  quiet_end time,
  confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotent future digest/alert deliveries.
CREATE TABLE notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email')),
  edition_key text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','suppressed','failed','ambiguous')),
  provider_message_id text,
  idempotency_key text NOT NULL UNIQUE,
  article_version_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  UNIQUE (user_id, channel, edition_key)
);

-- Quarantined reader suggestions, never direct fetch commands.
CREATE TABLE source_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url text NOT NULL,
  reason text NOT NULL,
  article_id uuid REFERENCES articles(id),
  status text NOT NULL DEFAULT 'quarantined' CHECK (status IN ('quarantined','reviewing','accepted','rejected','duplicate')),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
