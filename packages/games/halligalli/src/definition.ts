import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { chooseHalliGalliBotMove } from "./bot.js";
import { createDeck, findMatchingFruit, shuffle, visibleTopCards } from "./rules.js";
import { FRUIT_LABEL, HalliGalliState, type HalliGalliMove } from "./state.js";

const MAX_PLAYERS = 4;

function getPile(csv: string): string[] {
  return csv ? csv.split(",") : [];
}

function setDeck(state: HalliGalliState, idx: number, cards: string[]): void {
  state.decks[idx] = cards.join(",");
}

function setFaceUp(state: HalliGalliState, idx: number, cards: string[]): void {
  state.faceUp[idx] = cards.join(",");
}

function totalCards(state: HalliGalliState, idx: number): number {
  return getPile(state.decks[idx] ?? "").length + getPile(state.faceUp[idx] ?? "").length;
}

function playerName(state: HalliGalliState, idx: number): string {
  return state.playerNames[idx] ?? "플레이어";
}

function nextIndex(state: HalliGalliState, idx: number): number {
  return (idx + 1) % state.players.length;
}

function setFlipMessage(state: HalliGalliState): void {
  state.message = `${playerName(state, state.turnIndex)}님의 차례: 카드를 뒤집으세요.`;
}

function startGame(state: HalliGalliState): void {
  const deck = shuffle(createDeck());
  const perPlayer = Math.floor(deck.length / state.players.length);
  for (let i = 0; i < state.players.length; i += 1) {
    setDeck(state, i, deck.splice(0, perPlayer));
  }
  state.phase = "playing";
  state.turnIndex = 0;
  setFlipMessage(state);
}

/**
 * A player can only reach zero total cards the instant a correct ring
 * clears their face-up pile (their deck is untouched by ring/flip
 * otherwise), so this is checked right after resolving a ring — never
 * inside applyMove itself, since a 0-card player could never have been
 * asked to move in the first place.
 */
function maybeDeclareWinner(state: HalliGalliState): boolean {
  const totals = state.players.map((_, i) => totalCards(state, i));
  if (totals.some((t) => t === 0)) {
    const maxCards = Math.max(...totals);
    const winnerIdx = totals.indexOf(maxCards);
    state.winnerId = state.players[winnerIdx]!;
    state.message = `🔔 ${playerName(state, winnerIdx)}님이 승리했어요!`;
    return true;
  }
  return false;
}

function applyFlip(state: HalliGalliState, idx: number): GameMoveResult {
  if (idx !== state.turnIndex) return { ok: false, error: "당신의 차례가 아니에요." };

  let deck = getPile(state.decks[idx] ?? "");
  if (deck.length === 0) {
    deck = shuffle(getPile(state.faceUp[idx] ?? ""));
    setFaceUp(state, idx, []);
  }

  const card = deck.pop()!;
  setDeck(state, idx, deck);
  setFaceUp(state, idx, [...getPile(state.faceUp[idx] ?? ""), card]);

  state.turnIndex = nextIndex(state, idx);
  setFlipMessage(state);
  return { ok: true };
}

function applyRing(state: HalliGalliState, idx: number): GameMoveResult {
  const match = findMatchingFruit(visibleTopCards(state));

  if (match) {
    // Collect face-up piles from all players
    const won: string[] = [];
    for (let i = 0; i < state.players.length; i += 1) {
      won.push(...getPile(state.faceUp[i] ?? ""));
      setFaceUp(state, i, []);
    }
    setDeck(state, idx, [...shuffle(won), ...getPile(state.decks[idx] ?? "")]);
    state.message = `🔔 ${playerName(state, idx)}님이 ${FRUIT_LABEL[match]} 5개를 발견해 카드 ${won.length}장을 가져갔어요!`;

    if (!maybeDeclareWinner(state)) {
      state.turnIndex = nextIndex(state, idx);
      setFlipMessage(state);
    }
    return { ok: true };
  }

  // Wrong ring: give one card from your deck to each other player
  const deck = getPile(state.decks[idx] ?? "");
  let penaltyMsg = "";
  for (let i = 0; i < state.players.length; i += 1) {
    if (i === idx) continue;
    const given = deck.pop();
    if (given === undefined) break;
    setDeck(state, i, [given, ...getPile(state.decks[i] ?? "")]);
    penaltyMsg = penaltyMsg ? penaltyMsg : `${playerName(state, idx)}님이 잘못 종을 쳐서 각자에게 카드 한 장씩 줬어요.`;
  }
  setDeck(state, idx, deck);
  state.message = penaltyMsg || `${playerName(state, idx)}님이 잘못 종을 쳤어요.`;
  return { ok: true };
}

export const halliGalliDefinition: GameDefinition<HalliGalliState, HalliGalliMove> = {
  id: "halli",
  displayName: "할리갈리",
  minPlayers: 2,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new HalliGalliState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    state.decks.push("");
    state.faceUp.push("");
    if (state.players.length >= 2) startGame(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx === -1) return { ok: false, error: "플레이어를 찾을 수 없어요." };

    // Ringing the bell is never gated by turn order — anyone can react to
    // the table at any time. Only flipping your own next card is.
    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "ring") return applyRing(state, idx);
    if (move.action === "flip") return applyFlip(state, idx);
    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase === "wait") return null;
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): HalliGalliMove {
    return chooseHalliGalliBotMove(state, botId);
  },
};
