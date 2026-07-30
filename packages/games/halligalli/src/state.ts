import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

export const FRUITS = ["s", "l", "b", "p"] as const;
export type Fruit = (typeof FRUITS)[number];

export const FRUIT_LABEL: Record<Fruit, string> = {
  s: "딸기",
  l: "라임",
  b: "바나나",
  p: "자두",
};

export const FRUIT_EMOJI: Record<Fruit, string> = {
  s: "🍓",
  l: "🟢",
  b: "🍌",
  p: "🟣",
};

/**
 * Card codes are `${fruit}${count}` (e.g. "s3" = 3 strawberries), following
 * the same terse CSV-of-codes convention as @playsalot/game-uno's hands/deck.
 *
 * `decks` is each player's face-down draw pile and `faceUp` is each player's
 * accumulated face-up pile — only its last card is visible on the table,
 * but the whole pile travels to whoever next rings a correct bell. Both are
 * CSV strings with the *last* element as the top (draw = pop from the end).
 *
 * Fields use `declare` + constructor-assignment + `defineTypes()` rather
 * than `@type()`/class-field initializers — see the note on OmokState in
 * packages/games/omok/src/state.ts for why that's required for
 * @colyseus/schema encoding to survive this monorepo's mixed tsc/esbuild
 * toolchain.
 */
export class HalliGalliState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare decks: ArraySchema<string>;
  declare faceUp: ArraySchema<string>;
  declare turnIndex: number;
  declare phase: string;
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.decks = new ArraySchema<string>();
    this.faceUp = new ArraySchema<string>();
    this.turnIndex = 0;
    this.phase = "wait";
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(HalliGalliState, {
  players: ["string"],
  playerNames: ["string"],
  decks: ["string"],
  faceUp: ["string"],
  turnIndex: "number",
  phase: "string",
  message: "string",
  winnerId: "string",
});

export type HalliGalliMove = { action: "flip" } | { action: "ring" };
