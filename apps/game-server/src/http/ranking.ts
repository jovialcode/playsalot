import type { Leaderboard, MyRanking, RankingEntry } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";
import { db } from "../db.js";
import { requireMember } from "./require-member.js";

/** Points awarded to the winner and deducted from each loser. A draw changes nothing. */
const WIN_SCORE = 30;
const LOSS_SCORE = -10;

/** Only surface a bounded slice of the season leaderboard to the client. */
const LEADERBOARD_LIMIT = 50;

/**
 * The current monthly season key, 'YYYY-MM' in KST. The season is what makes the
 * monthly reset implicit: every write goes to the row for (user, current season),
 * so when the month rolls over the leaderboard naturally starts from empty while
 * previous months stay in the table as history. KST (UTC+9) so the reset lands on
 * the Korean month boundary rather than 09:00 KST on the 1st.
 */
export function currentSeason(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 7);
}

interface MatchParticipant {
  userId: string;
  displayName: string;
}

/**
 * Only logged-in members are ranked. Member ids are minted as `user_*` (OAuth) or
 * `admin_*`; guests are `guest_*` and bots `bot-*`. Recording a guest would also
 * violate ranking_score's FK to user_profile, so we filter them out up front.
 */
function isMemberId(userId: string): boolean {
  return userId.startsWith("user_") || userId.startsWith("admin_");
}

export interface MatchResult {
  /** Every human seat in the finished match (bots must be filtered out by the caller). */
  participants: MatchParticipant[];
  /** The winner's user id, or undefined for a draw. */
  winnerId?: string;
  draw?: boolean;
}

// Development-only fallback, mirroring friends.ts: keeps `pnpm dev` (no DATABASE_URL)
// working. season -> userId -> aggregate row.
interface MemoryRow extends MyRanking {
  userId: string;
  displayName: string;
}
const memoryScores = new Map<string, Map<string, MemoryRow>>();

function memorySeason(season: string): Map<string, MemoryRow> {
  let bySeason = memoryScores.get(season);
  if (!bySeason) {
    bySeason = new Map();
    memoryScores.set(season, bySeason);
  }
  return bySeason;
}

/** Per-participant score delta and win/loss/draw counters for one finished match. */
function deltaFor(result: MatchResult, userId: string): { score: number; wins: number; losses: number; draws: number } {
  if (result.draw || !result.winnerId) return { score: 0, wins: 0, losses: 0, draws: 1 };
  if (userId === result.winnerId) return { score: WIN_SCORE, wins: 1, losses: 0, draws: 0 };
  return { score: LOSS_SCORE, wins: 0, losses: 1, draws: 0 };
}

/**
 * Records a finished human-vs-human match into the current season's standings.
 * Called (fire-and-forget) from BoardGameRoom at game-over. Never throws to the
 * caller — a persistence failure must not take down the room; it's logged instead.
 */
