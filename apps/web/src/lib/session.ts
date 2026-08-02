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
