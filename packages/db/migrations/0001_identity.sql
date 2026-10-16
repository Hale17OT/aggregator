-- WP04: ordered extraction of the preserved launch reference. Transaction owned by runner.
-- Minimal account identity; no inferred sensitive attributes.
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text UNIQUE,
  email_verified_at timestamptz,
  display_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleting','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Bind a verified identity-provider subject to one member.
CREATE TABLE auth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, subject)
);

-- Revocable first-party sessions; raw bearer values are never stored.
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  mfa_verified_at timestamptz,
  revoked_at timestamptz,
  CHECK (expires_at > created_at)
);

-- Single-use passwordless sign-in challenges.
CREATE TABLE auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  purpose text NOT NULL CHECK (purpose IN ('sign_in','link_identity','reauthenticate')),
  return_path text,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fixed application capability bundles.
CREATE TABLE roles (
  code text PRIMARY KEY,
  name text NOT NULL,
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- Audited staff and reader role assignments.
CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code text NOT NULL REFERENCES roles(code),
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);

-- Presentation preferences and explicit home mode.
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  text_size text NOT NULL DEFAULT 'standard' CHECK (text_size IN ('small','standard','large')),
  reduce_motion boolean NOT NULL DEFAULT false,
  home_mode text NOT NULL DEFAULT 'editorial' CHECK (home_mode IN ('editorial','following')),
  language text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'UTC',
  lock_version integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Versioned consent decisions rather than one mutable checkbox.
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  anonymous_key_hash text,
  purpose text NOT NULL,
  policy_version text NOT NULL,
  granted boolean NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(user_id, anonymous_key_hash) = 1)
);
