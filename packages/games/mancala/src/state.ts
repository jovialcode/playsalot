import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export const PITS_PER_PLAYER = 6;
export const SEEDS_PER_PIT = 4;
export const TOTAL_SLOTS = 14; // 6 pits + 1 store, per player
/** Store (Kalah) slot each player scores into — index 6 for player 0, 13 for player 1. */
export const STORE_INDEX = [6, 13] as const;

/**
 * board is a flat 14-slot mancala (Kalah) layout — the same "single flat
 * ArraySchema<number>" choice omok makes, since @colyseus/schema syncs a flat
 * array far better than nested ones:
 *
 *   index:  0  1  2  3  4  5   6(store0)   7  8  9 10 11 12   13(store1)
 *           └─── player 0 pits ──┘         └─── player 1 pits ──┘
 *
 * Seeds are sown counterclockwise (index + 1), the mover passing their own
 * store but skipping the opponent's.
 *
 * Fields use `declare` + explicit constructor assignment + defineTypes() (not
 * class-field initializers or the @type decorator) for the exact
 * @colyseus/schema encoding reason spelled out in omok's state.ts.
 */
export class MancalaState extends Schema {
  declare board: ArraySchema<number>;
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare currentPlayer: number;
  declare winnerId: string;
  declare isDraw: boolean;

  constructor() {
    super();
    this.board = new ArraySchema<number>(...initialSeeds());
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.currentPlayer = 0;
    this.winnerId = "";
    this.isDraw = false;
  }
}

function initialSeeds(): number[] {
  const slots = Array<number>(TOTAL_SLOTS).fill(SEEDS_PER_PIT);
  slots[STORE_INDEX[0]] = 0;
  slots[STORE_INDEX[1]] = 0;
  return slots;
}

defineTypes(MancalaState, {
  board: ["number"],
  players: ["string"],
  playerNames: ["string"],
  currentPlayer: "number",
  winnerId: "string",
  isDraw: "boolean",
});

export interface MancalaMove {
  /** Absolute board index of the pit to sow from (must be one of the mover's own pits). */
  pit: number;
}
