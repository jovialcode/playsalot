-- auth domain: one row per external social login linked to a user_profile.
-- A single user can link multiple providers; (provider, provider_user_id) is unique.
-- nickname / profile_image_url are stored NOT NULL here because we always require
-- them from the provider at login time (the original, as-received values).
CREATE TABLE IF NOT EXISTS auth_identity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'kakao', 'naver')),
  provider_user_id TEXT NOT NULL,
  email TEXT,
  nickname TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS auth_identity_user_id_idx ON auth_identity(user_id);
