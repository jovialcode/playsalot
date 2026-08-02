import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId, PlayerInfo } from "@playsalot/game-engine-core";
import { chooseMancalaBotMove } from "./bot.js";
import { isGameOver, isOwnPit, sow, sweep } from "./rules.js";
import { MancalaState, STORE_INDEX, type MancalaMove } from "./state.js";

/** Copies a plain number[] board back into the tracked ArraySchema element-by-element. */
function writeBoard(state: MancalaState, board: number[]): void {
  for (let i = 0; i < board.length; i += 1) {
    state.board[i] = board[i] ?? 0;
  }
}

/** Sweeps the leftovers, writes the final board, and records the winner (or a draw). */
function finish(state: MancalaState, board: number[]): void {
  const settled = sweep(board);
  writeBoard(state, settled);
  const s0 = settled[STORE_INDEX[0]] ?? 0;
  const s1 = settled[STORE_INDEX[1]] ?? 0;
  if (s0 > s1) state.winnerId = state.players[0] ?? "";
  else if (s1 > s0) state.winnerId = state.players[1] ?? "";
  else state.isDraw = true;
}

export const mancalaDefinition: GameDefinition<MancalaState, MancalaMove> = {
  id: "mancala",
  displayName: "만칼라 (Mancala)",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState(): MancalaState {
    return new MancalaState();
  },

  addPlayer(state: MancalaState, player: PlayerInfo | PlayerId): void {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
  },

  applyMove(state: MancalaState, playerId: PlayerId, move: MancalaMove): GameMoveResult {
    if (state.winnerId || state.isDraw) {
      return { ok: false, error: "Game has already ended" };
    }

    const playerIndex = state.players.indexOf(playerId);
    if (playerIndex === -1) {
      return { ok: false, error: "Player is not part of this game" };
    }
    if (playerIndex !== state.currentPlayer) {
      return { ok: false, error: "Not your turn" };
    }

    const pit = move?.pit;
    if (typeof pit !== "number" || !isOwnPit(playerIndex, pit)) {
      return { ok: false, error: "That is not one of your pits" };
    }

    const board = Array.from(state.board);
    if ((board[pit] ?? 0) <= 0) {
      return { ok: false, error: "That pit is empty" };
    }

    const { board: next, extraTurn } = sow(board, playerIndex, pit);

    if (isGameOver(next)) {
      finish(state, next);
      return { ok: true };
    }

    writeBoard(state, next);
    if (!extraTurn) {
      state.currentPlayer = playerIndex === 0 ? 1 : 0;
    }
    return { ok: true };
  },

  checkGameOver(state: MancalaState): GameOverResult | null {
    if (state.winnerId) return { winnerId: state.winnerId };
    if (state.isDraw) return { draw: true };
    return null;
  },

  getCurrentTurnPlayerId(state: MancalaState): PlayerId | null {
    if (state.winnerId || state.isDraw || state.players.length === 0) return null;
    return state.players[state.currentPlayer] ?? null;
  },

  chooseBotMove(state: MancalaState, botPlayerId: PlayerId): MancalaMove {
    return chooseMancalaBotMove(state, botPlayerId);
  },
};
