const STORAGE_KEY = "playsalot.reconnect-token";
const GAME_ID_STORAGE_KEY = "playsalot.reconnect-game-id";

/** Cached per-tab so a page refresh can rejoin the same room instead of starting a new match. */
export function saveReconnectionToken(token: string, gameId: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
  sessionStorage.setItem(GAME_ID_STORAGE_KEY, gameId);
}

export function getReconnectionToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function getReconnectionGameId(): string | null {
  return sessionStorage.getItem(GAME_ID_STORAGE_KEY);
}

export function clearReconnectionToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(GAME_ID_STORAGE_KEY);
}
