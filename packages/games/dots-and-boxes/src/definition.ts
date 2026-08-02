import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId, PlayerInfo } from "@playsalot/game-engine-core";
import { chooseDotsBotMove } from "./bot.js";
import { boxSideCount, boxesForEdge, type EdgeState } from "./rules.js";
import { BOXES_PER_SIDE, BOX_COUNT, DotsState, H_EDGE_COUNT, V_EDGE_COUNT, type DotsMove } from "./state.js";

export const dotsDefinition: GameDefinition<DotsState, DotsMove> = {
  id: "dots",
  displayName: "점과 상자 (Dots & Boxes)",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState(): DotsState {
    return new DotsState();
  },

  addPlayer(state: DotsState, player: PlayerInfo | PlayerId): void {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
  },

  applyMove(state: DotsState, playerId: PlayerId, move: DotsMove): GameMoveResult {
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

    const type = move?.type;
    const index = move?.index;
    if ((type !== "h" && type !== "v") || typeof index !== "number") {
      return { ok: false, error: "Invalid line" };
    }

    const edges = type === "h" ? state.hEdges : state.vEdges;
    const count = type === "h" ? H_EDGE_COUNT : V_EDGE_COUNT;
    if (index < 0 || index >= count) {
      return { ok: false, error: "Line is out of bounds" };
    }
    if (edges[index] !== 0) {
      return { ok: false, error: "That line is already drawn" };
    }

    const stamp = playerIndex + 1;
    edges[index] = stamp;

    // A move can complete a box (or two), which claims it and grants an extra turn.
    const view: EdgeState = { h: Array.from(state.hEdges), v: Array.from(state.vEdges) };
    let completed = 0;
    for (const [br, bc] of boxesForEdge(type, index)) {
      const boxIndex = br * BOXES_PER_SIDE + bc;
      if (state.boxes[boxIndex] === 0 && boxSideCount(view, br, bc) === 4) {
        state.boxes[boxIndex] = stamp;
        completed += 1;
      }
    }

    if (completed === 0) {
      state.currentPlayer = playerIndex === 0 ? 1 : 0;
    }

    // Game ends once every box is claimed; most boxes wins.
    let claimed = 0;
    let p0 = 0;
    let p1 = 0;
    for (let i = 0; i < BOX_COUNT; i += 1) {
      const owner = state.boxes[i];
      if (owner !== 0) claimed += 1;
      if (owner === 1) p0 += 1;
      else if (owner === 2) p1 += 1;
    }
    if (claimed === BOX_COUNT) {
      if (p0 > p1) state.winnerId = state.players[0] ?? "";
      else if (p1 > p0) state.winnerId = state.players[1] ?? "";
      else state.isDraw = true;
    }

    return { ok: true };
  },

  checkGameOver(state: DotsState): GameOverResult | null {
    if (state.winnerId) return { winnerId: state.winnerId };
    if (state.isDraw) return { draw: true };
    return null;
  },

  getCurrentTurnPlayerId(state: DotsState): PlayerId | null {
    if (state.winnerId || state.isDraw || state.players.length === 0) return null;
    return state.players[state.currentPlayer] ?? null;
  },

  chooseBotMove(state: DotsState, botPlayerId: PlayerId): DotsMove {
    return chooseDotsBotMove(state, botPlayerId);
  },
};
