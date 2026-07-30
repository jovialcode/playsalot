import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { chooseGostopBot } from "./bot.js";
import {
  createDeck, shuffle, getMonth, fieldMatchesFor,
  toPile, fromPile, getHand, setHand, getCaptures, setCaptures,
  computeScore, isDoubleChaff, isChaff,
} from "./rules.js";
import { GostopState, type GostopMove } from "./state.js";

const MAX_PLAYERS = 4;

function playerName(state: GostopState, i: number): string {
  return state.playerNames[i] ?? `플레이어 ${i + 1}`;
}

function startGame(state: GostopState): void {
  const deck = shuffle(createDeck());
  const n = state.players.length;
  for (let i = 0; i < n; i += 1) {
    state.hands.push(fromPile(deck.splice(0, 7)));
    state.captures.push("");
    state.scores.push(0);
  }
  // Place 6 cards face-up on the field
  state.field = fromPile(deck.splice(0, 6));
  state.deck = fromPile(deck);
  state.phase = "play";
  state.turnIndex = 0;
  state.message = `${playerName(state, 0)}님이 먼저 카드를 내세요!`;
}

function drawCard(state: GostopState): string | undefined {
  const deck = toPile(state.deck);
  const card = deck.pop();
  state.deck = fromPile(deck);
  return card;
}

function captureCards(state: GostopState, playerIdx: number, toCapture: string[]): void {
  const caps = getCaptures(state, playerIdx);
  setCaptures(state, playerIdx, [...caps, ...toCapture]);
  const score = computeScore([...caps, ...toCapture]);
  state.scores[playerIdx] = score.total;
}

function removeFromField(state: GostopState, cards: string[]): void {
  const field = toPile(state.field).filter((c) => !cards.includes(c));
  state.field = fromPile(field);
}

function addToField(state: GostopState, card: string): void {
  const field = toPile(state.field);
  state.field = fromPile([...field, card]);
}

function applyPlayCard(
  state: GostopState,
  playerIdx: number,
  card: string,
  matchCard: string | undefined,
): GameMoveResult {
  const hand = getHand(state, playerIdx);
  const cardIdx = hand.indexOf(card);
  if (cardIdx === -1) return { ok: false, error: "그 카드는 손에 없어요." };

  // Remove from hand
  hand.splice(cardIdx, 1);
  setHand(state, playerIdx, hand);

  const field = toPile(state.field);
  const month = getMonth(card);
  const matches = fieldMatchesFor(field, month);

  let captured: string[] = [];

  if (matches.length === 0) {
    // No match: place on field
    addToField(state, card);
  } else if (matches.length === 1) {
    // Exact match: capture both
    captured = [card, matches[0]!];
    removeFromField(state, matches);
  } else if (matches.length >= 2) {
    // Multiple matches: player chooses one (matchCard param) or auto-choose first
    const chosen = matchCard && matches.includes(matchCard) ? matchCard : matches[0]!;
    if (matches.length === 3) {
      // 3 of same month on field + your card = capture all 4
      captured = [card, ...matches];
      removeFromField(state, matches);
    } else {
      captured = [card, chosen];
      removeFromField(state, [chosen]);
    }
  }

  // Draw from deck
  const drawn = drawCard(state);
  if (drawn) {
    const drawnMonth = getMonth(drawn);
    const drawnMatches = fieldMatchesFor(toPile(state.field), drawnMonth);
    if (drawnMatches.length === 0) {
      addToField(state, drawn);
    } else if (drawnMatches.length === 1) {
      captured = [...captured, drawn, drawnMatches[0]!];
      removeFromField(state, drawnMatches);
    } else if (drawnMatches.length >= 2) {
      // Auto-choose first
      const chosen2 = drawnMatches[0]!;
      captured = [...captured, drawn, chosen2];
      removeFromField(state, [chosen2]);
    }
  }

  if (captured.length > 0) {
    captureCards(state, playerIdx, captured);
  }

  // Check if hand is empty = deck exhausted (draw is 피 if no cards left)
  const n = state.players.length;
  const allHandsEmpty = Array.from({ length: n }).every((_, i) => getHand(state, i).length === 0);
  const deckEmpty = toPile(state.deck).length === 0;

  if (allHandsEmpty && deckEmpty) {
    // End of round: highest score wins
    const scores = Array.from({ length: n }).map((_, i) => computeScore(getCaptures(state, i)).total);
    const maxScore = Math.max(...scores);
    const winnerIdx = scores.indexOf(maxScore);
    state.winnerId = state.players[winnerIdx] ?? "";
    state.phase = "done";
    state.message = `게임 종료! ${playerName(state, winnerIdx)}님 승리!`;
    return { ok: true };
  }

  // Check if current player's score is high enough to go/stop (≥3 points)
  const myScore = computeScore(getCaptures(state, playerIdx)).total;
  if (myScore >= 3) {
    state.phase = "go-stop";
    state.message = `${playerName(state, playerIdx)}님, 고(계속) 또는 스톱(승리 선언)?`;
    return { ok: true };
  }

  // Next turn
  const nextIdx = (playerIdx + 1) % n;
  state.turnIndex = nextIdx;
  state.message = `${playerName(state, nextIdx)}님 차례!`;
  return { ok: true };
}

function applyGoStop(state: GostopState, playerIdx: number, go: boolean): GameMoveResult {
  if (state.phase !== "go-stop") return { ok: false, error: "지금은 고/스톱을 선택할 수 없어요." };
  if (playerIdx !== state.turnIndex) return { ok: false, error: "당신의 차례가 아니에요." };

  if (!go) {
    // Stop: declare win
    state.winnerId = state.players[playerIdx] ?? "";
    state.phase = "done";
    const score = computeScore(getCaptures(state, playerIdx)).total;
    const finalScore = score * Math.pow(2, state.goCount);
    state.message = `스톱! ${playerName(state, playerIdx)}님 승리! (${finalScore}점)`;
    return { ok: true };
  }

  // Go: double the eventual score, continue
  state.goCount += 1;
  state.phase = "play";
  const goNext = (playerIdx + 1) % state.players.length;
  state.turnIndex = goNext;
  state.message = `고! ${playerName(state, playerIdx)}님이 계속 도전! (배율 ×${Math.pow(2, state.goCount)}) — ${playerName(state, goNext)}님 차례.`;
  return { ok: true };
}

export const gostopDefinition: GameDefinition<GostopState, GostopMove> = {
  id: "gostop",
  displayName: "고스톱",
  minPlayers: 2,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new GostopState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    if (state.players.length >= 2) startGame(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx === -1) return { ok: false, error: "플레이어를 찾을 수 없어요." };
    if (idx !== state.turnIndex && move.action !== "stop") {
      return { ok: false, error: "당신의 차례가 아니에요." };
    }

    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "play") return applyPlayCard(state, idx, move.card, move.matchCard);
    if (move.action === "go") return applyGoStop(state, idx, true);
    if (move.action === "stop") return applyGoStop(state, idx, false);
    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase === "wait") return null;
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): GostopMove {
    return chooseGostopBot(state, botId);
  },
};
