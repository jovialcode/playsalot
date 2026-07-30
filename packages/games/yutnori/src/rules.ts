import type { YutnoriState } from "./state.js";

export const HOME = 99;
export const OFF_BOARD = -1;
export const NUM_PIECES = 4;

/**
 * Outer ring: 0(start) → 1→2→3→4 → 5(SE) → 6→7→8→9 → 10(SW)
 *   → 11→12→13→14 → 15(NW) → 16→17→18→19 → HOME(99)
 *
 * Shortcut from 5 (SE corner):  5→20→21(center)→22→15
 * Shortcut from 10 (SW corner): 10→23→28(center)→24→99
 *
 * Shortcuts are taken only when a piece LANDS on a corner
 * (not when passing through mid-move — passing continues on outer ring).
 */
const OUTER_NEXT: Record<number, number> = {
  0: 1, 1: 2, 2: 3, 3: 4, 4: 5,
  5: 6, 6: 7, 7: 8, 8: 9, 9: 10,
  10: 11, 11: 12, 12: 13, 13: 14, 14: 15,
  15: 16, 16: 17, 17: 18, 18: 19, 19: HOME,
};

const SHORTCUT_START: Record<number, number> = {
  5: 20,  // SE corner → inner diagonal shortcut entry
  10: 23, // SW corner → inner anti-diagonal shortcut entry
};

const INNER_NEXT: Record<number, number> = {
  // SE diagonal: near-SE → center(21) → near-NW → NW corner(15)
  20: 21, 21: 22, 22: 15,
  // SW anti-diagonal: near-SW → center(28) → near-NE → HOME
  23: 28, 28: 24, 24: HOME,
};

const SHORTCUT_CORNERS = new Set(Object.keys(SHORTCUT_START).map(Number));

/** One step forward from current position. Shortcut corners are NOT auto-entered here. */
function outerOrInnerStep(pos: number): number {
  if (pos in INNER_NEXT) return INNER_NEXT[pos]!;
  return OUTER_NEXT[pos] ?? HOME;
}

/**
 * Move `pos` forward by `steps`. Shortcut is taken only when the piece's
 * STORED position is a shortcut corner (meaning it landed there previously).
 * Mid-move passes through a corner follow the outer ring.
 */
export function advancePosition(storedPos: number, steps: number): number {
  if (storedPos === HOME) return HOME;

  // Off-board: first step brings piece to position 1 (start entry)
  let pos = storedPos === OFF_BOARD ? 0 : storedPos;
  let firstStep = true;

  for (let i = 0; i < steps; i++) {
    if (pos === HOME) return HOME;

    let nextPos: number;
    if (firstStep && SHORTCUT_CORNERS.has(pos)) {
      // Piece is resting at a shortcut corner → first step uses shortcut
      nextPos = SHORTCUT_START[pos]!;
    } else {
      nextPos = outerOrInnerStep(pos);
    }

    pos = nextPos;
    firstStep = false;
  }

  return pos;
}

export function getPieces(state: YutnoriState, playerIdx: number): number[] {
  const raw = state.pieces[playerIdx] ?? "-1,-1,-1,-1";
  return raw.split(",").map(Number);
}

export function setPieces(state: YutnoriState, playerIdx: number, pieces: number[]): void {
  state.pieces[playerIdx] = pieces.join(",");
}

/** Simulate a yut throw (4 sticks, each 50/50 flat or round). */
export function throwYut(): number {
  let flats = 0;
  for (let i = 0; i < 4; i++) {
    if (Math.random() < 0.5) flats += 1;
  }
  return flats === 0 ? 5 : flats; // 0 flat = 모(5)
}

/** True if this throw result grants an extra throw. */
export function isExtraThrow(result: number): boolean {
  return result === 4 || result === 5; // 윷 or 모
}

/** True if all pieces for a player are home. */
export function allHome(state: YutnoriState, playerIdx: number): boolean {
  return getPieces(state, playerIdx).every((p) => p === HOME);
}

/** Board pixel coordinates for UI (on a 300×300 canvas). */
export const BOARD_COORDS: Record<number, [number, number]> = {
  // Outer ring
  0: [300, 0], 1: [300, 60], 2: [300, 120], 3: [300, 180], 4: [300, 240],
  5: [300, 300], 6: [240, 300], 7: [180, 300], 8: [120, 300], 9: [60, 300],
  10: [0, 300], 11: [0, 240], 12: [0, 180], 13: [0, 120], 14: [0, 60],
  15: [0, 0], 16: [60, 0], 17: [120, 0], 18: [180, 0], 19: [240, 0],
  // SE diagonal shortcut (corner 5 → NW corner 15)
  20: [240, 240], 21: [150, 150], 22: [60, 60],
  // SW anti-diagonal shortcut (corner 10 → HOME)
  23: [60, 240], 28: [150, 150], 24: [240, 60],
};

export const CORNER_POSITIONS = new Set([0, 5, 10, 15]);
