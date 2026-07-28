import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { chooseOmokBotMove } from "./bot.js";
import { checkFiveInARow, isBoardFull } from "./rules.js";
import { BOARD_SIZE, OmokState, type OmokMove } from "./state.js";

export const omokDefinition: GameDefinition<OmokState, OmokMove> = {
  id: "omok",
  displayName: "오목 (Omok)",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState(): OmokState {
    return new OmokState();
  },

  addPlayer(state: OmokState, playerId: PlayerId): void {
    state.players.push(playerId);
  },

  applyMove(state: OmokState, playerId: PlayerId, move: OmokMove): GameMoveResult {
    if (state.winnerId || state.isDraw) {
      return { ok: false, error: "Game has already ended" };
    }

    const playerIndex = state.players.indexOf(playerId);
    if (playerIndex === -1) {
      return { ok: false, error: "Player is not part of this game" };
    }
    if (playerIndex !== state.turnIndex % state.players.length) {
      return { ok: false, error: "Not your turn" };
    }

    const { row, col } = move;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return { ok: false, error: "Move is out of bounds" };
    }

    const index = row * BOARD_SIZE + col;
    if (state.board[index] !== 0) {
      return { ok: false, error: "Cell is already occupied" };
    }

    const stone = playerIndex + 1;
    state.board[index] = stone;

    if (checkFiveInARow(state.board, row, col, stone)) {
      state.winnerId = playerId;
    } else if (isBoardFull(state.board)) {
      state.isDraw = true;
    } else {
      state.turnIndex += 1;
    }

    return { ok: true };
  },

  checkGameOver(state: OmokState): GameOverResult | null {
    if (state.winnerId) return { winnerId: state.winnerId };
    if (state.isDraw) return { draw: true };
    return null;
  },

  getCurrentTurnPlayerId(state: OmokState): PlayerId | null {
    if (state.winnerId || state.isDraw || state.players.length === 0) return null;
    return state.players[state.turnIndex % state.players.length] ?? null;
  },

  chooseBotMove(state: OmokState, botPlayerId: PlayerId): OmokMove {
    return chooseOmokBotMove(state, botPlayerId);
  },
};
