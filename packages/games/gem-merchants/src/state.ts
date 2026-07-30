import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export const COLORS = ["r", "b", "g", "w"] as const;
export type GemColor = (typeof COLORS)[number];

export class GemMerchantsState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare gems: ArraySchema<string>;
  declare bonuses: ArraySchema<string>;
  declare scores: ArraySchema<number>;
  declare market: ArraySchema<string>;
  declare deck: string;
  declare bank: string;
  declare turnIndex: number;
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>(); this.playerNames = new ArraySchema<string>(); this.gems = new ArraySchema<string>();
    this.bonuses = new ArraySchema<string>(); this.scores = new ArraySchema<number>();
    this.market = new ArraySchema<string>(); this.deck = ""; this.bank = "4,4,4,4";
    this.turnIndex = 0; this.message = "상단 동료를 기다리는 중이에요."; this.winnerId = "";
  }
}

defineTypes(GemMerchantsState, {
  players: ["string"], playerNames: ["string"], gems: ["string"], bonuses: ["string"], scores: ["number"], market: ["string"],
  deck: "string", bank: "string", turnIndex: "number", message: "string", winnerId: "string",
});

export type GemMerchantsMove = { action: "take"; colors: GemColor[] } | { action: "buy"; cardId: string };
