import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

/**
 * Board layout (positions 0-28 + HOME=99):
 *
 * Outer ring (clockwise from top-right/start):
 *   0(start) → 1→2→3→4 → 5(SE corner) → 6→7→8→9 → 10(SW corner)
 *   → 11→12→13→14 → 15(NW corner) → 16→17→18→19 → HOME(99)
 *
 * Shortcut from corner 5 (SE): 5→20→21→22→15  (via center 21)
 * Shortcut from corner 10 (SW): 10→23→28→24→99  (via center 28, goes home)
 *
 * Positions 21 and 28 both visually occupy the board center.
 *
 * Pieces: stored as CSV of 4 positions per player in `pieces` ArraySchema.
 *   -1 = not yet on board, 99 = home (done).
 *
 * Fields use declare + constructor-assignment + defineTypes() — see OmokState
 * comment for why this is required across this monorepo's mixed toolchain.
 */
export class YutnoriState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare pieces: ArraySchema<string>; // one per player, CSV of 4 positions (-1..99)
  declare phase: string; // "wait" | "throw" | "choose" | "done"
  declare turnIndex: number;
  declare throwResult: number; // 1-5 (도/개/걸/윷/모), 0 = no pending throw
  declare extraThrows: number; // bonus throws remaining
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.pieces = new ArraySchema<string>();
    this.phase = "wait";
    this.turnIndex = 0;
    this.throwResult = 0;
    this.extraThrows = 0;
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(YutnoriState, {
  players: ["string"],
  playerNames: ["string"],
  pieces: ["string"],
  phase: "string",
  turnIndex: "number",
  throwResult: "number",
  extraThrows: "number",
  message: "string",
  winnerId: "string",
});

export type YutnoriMove =
  | { action: "throw" }
  | { action: "move"; pieceIndex: number };

export const THROW_NAME: Record<number, string> = {
  1: "도",
  2: "개",
  3: "걸",
  4: "윷",
  5: "모",
};
