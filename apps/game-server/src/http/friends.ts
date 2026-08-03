import { randomBytes } from "node:crypto";
import type { Friend, FriendProfile } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";
import { db } from "../db.js";
import { requireMember } from "./require-member.js";

interface SessionIdentity {
  guestId: string;
  displayName: string;
  /** Set for members logged in via OAuth; guests leave it undefined. */
  profileImageUrl?: string;
  /** Defaults to "guest". OAuth login passes "member". */
  accountType?: "guest" | "member";
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

export function createFriendCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

/** Creates the profile on first session issue and refreshes the display name thereafter. */
export async function registerGuest(identity: SessionIdentity): Promise<FriendProfile> {
  if (!db) {
    const existing = localProfiles.get(identity.guestId);
    if (existing) {
      existing.displayName = identity.displayName;
      if (identity.profileImageUrl) existing.profileImageUrl = identity.profileImageUrl;
      if (identity.accountType) existing.accountType = identity.accountType;
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
        `INSERT INTO user_profile (id, display_name, profile_image_url, friend_code, account_type)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           profile_image_url = COALESCE(EXCLUDED.profile_image_url, user_profile.profile_image_url),
           account_type = EXCLUDED.account_type,
           updated_at = NOW()
         RETURNING friend_code AS "friendCode"`,
        [identity.guestId, identity.displayName, identity.profileImageUrl ?? null, createFriendCode(), identity.accountType ?? "guest"],
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

// Friends are a login-required feature: every endpoint below requires a member.
// Guests get a LOGIN_REQUIRED response (see requireMember) so the UI can prompt login.
const currentGuest = requireMember;

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
       FROM friend_relationship friendship
       JOIN user_profile profile ON profile.id = friendship.friend_id
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
      `SELECT id AS "guestId", display_name AS "displayName" FROM user_profile WHERE friend_code = $1`, [code],
    );
    const friend = target.rows[0];
    if (!friend) return res.status(404).json({ message: "친구 코드를 찾을 수 없어요." });
    if (friend.guestId === guest.guestId) return res.status(400).json({ message: "내 코드는 추가할 수 없어요." });

    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO friend_relationship (user_id, friend_id) VALUES ($1, $2), ($2, $1)
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
      `DELETE FROM friend_relationship
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [guest.guestId, req.params.guestId],
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "친구 목록에서 찾을 수 없어요." });
    res.status(204).end();
  } catch (error) { next(error); }
});
