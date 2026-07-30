import type { PresidentState } from "./state.js";

// ── Card helpers ──────────────────────────────────────────────────────────────

export const RANKS = ["3","4","5","6","7","8","9","10","J","Q","K","A","2"] as const;
export type Rank = (typeof RANKS)[number];
export const SUITS = ["s","h","d","c"] as const;
export type Suit = (typeof SUITS)[number];

/** Numeric rank value (3=0 … 2=12). Higher is stronger. */
export function rankValue(card: string): number {
  const r = card.split("-")[0] ?? "";
  return RANKS.indexOf(r as Rank);
}

export function cardRank(card: string): string {
  return card.split("-")[0] ?? "";
}

export function cardSuit(card: string): string {
  return card.split("-")[1] ?? "";
}

export const SUIT_EMOJI: Record<string, string> = {
  s: "♠", h: "♥", d: "♦", c: "♣",
};

export const RANK_DISPLAY: Record<string, string> = {
  "3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
  "10":"10","J":"J","Q":"Q","K":"K","A":"A","2":"2",
};

// ── Deck ──────────────────────────────────────────────────────────────────────

export function createDeck(): string[] {
  const deck: string[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(`${rank}-${suit}`);
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ── Pile helpers ──────────────────────────────────────────────────────────────

export function toPile(csv: string): string[] {
  return csv ? csv.split(",").filter(Boolean) : [];
}

export function fromPile(cards: string[]): string {
  return cards.join(",");
}

export function getHand(state: PresidentState, idx: number): string[] {
  return toPile(state.hands[idx] ?? "");
}

export function setHand(state: PresidentState, idx: number, cards: string[]): void {
  state.hands[idx] = fromPile(cards);
}

export function sortHand(cards: string[]): string[] {
  return [...cards].sort((a, b) => {
    const rv = rankValue(a) - rankValue(b);
    if (rv !== 0) return rv;
    return SUITS.indexOf(cardSuit(a) as Suit) - SUITS.indexOf(cardSuit(b) as Suit);
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface PlayValidation {
  ok: boolean;
  error?: string;
  isBomb: boolean;
  rank: number;
}

/**
 * Validate a play attempt against the current pile state.
 * Rules:
 *   - All played cards must share the same rank.
 *   - 4-of-a-kind = 폭탄 (bomb): beats any pile regardless of count.
 *   - Otherwise: card count must match pileCount (or pileCount=0 = new round).
 *   - Played rank must be strictly higher than pileRank.
 */
export function validatePlay(
  cards: string[],
  pileCount: number,
  pileRank: number,
  pileBomb: boolean,
): PlayValidation {
  if (cards.length === 0) {
    return { ok: false, error: "카드를 선택하세요.", isBomb: false, rank: 0 };
  }

  // All cards must be the same rank
  const firstRank = cardRank(cards[0]!);
  if (!cards.every((c) => cardRank(c) === firstRank)) {
    return { ok: false, error: "같은 숫자/문자의 카드만 함께 낼 수 있어요.", isBomb: false, rank: 0 };
  }

  const rv = rankValue(cards[0]!);
  const isBomb = cards.length === 4;

  // Bomb beats anything (except higher bomb)
  if (isBomb) {
    if (pileBomb && rv <= pileRank) {
      return { ok: false, error: "더 높은 폭탄만 이길 수 있어요.", isBomb: true, rank: rv };
    }
    return { ok: true, isBomb: true, rank: rv };
  }

  // Non-bomb must match pile count (when pile is active)
  if (pileCount > 0 && cards.length !== pileCount) {
    return {
      ok: false,
      error: `${pileCount}장을 내야 해요.`,
      isBomb: false,
      rank: rv,
    };
  }

  // Must beat the pile rank
  if (pileRank > 0 && rv <= pileRank) {
    return { ok: false, error: "더 높은 패를 내야 해요.", isBomb: false, rank: rv };
  }

  return { ok: true, isBomb: false, rank: rv };
}

/** Find the starting player: whoever has the 3♠ goes first. Fall back to 3♣. */
export function findStartPlayer(state: PresidentState): number {
  for (let i = 0; i < state.players.length; i += 1) {
    const hand = getHand(state, i);
    if (hand.includes("3-s")) return i;
  }
  for (let i = 0; i < state.players.length; i += 1) {
    const hand = getHand(state, i);
    if (hand.includes("3-c")) return i;
  }
  return 0;
}

/** Next player index (wraps around, skips no one — pass logic handled separately). */
export function nextPlayer(current: number, total: number): number {
  return (current + 1) % total;
}
