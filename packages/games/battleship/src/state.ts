import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export const GRID_SIZE = 8; // 8×8 board (simpler than standard 10×10)

/**
 * Ships: 5 ships total (sizes 4, 3, 3, 2, 2).
 *
 * Grid encoding (flat GRID_SIZE² array per player):
 *   0 = unknown/water, 1 = ship, 2 = hit, 3 = miss
 *
 * We store TWO grids per player:
 *   - `ownGrids[idx]`    — their own board (ships visible to themselves only)
 *   - `attackGrids[idx]` — what they've seen of the opponent (hits/misses)
 *
 * The opponent's `attackGrids` mirrors what each player's `ownGrid` has revealed.
 *
 * Fields use declare + constructor-assignment + defineTypes() — see OmokState.
 */
export class BattleshipState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare ownGrids: ArraySchema<string>;    // CSV of flat grid (own board, ships=1)
  declare attackGrids: ArraySchema<string>; // CSV of flat grid (seen from attacks)
  declare phase: string; // "wait" | "setup" | "play" | "done"
  declare turnIndex: number;
  declare readyFlags: ArraySchema<number>;  // 1 if player finished placing ships
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.ownGrids = new ArraySchema<string>();
    this.attackGrids = new ArraySchema<string>();
    this.readyFlags = new ArraySchema<number>();
    this.phase = "wait";
    this.turnIndex = 0;
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(BattleshipState, {
  players: ["string"],
  playerNames: ["string"],
  ownGrids: ["string"],
  attackGrids: ["string"],
  readyFlags: ["number"],
  phase: "string",
  turnIndex: "number",
  message: "string",
  winnerId: "string",
});

export const SHIP_SIZES = [4, 3, 3, 2, 2];
export const TOTAL_SHIP_CELLS = SHIP_SIZES.reduce((a, b) => a + b, 0);

export type BattleshipMove =
  | { action: "place-ships"; ships: ShipPlacement[] }
  | { action: "attack"; row: number; col: number };

export interface ShipPlacement {
  row: number;
  col: number;
  size: number;
  horizontal: boolean;
}
