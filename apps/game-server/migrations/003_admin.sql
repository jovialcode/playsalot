-- auth domain: username + password credentials, used by admin accounts that log
-- in without a social provider. One credential per user_profile (id/password login).
-- password_hash is a scrypt digest ("scrypt$<salt>$<hash>"), never a plaintext password.
CREATE TABLE IF NOT EXISTS auth_credential (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_credential_user_id_idx ON auth_credential(user_id);
