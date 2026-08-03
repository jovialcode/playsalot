-- Domain-first table naming: <domain>_<table>.
-- user domain: the canonical in-app identity, shared by guests and members.
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  profile_image_url TEXT,
  friend_code CHAR(8) NOT NULL UNIQUE,
  -- 'guest' (anonymous session) | 'member' (linked to an auth_identity or admin credential)
  account_type TEXT NOT NULL DEFAULT 'guest',
  -- Grants access to admin-only endpoints (see auth_credential / requireAdmin).
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- friend domain: an undirected friendship stored as two mirrored rows.
CREATE TABLE IF NOT EXISTS friend_relationship (
  user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX IF NOT EXISTS friend_relationship_friend_id_idx ON friend_relationship(friend_id);
