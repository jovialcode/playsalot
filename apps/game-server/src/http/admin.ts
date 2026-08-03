import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { GuestSession } from "@playsalot/shared-types";
import { Router, type NextFunction, type Request, type Response, type Router as ExpressRouter } from "express";
import type { PoolClient } from "pg";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { ADMIN_PASSWORD, ADMIN_USERNAME, JWT_SECRET } from "../config/env.js";
import { createFriendCode } from "./friends.js";

const SESSION_TTL_SECONDS = 12 * 60 * 60;
const scryptAsync = promisify(scrypt);

// ---- password hashing (node:crypto scrypt, no extra dependency) -------------

/** Produces "scrypt$<salt>$<hash>"; a fresh random salt per password. */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

/** Constant-time verify of a password against a stored "scrypt$<salt>$<hash>". */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

// ---- credential store (DB, with an in-memory fallback for db-less local dev) --

interface AdminAccount {
  userId: string;
  displayName: string;
  passwordHash: string;
}

// username -> account, only used when DATABASE_URL is unset (mirrors http/friends.ts).
const localAdmins = new Map<string, AdminAccount>();

async function findAdminByUsername(username: string): Promise<AdminAccount | null> {
  if (!db) return localAdmins.get(username) ?? null;
  const result = await db.query<{ user_id: string; display_name: string; password_hash: string }>(
    `SELECT credential.user_id, profile.display_name, credential.password_hash
     FROM auth_credential credential
     JOIN user_profile profile ON profile.id = credential.user_id
     WHERE credential.username = $1 AND profile.is_admin = true`,
    [username],
  );
  const row = result.rows[0];
  return row ? { userId: row.user_id, displayName: row.display_name, passwordHash: row.password_hash } : null;
}

/** Inserts the admin's user_profile, retrying only on the rare friend-code collision. */
async function insertAdminProfile(client: PoolClient, userId: string, displayName: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await client.query("SAVEPOINT admin_profile");
    try {
      await client.query(
        `INSERT INTO user_profile (id, display_name, friend_code, account_type, is_admin)
         VALUES ($1, $2, $3, 'member', true)`,
        [userId, displayName, createFriendCode()],
      );
      await client.query("RELEASE SAVEPOINT admin_profile");
      return;
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT admin_profile");
      const isUnique = typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
      if (!isUnique || attempt === 2) throw error;
    }
  }
}

/**
 * Provisions (or updates) the admin account from ADMIN_USERNAME/ADMIN_PASSWORD at
 * startup. Idempotent: re-running with a changed password rotates the stored hash;
 * an unchanged env is a no-op beyond the hash refresh. Skipped when either is blank.
 */
export async function ensureAdminAccount(): Promise<void> {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return;
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  if (!db) {
    const existing = localAdmins.get(ADMIN_USERNAME);
    localAdmins.set(ADMIN_USERNAME, {
      userId: existing?.userId ?? `admin_${randomUUID()}`,
      displayName: existing?.displayName ?? ADMIN_USERNAME,
      passwordHash,
    });
    console.log(`admin account ready (in-memory): ${ADMIN_USERNAME}`);
    return;
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<{ user_id: string }>(
      `SELECT user_id FROM auth_credential WHERE username = $1`,
      [ADMIN_USERNAME],
    );
    if (found.rows[0]) {
      await client.query(
        `UPDATE auth_credential SET password_hash = $1, updated_at = NOW() WHERE username = $2`,
        [passwordHash, ADMIN_USERNAME],
      );
      await client.query(`UPDATE user_profile SET is_admin = true, updated_at = NOW() WHERE id = $1`, [found.rows[0].user_id]);
    } else {
      const userId = `admin_${randomUUID()}`;
      await insertAdminProfile(client, userId, ADMIN_USERNAME);
      await client.query(
        `INSERT INTO auth_credential (user_id, username, password_hash) VALUES ($1, $2, $3)`,
        [userId, ADMIN_USERNAME, passwordHash],
      );
    }
    await client.query("COMMIT");
    console.log(`admin account ready: ${ADMIN_USERNAME}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("failed to provision admin account:", error);
  } finally {
    client.release();
  }
}

// ---- routes ------------------------------------------------------------------

export const adminRouter: ExpressRouter = Router();

/** Username/password login for admin accounts. Returns a full member session with isAdmin: true. */
adminRouter.post("/auth/admin/login", async (req, res, next) => {
  try {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!username || !password) return res.status(400).json({ message: "아이디와 비밀번호를 입력해 주세요." });

    const account = await findAdminByUsername(username);
    // Verify against a dummy hash even when the account is missing, to keep the
    // response time from leaking whether a username exists.
    const ok = account
      ? await verifyPassword(password, account.passwordHash)
      : (await verifyPassword(password, "scrypt$0$0"), false);
    if (!account || !ok) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });

    const token = jwt.sign(
      { guestId: account.userId, displayName: account.displayName, accountType: "member", isAdmin: true },
      JWT_SECRET,
      { expiresIn: SESSION_TTL_SECONDS },
    );
    const session: GuestSession = {
      guestId: account.userId,
      displayName: account.displayName,
      token,
      accountType: "member",
      isAdmin: true,
    };
    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * Gate for admin-only endpoints. Trusts the signed `isAdmin` claim (no DB read),
 * attaching the decoded payload to req.admin for downstream handlers.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { guestId: string; displayName: string; isAdmin?: boolean };
    if (!payload.isAdmin) {
      res.status(403).json({ message: "관리자 권한이 필요합니다." });
      return;
    }
    (req as Request & { admin?: typeof payload }).admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "세션이 유효하지 않습니다." });
  }
}

/** Minimal admin-gated endpoint — confirms the caller is an admin. Real admin features build on requireAdmin. */
adminRouter.get("/admin/me", requireAdmin, (req, res) => {
  const admin = (req as Request & { admin?: { guestId: string; displayName: string } }).admin;
  res.json({ ok: true, guestId: admin?.guestId, displayName: admin?.displayName });
});
