import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export class UnoState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare hands: ArraySchema<string>;   // CSV card codes per player e.g. "r5,bs,wd"
  declare topCard: string;              // e.g. "r5", "w", "wd"
  declare currentColor: string;         // active color: "r"|"y"|"g"|"b"
  declare turnIndex: number;
  declare direction: number;            // 1 = clockwise, -1 = counter-clockwise
  declare phase: string;               // "wait"|"play"|"choose-color"
  declare message: string;
  declare winnerId: string;
  declare deck: string;                 // CSV of remaining draw pile cards

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.hands = new ArraySchema<string>();
    this.topCard = "";
    this.currentColor = "";
    this.turnIndex = 0;
    this.direction = 1;
    this.phase = "wait";
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
    this.deck = "";
  }
}

defineTypes(UnoState, {
  players: ["string"],
  playerNames: ["string"],
  hands: ["string"],
  topCard: "string",
  currentColor: "string",
  turnIndex: "number",
  direction: "number",
  phase: "string",
  message: "string",
  winnerId: "string",
  deck: "string",
});

export type UnoMove =
  | { action: "play"; card: string }
  | { action: "draw" }
  | { action: "choose-color"; color: "r" | "y" | "g" | "b" };
