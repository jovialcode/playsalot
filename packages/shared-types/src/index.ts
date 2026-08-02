/** Public-facing game catalog entry, returned by GET /api/games. */
export interface GameCatalogEntry {
  id: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
  /** Whether this game implements the bot hooks, i.e. can be played solo against the computer. */
  supportsBot: boolean;
}

/**
 * How a "board-game" room is created / matched. Doubles as the matchmaking
 * discriminator: `filterBy(["gameId", "mode"])` on the server keeps each mode's
 * rooms in its own pool, so a quick-match `joinOrCreate` never lands a player in
 * a still-open waiting room (public or private) of the same game.
 *
 * - `quick`   — matchmaking room, auto-starts once it fills up.
 * - `bot`     — like `quick` but the remaining seats are filled with bots.
 * - `private` — invite-code waiting room, hidden from listings; host starts it.
 * - `public`  — waiting room that IS listed (GET /api/rooms), joinable by anyone;
 *               host starts it. Same host-start flow as `private`, just discoverable.
 */
export type RoomMode = "quick" | "bot" | "private" | "public";

/** Options passed when a client calls `client.joinOrCreate/create/joinById("board-game", ...)`. */
export interface JoinRoomOptions {
  gameId: string;
  guestId: string;
  displayName: string;
  /** Signed token from GuestSession, verified server-side in Room#onAuth. */
  token: string;
  /** Defaults to "quick" server-side when omitted (e.g. joinById). See RoomMode. */
  mode?: RoomMode;
}

/**
 * A single open public waiting room, returned by GET /api/rooms?gameId=... .
 * Built from the matchmaker listing (metadata + client counts), so the lobby can
 * show a browsable list without joining anything first.
 */
export interface PublicRoomSummary {
  roomId: string;
  gameId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
}

/** Body of the guest session bootstrap response, GET/POST /api/session. */
export interface GuestSession {
  guestId: string;
  displayName: string;
  /** Opaque token sent back as the join option so the server can verify the session. */
  token: string;
}

/** A friend record visible in the lobby. */
export interface Friend {
  guestId: string;
  displayName: string;
}

/** Session data needed to share and use a lobby friend code. */
export interface FriendProfile {
  friendCode: string;
}

/** A single seat in a private room's waiting-room roster. */
export interface RoomRosterPlayer {
  id: string;
  displayName: string;
}

/**
 * Broadcast by BoardGameRoom to every client of a private room whenever the roster
 * changes (on join) — lets the waiting-room UI render "N/max joined" and figure out
 * who the host is without knowing anything about the underlying game's Schema state.
 */
export interface RoomRoster {
  gameId: string;
  players: RoomRosterPlayer[];
  hostId: string;
  minPlayers: number;
  maxPlayers: number;
  started: boolean;
}
