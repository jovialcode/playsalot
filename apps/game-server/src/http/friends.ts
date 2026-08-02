import { randomBytes } from "node:crypto";
import type { Friend, FriendProfile } from "@playsalot/shared-types";
import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { JWT_SECRET } from "../config/env.js";

interface SessionIdentity {
  guestId: string;
  displayName: string;
}

interface ProfileRow {
  friendCode: string;
}

interface LocalProfile extends SessionIdentity, FriendProfile {}

// Development-only fallback. It keeps local game and friend testing free of a
// database dependency; production uses PostgreSQL whenever DATABASE_URL exists.
const localProfiles = new Map<string, LocalProfile>();
const localGuestIdsByCode = new Map<string, string>();
const localFriendIds = new Map<string, Set<string>>();

export const friendsRouter: ExpressRouter = Router();

function createFriendCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

/** Creates the profile on first session issue and refreshes the display name thereafter. */
export async function registerGuest(identity: SessionIdentity): Promise<FriendProfile> {
  if (!db) {
    const existing = localProfiles.get(identity.guestId);
    if (existing) {
      existing.displayName = identity.displayName;
      return { friendCode: existing.friendCode };
    }
    let friendCode = createFriendCode();
    while (localGuestIdsByCode.has(friendCode)) friendCode = createFriendCode();
    localProfiles.set(identity.guestId, { ...identity, friendCode });
    localGuestIdsByCode.set(friendCode, identity.guestId);
    localFriendIds.set(identity.guestId, new Set());
    return { friendCode };
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await db.query<ProfileRow>(
        `INSERT INTO profiles (id, display_name, friend_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = NOW()
         RETURNING friend_code AS "friendCode"`,
        [identity.guestId, identity.displayName, createFriendCode()],
      );
      const profile = result.rows[0];
      if (!profile) throw new Error("프로필을 만들지 못했습니다.");
      return { friendCode: profile.friendCode };
    } catch (error: unknown) {
      // PostgreSQL unique-violation: exceptionally rare friend-code collision.
      if (!(typeof error === "object" && error && "code" in error && error.code === "23505") || attempt === 2) throw error;
    }
  }
  throw new Error("친구 코드를 만들지 못했습니다.");
}

function currentGuest(req: Request, res: Response): SessionIdentity | undefined {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return undefined;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as SessionIdentity;
  } catch {
    res.status(401).json({ message: "세션이 유효하지 않습니다." });
    return undefined;
  }
}

friendsRouter.get("/friends/profile", async (req, res, next) => {
  try {
    const guest = currentGuest(req, res);
    if (guest) res.json(await registerGuest(guest));
  } catch (error) { next(error); }
});

friendsRouter.get("/friends", async (req, res, next) => {
  try {
    const guest = currentGuest(req, res);
    if (!guest) return;
    await registerGuest(guest);
    if (!db) {
      const friends: Friend[] = [...(localFriendIds.get(guest.guestId) ?? [])]
        .map((id) => localProfiles.get(id))
        .filter((friend): friend is LocalProfile => Boolean(friend))
        .map(({ guestId, displayName }) => ({ guestId, displayName }));
      res.json(friends);
      return;
    }
    const result = await db.query<Friend>(
      `SELECT profile.id AS "guestId", profile.display_name AS "displayName"
       FROM friendships friendship
       JOIN profiles profile ON profile.id = friendship.friend_id
       WHERE friendship.user_id = $1
       ORDER BY profile.display_name`,
      [guest.guestId],
    );
    res.json(result.rows);
  } catch (error) { next(error); }
});

friendsRouter.post("/friends", async (req, res, next) => {
  const guest = currentGuest(req, res);
  if (!guest) return;
  try {
    await registerGuest(guest);
    const code = typeof req.body?.friendCode === "string" ? req.body.friendCode.trim().toUpperCase() : "";
    if (!db) {
      const friendId = localGuestIdsByCode.get(code);
      const friend = friendId ? localProfiles.get(friendId) : undefined;
      if (!friend) return res.status(404).json({ message: "친구 코드를 찾을 수 없어요." });
      if (friend.guestId === guest.guestId) return res.status(400).json({ message: "내 코드는 추가할 수 없어요." });
      const ids = localFriendIds.get(guest.guestId)!;
      if (ids.has(friend.guestId)) return res.status(409).json({ message: "이미 친구로 추가되어 있어요." });
      ids.add(friend.guestId);
      localFriendIds.get(friend.guestId)?.add(guest.guestId);
      return res.status(201).json({ guestId: friend.guestId, displayName: friend.displayName } satisfies Friend);
    }
  } catch (error) {
    next(error);
    return;
  }
  const client = await db.connect().catch(next);
  if (!client) return;
  try {
    const code = typeof req.body?.friendCode === "string" ? req.body.friendCode.trim().toUpperCase() : "";
    const target = await client.query<Friend>(
      `SELECT id AS "guestId", display_name AS "displayName" FROM profiles WHERE friend_code = $1`, [code],
    );
    const friend = target.rows[0];
    if (!friend) return res.status(404).json({ message: "친구 코드를 찾을 수 없어요." });
    if (friend.guestId === guest.guestId) return res.status(400).json({ message: "내 코드는 추가할 수 없어요." });

    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1)
       ON CONFLICT DO NOTHING RETURNING user_id`, [guest.guestId, friend.guestId],
    );
    await client.query("COMMIT");
    if (inserted.rowCount === 0) return res.status(409).json({ message: "이미 친구로 추가되어 있어요." });
    res.status(201).json(friend);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    next(error);
  } finally { client.release(); }
});

friendsRouter.delete("/friends/:guestId", async (req, res, next) => {
  try {
    const guest = currentGuest(req, res);
    if (!guest) return;
    if (!db) {
      const removed = localFriendIds.get(guest.guestId)?.delete(req.params.guestId);
      if (!removed) return res.status(404).json({ message: "친구 목록에서 찾을 수 없어요." });
      localFriendIds.get(req.params.guestId)?.delete(guest.guestId);
      res.status(204).end();
      return;
    }
    const result = await db.query(
      `DELETE FROM friendships
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [guest.guestId, req.params.guestId],
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "친구 목록에서 찾을 수 없어요." });
    res.status(204).end();
  } catch (error) { next(error); }
});
