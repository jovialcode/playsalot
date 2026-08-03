import type { GuestSession } from "@playsalot/shared-types";
import { API_URL } from "./env";

const STORAGE_KEY = "playsalot.guest-session";

/**
 * A guest identity is just a signed token cached in sessionStorage (tab-scoped,
 * not shared across tabs) — no account, no password. Using sessionStorage
 * rather than localStorage lets two tabs in the same browser act as two
 * different players, which is how local dev/testing exercises a real match.
 * The server issues the token once via POST /api/session and later verifies
 * it in Room#onAuth so a client can't impersonate another player's guestId.
 */
export async function getOrCreateGuestSession(): Promise<GuestSession> {
  const cached = sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    return JSON.parse(cached) as GuestSession;
  }

  const response = await fetch(`${API_URL}/api/session`, { method: "POST" });
  const session = (await response.json()) as GuestSession;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * After an OAuth login the game-server redirects back with a signed member token.
 * We exchange it for the full session object and cache it under the SAME key the
 * guest session uses, so the member simply replaces the guest for this tab.
 */
export async function hydrateMemberSession(token: string): Promise<GuestSession> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("로그인 세션을 확인하지 못했어요.");
  const session = (await response.json()) as GuestSession;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

/** Caches an already-resolved session (e.g. from admin login) under the shared key. */
export function storeSession(session: GuestSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Whether the session is a logged-in member (vs a guest) — gates login-required features. */
export function isMember(session: GuestSession | null): boolean {
  return session?.accountType === "member";
}

/** Clears the cached session (guest or member); the next bootstrap issues a fresh guest. */
export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function friendRequest<T>(session: GuestSession, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "친구 정보를 불러오지 못했어요.");
  }
  return (response.status === 204 ? undefined : response.json()) as T;
}
