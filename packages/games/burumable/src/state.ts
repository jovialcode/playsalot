import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export const BOARD_SIZE = 20;
export const STARTING_CASH = 1500;

export class BurumableState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare positions: ArraySchema<number>;
  declare cash: ArraySchema<number>;
  declare owners: ArraySchema<number>;
  declare levels: ArraySchema<number>;
  declare bankrupt: ArraySchema<number>;
  declare turnIndex: number;
  declare phase: string;
  declare lastRoll: number;
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.positions = new ArraySchema<number>();
    this.cash = new ArraySchema<number>();
    this.owners = new ArraySchema<number>(...Array(BOARD_SIZE).fill(-1));
    this.levels = new ArraySchema<number>(...Array(BOARD_SIZE).fill(0));
    this.bankrupt = new ArraySchema<number>();
    this.turnIndex = 0;
    this.phase = "roll";
    this.lastRoll = 0;
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(BurumableState, {
  players: ["string"], playerNames: ["string"], positions: ["number"], cash: ["number"], owners: ["number"],
  levels: ["number"], bankrupt: ["number"], turnIndex: "number", phase: "string",
  lastRoll: "number", message: "string", winnerId: "string",
});

export type BurumableMove = { action: "roll" | "buy" | "pass" | "build" | "pay-rent" | "negotiate-rent" };
