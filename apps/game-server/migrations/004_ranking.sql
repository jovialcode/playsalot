-- ranking domain: per-user competitive score, partitioned by monthly season.
--
-- Monthly reset is IMPLICIT: `season` is a 'YYYY-MM' key computed at write time
-- (see http/ranking.ts currentSeason), so a new month simply starts writing to a
-- fresh set of rows. Nothing is ever wiped — past seasons stay queryable as history
-- and the leaderboard just filters on the current season. No cron job required.
--
-- score never drops below 0 (enforced with GREATEST(0, ...) on every write). Only
-- human-vs-human matches are recorded; bot games are skipped in BoardGameRoom.
CREATE TABLE IF NOT EXISTS ranking_score (
  user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  -- 'YYYY-MM' (KST). One row per (user, month).
  season CHAR(7) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  plays INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, season)
);

-- Leaderboard read: "top scorers this season" is ORDER BY score DESC within a season.
CREATE INDEX IF NOT EXISTS ranking_score_season_score_idx ON ranking_score(season, score DESC);
