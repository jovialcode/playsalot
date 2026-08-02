import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

/**
 * N×N boxes drawn on an (N+1)×(N+1) grid of dots. Kept small so the whole
 * board — every tappable edge — fits one mobile viewport without scrolling.
 */
export const BOXES_PER_SIDE = 4;
const N = BOXES_PER_SIDE;

/** Horizontal edges: (N+1) rows of N segments each. index = row*N + col. */
export const H_EDGE_COUNT = (N + 1) * N;
/** Vertical edges: N rows of (N+1) segments each. index = row*(N+1) + col. */
export const V_EDGE_COUNT = N * (N + 1);
export const BOX_COUNT = N * N;

/**
 * Edges and boxes are flat ArraySchema<number>s (0 = undrawn/unclaimed, else
 * playerIndex + 1), following omok's flat-array convention for clean
 * @colyseus/schema syncing. `declare` fields + constructor assignment +
 * defineTypes() are used for the encoding reason documented in omok's state.ts.
 */
export class DotsState extends Schema {
  declare hEdges: ArraySchema<number>;
  declare vEdges: ArraySchema<number>;
  declare boxes: ArraySchema<number>;
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare currentPlayer: number;
  declare winnerId: string;
  declare isDraw: boolean;

  constructor() {
    super();
    this.hEdges = new ArraySchema<number>(...Array<number>(H_EDGE_COUNT).fill(0));
    this.vEdges = new ArraySchema<number>(...Array<number>(V_EDGE_COUNT).fill(0));
    this.boxes = new ArraySchema<number>(...Array<number>(BOX_COUNT).fill(0));
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.currentPlayer = 0;
    this.winnerId = "";
    this.isDraw = false;
  }
}

defineTypes(DotsState, {
  hEdges: ["number"],
  vEdges: ["number"],
  boxes: ["number"],
  players: ["string"],
  playerNames: ["string"],
  currentPlayer: "number",
  winnerId: "string",
  isDraw: "boolean",
});

export interface DotsMove {
  type: "h" | "v";
  index: number;
}
