/** Public-facing game catalog entry, returned by GET /api/games. */
export interface GameCatalogEntry {
  id: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
  /** Whether this game implements the bot hooks, i.e. can be played solo against the computer. */
  supportsBot: boolean;
}

/** Options passed when a client calls `client.joinOrCreate("board-game", ...)`. */
export interface JoinRoomOptions {
  gameId: string;
  guestId: string;
  displayName: string;
  /** Signed token from GuestSession, verified server-side in Room#onAuth. */
  token: string;
  /** When true, BoardGameRoom fills the remaining seat(s) with bot players instead of waiting for humans. */
  vsBot?: boolean;
}

/** Body of the guest session bootstrap response, GET/POST /api/session. */
export interface GuestSession {
  guestId: string;
  displayName: string;
  /** Opaque token sent back as the join option so the server can verify the session. */
  token: string;
}
