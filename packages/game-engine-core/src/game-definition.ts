import type { Schema } from "@colyseus/schema";
import type { GameMoveResult, GameOverResult, PlayerId } from "./types.js";

/**
 * The contract every board game plugin must implement.
 *
 * `TState` must be a @colyseus/schema class so the generic BoardGameRoom
 * can assign it directly to `room.state = ...` and get automatic
 * delta-encoded sync to clients for free.
 *
 * `createInitialState`/`addPlayer`/`applyMove` all mutate `state` in place
 * (rather than returning a new copy) — Colyseus' Schema change-tracking
 * relies on in-place mutation to compute the delta that gets sent to
 * clients. This also means `this.state` must be assigned exactly once, in
 * `Room#onCreate` before any client joins: Colyseus only synchronizes
 * clients that were connected *after* `this.state` was first set, so
 * assigning it later (e.g. once the room happens to fill up) silently
 * leaves already-connected clients stuck without a full state sync. Players
 * are registered into the room via `addPlayer` mutating the same
 * already-existing state instance, never by replacing it.
 */
export interface GameDefinition<TState extends Schema = Schema, TMove = unknown> {
  id: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;

  /** Called once in Room#onCreate, before any player has joined. */
  createInitialState(): TState;

  /** Registers a newly joined player by mutating the existing state (e.g. pushing onto a players list). */
  addPlayer(state: TState, playerId: PlayerId): void;

  /** Validates and applies a move. Returns { ok: false, error } without mutating state if illegal. */
  applyMove(state: TState, playerId: PlayerId, move: TMove): GameMoveResult;

  /** Returns a result once the game has ended, or null while still in progress. */
  checkGameOver(state: TState): GameOverResult | null;

  /**
   * Both optional, and only meaningful together — providing them enables
   * "vs computer" mode for this game. When a room is created with the
   * `vsBot` join option, BoardGameRoom fills the remaining seat(s) with
   * synthetic bot player ids and, after each real move, calls
   * `getCurrentTurnPlayerId` to check whether a bot should move next.
   */
  getCurrentTurnPlayerId?(state: TState): PlayerId | null;

  /** Picks a legal move for the bot. Called only when `getCurrentTurnPlayerId` returns a bot id. */
  chooseBotMove?(state: TState, botPlayerId: PlayerId): TMove;
}