export async function recordMatchResult(result: MatchResult): Promise<void> {
  // A ranked match needs at least two members; matches with fewer (guest games,
  // member-vs-guest, or a bot game that slipped through) carry no competitive signal.
  const members = result.participants.filter((participant) => isMemberId(participant.userId));
  if (members.length < 2) return;
  const season = currentSeason();

  if (!db) {
    const bySeason = memorySeason(season);
    for (const participant of members) {
      const delta = deltaFor(result, participant.userId);
      const existing = bySeason.get(participant.userId);
      const base: MemoryRow = existing ?? {
        userId: participant.userId,
        displayName: participant.displayName,
        season,
        score: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        plays: 0,
        rank: null,
      };
      bySeason.set(participant.userId, {
        ...base,
        displayName: participant.displayName,
        score: Math.max(0, base.score + delta.score),
        wins: base.wins + delta.wins,
        losses: base.losses + delta.losses,
        draws: base.draws + delta.draws,
        plays: base.plays + 1,
      });
    }
    return;
  }

  const client = await db.connect().catch((error: unknown) => {
    console.error("ranking: failed to acquire DB connection", error);
    return null;
  });
  if (!client) return;
  try {
    await client.query("BEGIN");
    for (const participant of members) {
      const delta = deltaFor(result, participant.userId);
      await client.query(
        `INSERT INTO ranking_score (user_id, season, score, wins, losses, draws, plays)
         VALUES ($1, $2, GREATEST(0, $3), $4, $5, $6, 1)
         ON CONFLICT (user_id, season) DO UPDATE SET
           score = GREATEST(0, ranking_score.score + $3),
           wins = ranking_score.wins + $4,
           losses = ranking_score.losses + $5,
           draws = ranking_score.draws + $6,
           plays = ranking_score.plays + 1,
           updated_at = NOW()`,
        [participant.userId, season, delta.score, delta.wins, delta.losses, delta.draws],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    // A missing user_profile row (FK) or any other failure is logged, not thrown:
    // the match already ended for the players regardless of whether it was scored.
    console.error("ranking: failed to record match result", error);
  } finally {
    client.release();
  }
}

// Ranking is a login-required feature: guests can't view the leaderboard or their
// own standing. requireMember returns a LOGIN_REQUIRED response for them.
const currentUser = requireMember;

async function loadMyRanking(userId: string, season: string): Promise<MyRanking> {
  const empty: MyRanking = { season, score: 0, wins: 0, losses: 0, draws: 0, plays: 0, rank: null };
  if (!db) {
    const row = memorySeason(season).get(userId);
    if (!row) return empty;
    const rank = [...memorySeason(season).values()]
      .filter((other) => other.score > row.score).length + 1;
    return { season, score: row.score, wins: row.wins, losses: row.losses, draws: row.draws, plays: row.plays, rank };
  }
  const result = await db.query<MyRanking>(
    // RANK() is bigint → cast to int so the pg driver returns a number, not a string.
    `SELECT season, score, wins, losses, draws, plays, rank FROM (
       SELECT user_id, season, score, wins, losses, draws, plays,
              (RANK() OVER (ORDER BY score DESC))::int AS rank
       FROM ranking_score WHERE season = $1
     ) ranked WHERE user_id = $2`,
    [season, userId],
  );
  return result.rows[0] ?? empty;
}

export const rankingRouter: ExpressRouter = Router();

/** Seasonal leaderboard: the top entries plus the caller's own standing. */
rankingRouter.get("/ranking", async (req, res, next) => {
  try {
    const user = currentUser(req, res);
    if (!user) return;
    const season = currentSeason();

    let entries: RankingEntry[];
    if (!db) {
      entries = [...memorySeason(season).values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, LEADERBOARD_LIMIT)
        .map((row, index) => ({ userId: row.userId, displayName: row.displayName, score: row.score, rank: index + 1 }));
    } else {
      const result = await db.query<RankingEntry>(
        `SELECT profile.id AS "userId", profile.display_name AS "displayName", ranked.score, ranked.rank
         FROM (
           SELECT user_id, score, (RANK() OVER (ORDER BY score DESC))::int AS rank
           FROM ranking_score WHERE season = $1
         ) ranked
         JOIN user_profile profile ON profile.id = ranked.user_id
         ORDER BY ranked.score DESC
         LIMIT $2`,
        [season, LEADERBOARD_LIMIT],
      );
      entries = result.rows;
    }

    const mine = await loadMyRanking(user.guestId, season);
    const me: RankingEntry | null =
      mine.rank === null
        ? null
        : entries.find((entry) => entry.userId === user.guestId) ?? {
            userId: user.guestId,
            displayName: user.displayName,
            score: mine.score,
            rank: mine.rank,
          };

    res.json({ season, entries, me } satisfies Leaderboard);
  } catch (error) {
    next(error);
  }
});

/** The caller's own season standing — used by the my-page stat tiles. */
rankingRouter.get("/ranking/me", async (req, res, next) => {
  try {
    const user = currentUser(req, res);
    if (!user) return;
    res.json(await loadMyRanking(user.guestId, currentSeason()));
  } catch (error) {
    next(error);
  }
});
