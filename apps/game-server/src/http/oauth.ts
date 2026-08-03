import { randomUUID } from "node:crypto";
import type { GuestSession } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";
import type { PoolClient } from "pg";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import {
  JWT_SECRET,
  OAUTH_CALLBACK_BASE,
  OAUTH_PROVIDERS,
  WEB_APP_URL,
  type OAuthProvider,
} from "../config/env.js";
import { createFriendCode, registerGuest } from "./friends.js";

// Same lifetime as guest sessions (see http/session.ts) so a member token and a
// guest token expire on the same schedule.
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const STATE_TTL_SECONDS = 5 * 60;

/** Provider-sourced identity, after we normalize each provider's differently-shaped payload. */
interface NormalizedProfile {
  providerUserId: string;
  nickname: string;
  profileImageUrl: string;
  email?: string;
}

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  /** Space-delimited scope string, omitted when the provider configures consent in its console (naver). */
  scope?: string;
  normalize(raw: unknown): NormalizedProfile;
}

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === "object" && value ? (value as Record<string, unknown>) : {});
const str = (value: unknown): string => (value == null ? "" : String(value));

const PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    normalize(raw) {
      const r = asRecord(raw);
      return { providerUserId: str(r.sub), nickname: str(r.name), profileImageUrl: str(r.picture), email: str(r.email) || undefined };
    },
  },
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
    scope: "profile_nickname profile_image",
    normalize(raw) {
      const r = asRecord(raw);
      const account = asRecord(r.kakao_account);
      const profile = asRecord(account.profile);
      return {
        providerUserId: str(r.id),
        nickname: str(profile.nickname),
        profileImageUrl: str(profile.profile_image_url),
        email: str(account.email) || undefined,
      };
    },
  },
  naver: {
    authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
    tokenUrl: "https://nid.naver.com/oauth2.0/token",
    userInfoUrl: "https://openapi.naver.com/v1/nid/me",
    normalize(raw) {
      const response = asRecord(asRecord(raw).response);
      return {
        providerUserId: str(response.id),
        nickname: str(response.nickname) || str(response.name),
        profileImageUrl: str(response.profile_image),
        email: str(response.email) || undefined,
      };
    },
  },
};

function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "kakao" || value === "naver";
}

function redirectUri(provider: OAuthProvider): string {
  return `${OAUTH_CALLBACK_BASE}/api/auth/${provider}/callback`;
}

/** Sends the browser back to the web app's callback route with an error so it can toast and recover. */
function failRedirect(reason: string): string {
  return `${WEB_APP_URL}/auth/callback?error=${encodeURIComponent(reason)}`;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

async function exchangeCodeForToken(provider: OAuthProvider, code: string, state: string): Promise<string> {
  const cfg = PROVIDERS[provider];
  const creds = OAUTH_PROVIDERS[provider];
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: redirectUri(provider),
    code,
  });
  // Naver requires the original state on the token request too; google/kakao ignore it.
  if (provider === "naver") body.set("state", state);

  const response = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (!response.ok) throw new Error(`${provider} token exchange failed: ${response.status}`);
  const json = asRecord(await response.json());
  const accessToken = str(json.access_token);
  if (!accessToken) throw new Error(`${provider} token exchange returned no access_token`);
  return accessToken;
}

async function fetchUserInfo(provider: OAuthProvider, accessToken: string): Promise<NormalizedProfile> {
  const cfg = PROVIDERS[provider];
  const response = await fetch(cfg.userInfoUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`${provider} userinfo failed: ${response.status}`);
  return cfg.normalize(await response.json());
}

interface Member {
  userId: string;
  displayName: string;
  profileImageUrl: string;
}

// (provider, providerUserId) -> userId, for the no-DATABASE_URL local dev fallback
// (mirrors the in-memory profile store in http/friends.ts).
const localIdentityToUser = new Map<string, string>();

/** Inserts a fresh member profile, retrying on the astronomically rare friend-code collision. */
async function insertMemberProfile(client: PoolClient, userId: string, profile: NormalizedProfile): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await client.query("SAVEPOINT member_profile");
    try {
      await client.query(
        `INSERT INTO user_profile (id, display_name, profile_image_url, friend_code, account_type)
         VALUES ($1, $2, $3, $4, 'member')`,
        [userId, profile.nickname, profile.profileImageUrl, createFriendCode()],
      );
      await client.query("RELEASE SAVEPOINT member_profile");
      return;
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT member_profile");
      if (!isUniqueViolation(error) || attempt === 2) throw error;
    }
  }
}

/**
 * Finds or creates the user_profile behind a social identity and keeps the
 * auth_identity row's provider-sourced nickname/image current. Returns the
 * app-facing display name/image (which a member may later have edited on the profile).
 */
