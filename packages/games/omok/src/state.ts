import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

/** Standard gomoku/omok board is 15x15; 5 in a row wins. */
export const BOARD_SIZE = 15;

/**
 * board is a flat BOARD_SIZE*BOARD_SIZE array: 0 = empty, 1 = first player's
 * stone, 2 = second player's stone. Flat instead of nested because
 * @colyseus/schema syncs nested ArraySchema-of-ArraySchema poorly compared
 * to a single flat array.
 *
 * Fields are wired up via `defineTypes()` (a plain function call, not the
 * `@type()` decorator) and declared with `declare` + assigned in an explicit
 * constructor rather than as class-field initializers.
 *
 * Why: @colyseus/schema's base `Schema` constructor installs an
 * accessor (getter/setter) for each field as an *own instance property*
 * via `Object.defineProperties`, and the setter is what registers the
 * ArraySchema's `$childType` needed for encoding. A class-field initializer
 * (`board = new ArraySchema(...)`) compiles to `Object.defineProperty`
 * under "useDefineForClassFields", which silently overwrites that accessor
 * with a plain data property and breaks encoding — and different tools in
 * this monorepo (tsc vs. esbuild/tsx used by the dev server) don't
 * consistently agree on that compiler option for cross-package files.
 * `declare` fields emit no runtime code at all, and a plain
 * `this.board = ...` assignment inside a constructor is unambiguously a
 * normal `[[Set]]` operation in every tool, so it always goes through the
 * inherited setter regardless of compiler settings.
 */
export class OmokState extends Schema {
  declare board: ArraySchema<number>;
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare turnIndex: number;
  declare winnerId: string;
  declare isDraw: boolean;

  constructor() {
    super();
    this.board = new ArraySchema<number>(...Array(BOARD_SIZE * BOARD_SIZE).fill(0));
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.turnIndex = 0;
    this.winnerId = "";
    this.isDraw = false;
  }
}

defineTypes(OmokState, {
  board: ["number"],
  players: ["string"],
  playerNames: ["string"],
  turnIndex: "number",
  winnerId: "string",
  isDraw: "boolean",
});

export interface OmokMove {
  row: number;
  col: number;
}
