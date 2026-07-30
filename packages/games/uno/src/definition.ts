import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { UnoState, type UnoMove } from "./state.js";

const COLORS = ["r", "y", "g", "b"] as const;
type Color = (typeof COLORS)[number];

// ── Deck helpers ──────────────────────────────────────────────────────────────

function createDeck(): string[] {
  const deck: string[] = [];
  for (const c of COLORS) {
    deck.push(`${c}0`);
    for (let n = 1; n <= 9; n++) deck.push(`${c}${n}`, `${c}${n}`);
    deck.push(`${c}s`, `${c}s`, `${c}r`, `${c}r`, `${c}d`, `${c}d`);
  }
  for (let i = 0; i < 4; i++) deck.push("w", "wd");
  return deck; // 108 cards
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function getDeck(state: UnoState): string[] {
  return state.deck ? state.deck.split(",") : [];
}

function setDeck(state: UnoState, deck: string[]): void {
  state.deck = deck.join(",");
}

function getHand(state: UnoState, idx: number): string[] {
  const h = state.hands[idx];
  return h ? h.split(",") : [];
}

function setHand(state: UnoState, idx: number, hand: string[]): void {
  state.hands[idx] = hand.join(",");
}

function drawN(state: UnoState, playerIdx: number, count: number): void {
  const deck = getDeck(state);
  const hand = getHand(state, playerIdx);
  const drawn = Math.min(count, deck.length);
  for (let i = 0; i < drawn; i++) hand.push(deck.pop()!);
  setDeck(state, deck);
  setHand(state, playerIdx, hand);
}

// ── Card helpers ──────────────────────────────────────────────────────────────

function cardColor(card: string): string {
  return card === "w" || card === "wd" ? "w" : (card[0] ?? "r");
}

function cardType(card: string): string {
  return card === "w" || card === "wd" ? card : card.slice(1);
}

function canPlay(card: string, topCard: string, currentColor: string): boolean {
  if (card === "w" || card === "wd") return true;
  const cc = cardColor(card);
  if (cc === currentColor) return true;
  return cardType(card) === cardType(topCard);
}

// ── Turn helpers ──────────────────────────────────────────────────────────────

function nextIdx(state: UnoState, steps = 1): number {
  const n = state.players.length;
  return ((state.turnIndex + state.direction * steps) % n + n) % n;
}

function advanceTurn(state: UnoState, steps = 1): void {
  state.turnIndex = nextIdx(state, steps);
}

function playerName(state: UnoState, idx: number): string {
  return state.playerNames[idx] ?? "플레이어";
}

function setTurnMessage(state: UnoState): void {
  state.message = `${playerName(state, state.turnIndex)}님의 차례: 카드를 내거나 뽑으세요.`;
}

// ── Game start ────────────────────────────────────────────────────────────────

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const HAND_SIZE = 7;

function startGame(state: UnoState): void {
  const deck = shuffle(createDeck());

  // Deal 7 cards to each player
  for (let i = 0; i < state.players.length; i++) {
    setHand(state, i, deck.splice(0, HAND_SIZE));
  }

  // First card must not be a wild
  let top = deck.pop()!;
  while (top === "w" || top === "wd") {
    deck.unshift(top);
    top = deck.pop()!;
  }

  state.topCard = top;
  state.currentColor = cardColor(top) as Color;
  setDeck(state, deck);
  state.phase = "play";
  state.direction = 1;
  state.turnIndex = 0;

  // Apply starting card effects (no skip/draw yet for simplicity)
  const type = cardType(top);
  if (type === "r") {
    // Reverse with 2 players = skip first player
    state.direction = -1;
    advanceTurn(state);
  } else if (type === "s") {
    advanceTurn(state, 2);
  } else if (type === "d") {
    drawN(state, nextIdx(state), 2);
    advanceTurn(state, 2);
  }

  setTurnMessage(state);
}

// ── applyMove helpers ─────────────────────────────────────────────────────────

function applyPlayCard(state: UnoState, playerIdx: number, card: string): GameMoveResult {
  const hand = getHand(state, playerIdx);
  const cardIdx = hand.indexOf(card);
  if (cardIdx === -1) return { ok: false, error: "그 카드가 손에 없어요." };
  if (!canPlay(card, state.topCard, state.currentColor)) {
    return { ok: false, error: "낼 수 없는 카드예요. 색이나 숫자를 맞춰주세요." };
  }

  // Remove card from hand
  hand.splice(cardIdx, 1);
  setHand(state, playerIdx, hand);
  state.topCard = card;

  // Update color for non-wild cards
  if (card !== "w" && card !== "wd") {
    state.currentColor = cardColor(card) as Color;
  }

  // Win check
  if (hand.length === 0) {
    state.winnerId = state.players[playerIdx]!;
    state.message = `🎉 ${playerName(state, playerIdx)}님이 우노로 승리했어요!`;
    return { ok: true };
  }

  // Apply card effect
  const type = cardType(card);

  if (card === "w") {
    state.phase = "choose-color";
    state.message = `${playerName(state, playerIdx)}님, 색을 선택하세요.`;
    return { ok: true };
  }

  if (card === "wd") {
    state.phase = "choose-color";
    state.message = `${playerName(state, playerIdx)}님, 색을 선택하세요. (다음 플레이어 +4)`;
    return { ok: true };
  }

  if (type === "s") {
    advanceTurn(state, 2);
    state.message = `Skip! ${playerName(state, nextIdx(state, 0))}님의 차례예요.`;
    setTurnMessage(state);
    return { ok: true };
  }

  if (type === "r") {
    state.direction *= -1;
    if (state.players.length === 2) {
      advanceTurn(state, 2); // acts like skip
    } else {
      advanceTurn(state);
    }
    state.message = `Reverse! ${playerName(state, state.turnIndex)}님의 차례예요.`;
    return { ok: true };
  }

  if (type === "d") {
    const target = nextIdx(state);
    drawN(state, target, 2);
    advanceTurn(state, 2);
    state.message = `+2! ${playerName(state, target)}님이 카드 2장을 뽑아요.`;
    setTurnMessage(state);
    return { ok: true };
  }

  // Number card
  advanceTurn(state);
  setTurnMessage(state);
  return { ok: true };
}

function applyDraw(state: UnoState, playerIdx: number): GameMoveResult {
  if (getDeck(state).length === 0) {
    advanceTurn(state);
    setTurnMessage(state);
    return { ok: true };
  }
  drawN(state, playerIdx, 1);
  advanceTurn(state);
  setTurnMessage(state);
  return { ok: true };
}

function applyChooseColor(state: UnoState, playerIdx: number, color: string): GameMoveResult {
  if (!COLORS.includes(color as Color)) return { ok: false, error: "유효하지 않은 색이에요." };
  state.currentColor = color;

  if (state.topCard === "wd") {
    const target = nextIdx(state);
    drawN(state, target, 4);
    advanceTurn(state, 2);
    state.message = `+4! ${playerName(state, state.turnIndex)}님이 카드 4장을 뽑아요.`;
  } else {
    advanceTurn(state);
  }

  state.phase = "play";
  setTurnMessage(state);
  return { ok: true };
}

// ── Bot logic ─────────────────────────────────────────────────────────────────

function chooseBotPlay(state: UnoState, botIdx: number): UnoMove {
  if (state.phase === "choose-color") {
    return { action: "choose-color", color: "r" };
  }

  const hand = getHand(state, botIdx);

  // Prefer: action cards > wilds > numbers
  const playable = hand.filter((c) => canPlay(c, state.topCard, state.currentColor));
  if (playable.length === 0) return { action: "draw" };

  const actions = playable.filter((c) => {
    const t = cardType(c);
    return t === "s" || t === "r" || t === "d" || c === "wd";
  });
  const wilds = playable.filter((c) => c === "w");
  const pick = actions[0] ?? (hand.length <= 2 ? wilds[0] : undefined) ?? playable[0]!;

  return { action: "play", card: pick };
}

// ── Definition ────────────────────────────────────────────────────────────────

export const unoDefinition: GameDefinition<UnoState, UnoMove> = {
  id: "uno",
  displayName: "우노",
  minPlayers: 2,
  maxPlayers: MAX_PLAYERS,

  createInitialState: () => new UnoState(),

  addPlayer(state, player) {
    const playerId = typeof player === "string" ? player : player.id;
    state.players.push(playerId);
    state.playerNames.push(typeof player === "string" ? player : player.displayName);
    state.hands.push("");
    if (state.players.length >= MIN_PLAYERS) startGame(state);
  },

  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    if (state.phase === "wait") return { ok: false, error: "아직 게임이 시작되지 않았어요." };

    const idx = state.players.indexOf(playerId);
    if (idx < 0) return { ok: false, error: "플레이어를 찾을 수 없어요." };

    if (state.phase === "choose-color") {
      if (idx !== state.turnIndex) return { ok: false, error: "상대방이 색을 선택 중이에요." };
      if (!move || move.action !== "choose-color") return { ok: false, error: "색을 선택해주세요." };
      return applyChooseColor(state, idx, move.color);
    }

    if (idx !== state.turnIndex) return { ok: false, error: "상대방의 차례예요." };
    if (!move) return { ok: false, error: "알 수 없는 행동이에요." };

    if (move.action === "play") return applyPlayCard(state, idx, move.card);
    if (move.action === "draw") return applyDraw(state, idx);

    return { ok: false, error: "알 수 없는 행동이에요." };
  },

  checkGameOver(state): GameOverResult | null {
    return state.winnerId ? { winnerId: state.winnerId } : null;
  },

  getCurrentTurnPlayerId(state): PlayerId | null {
    if (state.winnerId || state.phase === "wait") return null;
    return state.players[state.turnIndex] ?? null;
  },

  chooseBotMove(state, botId): UnoMove {
    const idx = state.players.indexOf(botId);
    return chooseBotPlay(state, idx);
  },
};
