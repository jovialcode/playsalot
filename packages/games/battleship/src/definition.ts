import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { chooseBattleshipBot } from "./bot.js";
import {
  CELL_HIT, CELL_MISS, CELL_SHIP, CELL_WATER,
  allShipsSunk, emptyGrid, getGrid, idx, inBounds, placeShips, setGrid,
} from "./rules.js";
import { BattleshipState, type BattleshipMove } from "./state.js";

const MAX_PLAYERS = 2;

function playerName(state: BattleshipState, i: number): string {
  return state.playerNames[i] ?? `플레이어 ${i + 1}`;
}

function startSetup(state: BattleshipState): void {
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    state.ownGrids.push(emptyGrid().join(","));
    state.attackGrids.push(emptyGrid().join(","));
    state.readyFlags.push(0);
  }
  state.phase = "setup";
  state.message = "각자 함선을 배치하세요.";
}

function applyPlaceShips(state: BattleshipState, playerIdx: number, move: Extract<BattleshipMove, { action: "place-ships" }>): GameMoveResult {
  if (state.readyFlags[playerIdx] === 1) {
    return { ok: false, error: "이미 함선을 배치했어요." };
  }

  const { grid, error } = placeShips(move.ships);
  if (error) return { ok: false, error };

  setGrid(state, playerIdx, "own", grid);
  state.readyFlags[playerIdx] = 1;

  if (state.readyFlags[0] === 1 && state.readyFlags[1] === 1) {
    state.phase = "play";
    state.turnIndex = 0;
    state.message = `${playerName(state, 0)}님이 먼저 공격하세요!`;
  } else {
    state.message = `${playerName(state, playerIdx)}님이 준비완료! 상대방을 기다리는 중...`;
  }

  return { ok: true };
}

function applyAttack(state: BattleshipState, playerIdx: number, move: Extract<BattleshipMove, { action: "attack" }>): GameMoveResult {
  if (state.phase !== "play") return { ok: false, error: "아직 공격할 차례가 아니에요." };
  if (playerIdx !== state.turnIndex) return { ok: false, error: "당신의 차례가 아니에요." };

  const { row, col } = move;
  if (!inBounds(row, col)) return { ok: false, error: "공격 범위를 벗어났어요." };

  const opponentIdx = 1 - playerIdx;
  const opponentGrid = getGrid(state, opponentIdx, "own");
  const myAttackGrid = getGrid(state, playerIdx, "attack");

  const cell = idx(row, col);
  if (myAttackGrid[cell] === CELL_HIT || myAttackGrid[cell] === CELL_MISS) {
    return { ok: false, error: "이미 공격한 칸이에요." };
  }

  const isHit = opponentGrid[cell] === CELL_SHIP;
  const newValue = isHit ? CELL_HIT : CELL_MISS;
  myAttackGrid[cell] = newValue;
  opponentGrid[cell] = isHit ? CELL_HIT : (opponentGrid[cell] ?? CELL_WATER);

  setGrid(state, playerIdx, "attack", myAttackGrid);
  setGrid(state, opponentIdx, "own", opponentGrid);

  if (isHit && allShipsSunk(opponentGrid)) {
    state.winnerId = state.players[playerIdx] ?? "";
    state.phase = "done";
    state.message = `💥 ${playerName(state, playerIdx)}님이 상대 함대를 모두 격침시켰어요!`;
    return { ok: true };
  }

  if (isHit) {
    state.message = `💥 명중! ${playerName(state, playerIdx)}님이 한 번 더 공격해요!`;
    // Hit = extra turn (classic house rule)
  } else {
    state.turnIndex = 1 - playerIdx;
    state.message = `💦 빗나감. ${playerName(state, 1 - playerIdx)}님 차례!`;
  }

  return { ok: true };
}

export const battleshipDefinition: GameDefinition<BattleshipState, BattleshipMove> = {
  id: "battleship",
  displayName: "배틀쉽",
  minPlayers: 2,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new BattleshipState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    if (state.players.length === MAX_PLAYERS) startSetup(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx === -1) return { ok: false, error: "플레이어를 찾을 수 없어요." };

    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "place-ships") return applyPlaceShips(state, idx, move);
    if (move.action === "attack") return applyAttack(state, idx, move);
    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase === "wait") return null;
    if (state.phase === "setup") {
      // Both players act simultaneously during setup — return null (no single turn)
      return null;
    }
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): BattleshipMove {
    return chooseBattleshipBot(state, botId);
  },
};
