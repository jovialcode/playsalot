import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { choosePresidentBot } from "./bot.js";
import {
  createDeck, shuffle, fromPile, getHand, setHand, sortHand,
  toPile, validatePlay, findStartPlayer, nextPlayer,
} from "./rules.js";
import { PresidentState, type PresidentMove } from "./state.js";

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;

function playerName(state: PresidentState, i: number): string {
  return state.playerNames[i] ?? `플레이어 ${i + 1}`;
}

function startGame(state: PresidentState): void {
  const deck = shuffle(createDeck());
  const n = state.players.length;
  const perPlayer = Math.floor(deck.length / n);
  for (let i = 0; i < n; i += 1) {
    const dealt = deck.splice(0, perPlayer);
    state.hands.push(fromPile(sortHand(dealt)));
    state.passFlags.push(0);
  }
  // Leftover cards go to player 0 (minor imbalance for non-divisible sizes)
  if (deck.length > 0) {
    const hand = getHand(state, 0);
    setHand(state, 0, sortHand([...hand, ...deck]));
  }

  state.phase = "play";
  const start = findStartPlayer(state);
  state.turnIndex = start;
  state.lastPlayIndex = start;
  state.message = `${playerName(state, start)}님이 먼저 패를 내세요! (3♠ 보유자)`;
}

function clearRound(state: PresidentState, leadIndex: number): void {
  state.pile = "";
  state.pileCount = 0;
  state.pileRank = 0;
  state.pileBomb = false;
  for (let i = 0; i < state.passFlags.length; i += 1) {
    state.passFlags[i] = 0;
  }
  state.turnIndex = leadIndex;
  state.lastPlayIndex = leadIndex;
  state.message = `${playerName(state, leadIndex)}님이 새 판을 시작해요.`;
}

function applyPlay(state: PresidentState, playerIdx: number, cards: string[]): GameMoveResult {
  if (playerIdx !== state.turnIndex) return { ok: false, error: "당신의 차례가 아니에요." };

  const hand = getHand(state, playerIdx);
  for (const c of cards) {
    if (!hand.includes(c)) return { ok: false, error: `${c} 카드가 없어요.` };
  }

  const { ok, error, isBomb, rank } = validatePlay(
    cards,
    state.pileCount,
    state.pileRank,
    state.pileBomb,
  );
  if (!ok) return { ok: false, error: error ?? "낼 수 없는 패예요." };

  // Remove cards from hand
  const newHand = [...hand];
  for (const c of cards) {
    const i = newHand.indexOf(c);
    if (i !== -1) newHand.splice(i, 1);
  }
  setHand(state, playerIdx, newHand);

  // Update pile
  state.pile = fromPile(cards);
  state.pileCount = isBomb ? state.pileCount || cards.length : cards.length;
  state.pileRank = rank;
  state.pileBomb = isBomb;
  state.lastPlayIndex = playerIdx;
  state.passFlags[playerIdx] = 0;

  // Check win
  if (newHand.length === 0) {
    state.winnerId = state.players[playerIdx] ?? "";
    state.phase = "done";
    state.message = `🏆 ${playerName(state, playerIdx)}님이 패를 모두 냈어요! 대통령!`;
    return { ok: true };
  }

  // Advance turn
  const n = state.players.length;
  const next = nextPlayer(playerIdx, n);
  state.turnIndex = next;
  state.passFlags[next] = 0; // reset their pass flag as we advance

  state.message = `${playerName(state, playerIdx)}님이 냈어요 → ${playerName(state, next)}님 차례.`;
  return { ok: true };
}

function applyPass(state: PresidentState, playerIdx: number): GameMoveResult {
  if (playerIdx !== state.turnIndex) return { ok: false, error: "당신의 차례가 아니에요." };
  if (state.pileCount === 0) return { ok: false, error: "첫 판에는 패스할 수 없어요." };

  const n = state.players.length;
  state.passFlags[playerIdx] = 1;

  // Count consecutive passes (excluding last player who played)
  const passCount = Array.from(state.passFlags).reduce((sum, f) => sum + f, 0);

  if (passCount >= n - 1) {
    // All others passed: lastPlayIndex leads next round
    clearRound(state, state.lastPlayIndex);
    return { ok: true };
  }

  // Move to next player
  let next = nextPlayer(playerIdx, n);
  // Skip players who already passed this round
  let loops = 0;
  while (state.passFlags[next] === 1 && loops < n) {
    next = nextPlayer(next, n);
    loops += 1;
  }

  state.turnIndex = next;
  state.message = `${playerName(state, playerIdx)}님 패스 → ${playerName(state, next)}님 차례.`;
  return { ok: true };
}

export const presidentDefinition: GameDefinition<PresidentState, PresidentMove> = {
  id: "president",
  displayName: "대통령",
  minPlayers: MIN_PLAYERS,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new PresidentState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    // Game starts when MIN_PLAYERS joined (or immediately at 2 for quick start)
    if (state.players.length >= MIN_PLAYERS) startGame(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx === -1) return { ok: false, error: "플레이어를 찾을 수 없어요." };

    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "play") return applyPlay(state, idx, move.cards);
    if (move.action === "pass") return applyPass(state, idx);
    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase !== "play") return null;
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): PresidentMove {
    return choosePresidentBot(state, botId);
  },
};