async function upsertMember(provider: OAuthProvider, profile: NormalizedProfile): Promise<Member> {
  if (!db) {
    const key = `${provider}:${profile.providerUserId}`;
    let userId = localIdentityToUser.get(key);
    if (!userId) {
      userId = `user_${randomUUID()}`;
      localIdentityToUser.set(key, userId);
    }
    await registerGuest({ guestId: userId, displayName: profile.nickname, profileImageUrl: profile.profileImageUrl, accountType: "member" });
    return { userId, displayName: profile.nickname, profileImageUrl: profile.profileImageUrl };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query<{ user_id: string }>(
      `SELECT user_id FROM auth_identity WHERE provider = $1 AND provider_user_id = $2`,
      [provider, profile.providerUserId],
    );
    let userId: string;
    if (existing.rows[0]) {
      userId = existing.rows[0].user_id;
      await client.query(
        `UPDATE auth_identity
         SET nickname = $1, profile_image_url = $2, email = $3, updated_at = NOW()
         WHERE provider = $4 AND provider_user_id = $5`,
        [profile.nickname, profile.profileImageUrl, profile.email ?? null, provider, profile.providerUserId],
      );
    } else {
      userId = `user_${randomUUID()}`;
      await insertMemberProfile(client, userId, profile);
      await client.query(
        `INSERT INTO auth_identity (user_id, provider, provider_user_id, email, nickname, profile_image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, provider, profile.providerUserId, profile.email ?? null, profile.nickname, profile.profileImageUrl],
      );
    }
    const loaded = await client.query<{ display_name: string; profile_image_url: string | null }>(
      `SELECT display_name, profile_image_url FROM user_profile WHERE id = $1`,
      [userId],
    );
    await client.query("COMMIT");
    const row = loaded.rows[0];
    return {
      userId,
      displayName: row?.display_name ?? profile.nickname,
      profileImageUrl: row?.profile_image_url ?? profile.profileImageUrl,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export const oauthRouter: ExpressRouter = Router();

/** Kicks off the OAuth flow: redirect the browser to the provider's consent screen. */
oauthRouter.get("/auth/:provider/login", (req, res) => {
  const provider = req.params.provider;
  if (!isProvider(provider)) return res.status(404).json({ message: "지원하지 않는 로그인입니다." });
  const creds = OAUTH_PROVIDERS[provider];
  if (!creds.clientId || !creds.clientSecret) {
    return res.status(501).json({ message: "이 소셜 로그인은 아직 설정되지 않았어요." });
  }

  const cfg = PROVIDERS[provider];
  const state = jwt.sign({ provider, nonce: randomUUID() }, JWT_SECRET, { expiresIn: STATE_TTL_SECONDS });
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: redirectUri(provider),
    response_type: "code",
    state,
  });
  if (cfg.scope) params.set("scope", cfg.scope);
  if (provider === "google") params.set("access_type", "online");
  res.redirect(`${cfg.authorizeUrl}?${params.toString()}`);
});

/** Provider redirects the browser back here with ?code&state; we finish the exchange and mint a session. */
oauthRouter.get("/auth/:provider/callback", async (req, res, next) => {
  const provider = req.params.provider;
  if (!isProvider(provider) || !OAUTH_PROVIDERS[provider].clientId) return res.redirect(failRedirect("provider"));

  const { code, state } = req.query;
  if (typeof code !== "string" || typeof state !== "string") return res.redirect(failRedirect("params"));

  try {
    const decoded = jwt.verify(state, JWT_SECRET) as { provider?: string };
    if (decoded.provider !== provider) throw new Error("state provider mismatch");
  } catch {
    return res.redirect(failRedirect("state"));
  }

  try {
    const accessToken = await exchangeCodeForToken(provider, code, state);
    const profile = await fetchUserInfo(provider, accessToken);
    // Nickname and profile image are required; bail if the provider withheld them.
    if (!profile.providerUserId || !profile.nickname || !profile.profileImageUrl) {
      return res.redirect(failRedirect("profile"));
    }

    const member = await upsertMember(provider, profile);
    // Keep the historical `guestId` claim so Room#onAuth and every game package
    // stay unchanged — the value is now a real user id instead of an anonymous one.
    const token = jwt.sign(
      { guestId: member.userId, displayName: member.displayName, accountType: "member", profileImageUrl: member.profileImageUrl },
      JWT_SECRET,
      { expiresIn: SESSION_TTL_SECONDS },
    );
    res.redirect(`${WEB_APP_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (error) {
    next(error);
  }
});

/** Hydrates a full session object from a bearer token — used by the web callback page after login. */
oauthRouter.get("/auth/me", (req, res) => {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "인증이 필요합니다." });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      guestId: string;
      displayName: string;
      accountType?: "guest" | "member";
      profileImageUrl?: string;
      isAdmin?: boolean;
    };
    const session: GuestSession = {
      guestId: payload.guestId,
      displayName: payload.displayName,
      token,
      accountType: payload.accountType ?? "guest",
      profileImageUrl: payload.profileImageUrl,
      isAdmin: payload.isAdmin,
    };
    res.json(session);
  } catch {
    res.status(401).json({ message: "세션이 유효하지 않습니다." });
  }
});
