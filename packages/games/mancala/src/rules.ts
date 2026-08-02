import { PITS_PER_PLAYER, STORE_INDEX, TOTAL_SLOTS } from "./state.js";

/** Absolute indices of a player's own six pits (the only ones they may sow from). */
export function ownPits(playerIndex: number): number[] {
  const start = playerIndex === 0 ? 0 : 7;
  return Array.from({ length: PITS_PER_PLAYER }, (_, i) => start + i);
}

export function isOwnPit(playerIndex: number, index: number): boolean {
  return ownPits(playerIndex).includes(index);
}

/** The store the opponent owns — seeds are never sown into it. */
function opponentStore(playerIndex: number): number {
  return STORE_INDEX[playerIndex === 0 ? 1 : 0];
}

/** The pit directly across the board from `index`, used for captures. */
function oppositePit(index: number): number {
  return 12 - index;
}

export interface SowResult {
  board: number[];
  lastIndex: number;
  extraTurn: boolean;
}

/**
 * Sows every seed from `pit` counterclockwise on a COPY of `board`, applying
 * the two Kalah bonus rules:
 *  - last seed in your own store → you take another turn (`extraTurn`);
 *  - last seed in one of your own, previously-empty pits → you capture that
 *    seed plus every seed in the opposite pit into your store.
 * Assumes the move is legal (own, non-empty pit).
 */
export function sow(board: number[], playerIndex: number, pit: number): SowResult {
  const next = board.slice();
  const skip = opponentStore(playerIndex);
  const ownStore = STORE_INDEX[playerIndex === 0 ? 0 : 1];

  let seeds = next[pit] ?? 0;
  next[pit] = 0;
  let index = pit;
  while (seeds > 0) {
    index = (index + 1) % TOTAL_SLOTS;
    if (index === skip) continue;
    next[index] = (next[index] ?? 0) + 1;
    seeds -= 1;
  }

  const extraTurn = index === ownStore;
  if (!extraTurn && isOwnPit(playerIndex, index) && next[index] === 1) {
    const across = oppositePit(index);
    const captured = next[across] ?? 0;
    if (captured > 0) {
      next[ownStore] = (next[ownStore] ?? 0) + captured + 1;
      next[across] = 0;
      next[index] = 0;
    }
  }

  return { board: next, lastIndex: index, extraTurn };
}

/** The game ends the moment either player's six pits are all empty. */
export function isGameOver(board: number[]): boolean {
  return [0, 1].some((p) => ownPits(p).every((i) => (board[i] ?? 0) === 0));
}

/** Rakes each player's leftover pit seeds into their own store (on a copy). */
export function sweep(board: number[]): number[] {
  const next = board.slice();
  for (const p of [0, 1] as const) {
    const store = STORE_INDEX[p];
    for (const i of ownPits(p)) {
      next[store] = (next[store] ?? 0) + (next[i] ?? 0);
      next[i] = 0;
    }
  }
  return next;
}
