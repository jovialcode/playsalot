import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { chooseYutnoriBot } from "./bot.js";
import {
  HOME, OFF_BOARD, NUM_PIECES,
  advancePosition, getPieces, setPieces,
  throwYut, isExtraThrow, allHome,
} from "./rules.js";
import { THROW_NAME, YutnoriState, type YutnoriMove } from "./state.js";

const MAX_PLAYERS = 2;

function playerName(state: YutnoriState, idx: number): string {
  return state.playerNames[idx] ?? `플레이어 ${idx + 1}`;
}

function startGame(state: YutnoriState): void {
  for (let i = 0; i < state.players.length; i += 1) {
    state.pieces.push("-1,-1,-1,-1");
  }
  state.phase = "throw";
  state.turnIndex = 0;
  state.message = `${playerName(state, 0)}님이 먼저 던지세요!`;
}

function applyThrow(state: YutnoriState, playerIdx: number): GameMoveResult {
  if (state.phase !== "throw") {
    return { ok: false, error: "지금은 던질 차례가 아니에요." };
  }
  if (playerIdx !== state.turnIndex) {
    return { ok: false, error: "당신의 차례가 아니에요." };
  }

  const result = throwYut();
  state.throwResult = result;

  const throwName = THROW_NAME[result] ?? `${result}`;
  state.message = `${playerName(state, playerIdx)}님이 ${throwName}! (${result}칸) — 말을 선택하세요.`;

  // Check if all pieces are home (can't happen mid-game but guard anyway)
  const pieces = getPieces(state, playerIdx);
  const canMove = pieces.some((p) => p !== HOME);
  if (!canMove) {
    // All home means game should have ended already
    state.winnerId = state.players[playerIdx] ?? "";
    state.phase = "done";
    return { ok: true };
  }

  state.phase = "choose";
  return { ok: true };
}

function applyMove(state: YutnoriState, playerIdx: number, pieceIndex: number): GameMoveResult {
  if (state.phase !== "choose") {
    return { ok: false, error: "먼저 윷을 던지세요." };
  }
  if (playerIdx !== state.turnIndex) {
    return { ok: false, error: "당신의 차례가 아니에요." };
  }
  if (pieceIndex < 0 || pieceIndex >= NUM_PIECES) {
    return { ok: false, error: "잘못된 말 번호예요." };
  }

  const pieces = getPieces(state, playerIdx);
  if (pieces[pieceIndex] === HOME) {
    return { ok: false, error: "이미 집에 도착한 말이에요." };
  }

  const opponentIdx = 1 - playerIdx;
  const opponentPieces = getPieces(state, opponentIdx);

  const fromPos = pieces[pieceIndex]!;
  const newPos = advancePosition(fromPos, state.throwResult);

  // Move all friendly pieces stacked at the same position together
  const stackedIndexes = pieces
    .map((p, i) => (p === fromPos ? i : -1))
    .filter((i) => i !== -1);

  for (const si of stackedIndexes) {
    pieces[si] = newPos;
  }

  // Capture: send any opponent pieces at the same destination back to off-board
  let captured = false;
  if (newPos !== HOME && newPos !== OFF_BOARD) {
    for (let i = 0; i < opponentPieces.length; i += 1) {
      if (opponentPieces[i] === newPos) {
        opponentPieces[i] = OFF_BOARD;
        captured = true;
      }
    }
  }

  setPieces(state, playerIdx, pieces);
  setPieces(state, opponentIdx, opponentPieces);

  const throwName = THROW_NAME[state.throwResult] ?? `${state.throwResult}`;
  const captureMsg = captured ? " 🏹 상대 말을 잡았어요! 한 번 더!" : "";

  // Check win
  if (allHome(state, playerIdx)) {
    state.winnerId = state.players[playerIdx] ?? "";
    state.phase = "done";
    state.message = `🎉 ${playerName(state, playerIdx)}님이 모든 말을 집에 보내 승리!`;
    state.throwResult = 0;
    return { ok: true };
  }

  // Extra throw on 윷/모 or capture
  const extra = isExtraThrow(state.throwResult) || captured;
  state.throwResult = 0;

  if (extra) {
    state.phase = "throw";
    state.message = `${playerName(state, playerIdx)}님이 ${throwName} 또는 잡기로 한 번 더 던져요!${captureMsg}`;
  } else {
    state.turnIndex = 1 - playerIdx;
    state.phase = "throw";
    state.message = `${playerName(state, 1 - playerIdx)}님이 던지세요!`;
  }

  return { ok: true };
}

export const yutnoriDefinition: GameDefinition<YutnoriState, YutnoriMove> = {
  id: "yutnori",
  displayName: "윷놀이",
  minPlayers: 2,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new YutnoriState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    if (state.players.length === MAX_PLAYERS) startGame(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx === -1) return { ok: false, error: "플레이어를 찾을 수 없어요." };

    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "throw") return applyThrow(state, idx);
    if (move.action === "move") return applyMove(state, idx, move.pieceIndex);
    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase === "wait") return null;
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): YutnoriMove {
    return chooseYutnoriBot(state, botId);
  },
};
