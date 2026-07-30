import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

/**
 * 고스톱 (Go-Stop) — simplified 2-player variant.
 *
 * Hwatu deck: 48 cards, 12 months × 4 cards each.
 * Card code: `M-T` where M = month (01-12), T = type:
 *   "b" = 광 (bright, 5-point), "d" = 띠 (ribbon), "j" = 쌍피 (double), "p" = 피 (chaff)
 *
 * Victory scoring (simplified):
 *   광 (bright): 3광=3pt, 4광=4pt, 5광=15pt
 *   띠 (ribbon): 5+N = (N) points (red-only or blue-only = +3 bonus)
 *   고도리 (단): holding 2월-띠 + 4월-띠 + 8월-띠 = 5pt
 *   쌍피 counts as 2 피
 *   피: 10+N = N points
 *   Go multiplier: winner chose 고 each time → multiply score by 2 per extra go
 *
 * Fields use declare + constructor-assignment + defineTypes() — see OmokState.
 */
export class GostopState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare hands: ArraySchema<string>;       // CSV of cards in hand per player
  declare captures: ArraySchema<string>;    // CSV of captured cards per player
  declare field: string;                    // CSV of cards currently on the field
  declare deck: string;                     // CSV of remaining draw pile
  declare phase: string;                    // "wait"|"play"|"go-stop"|"done"
  declare turnIndex: number;
  declare pending: string;                  // pending match card after playing (CSV or "")
  declare scores: ArraySchema<number>;      // current computed score per player
  declare goCount: number;                  // how many times current player went "고"
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.hands = new ArraySchema<string>();
    this.captures = new ArraySchema<string>();
    this.field = "";
    this.deck = "";
    this.phase = "wait";
    this.turnIndex = 0;
    this.pending = "";
    this.scores = new ArraySchema<number>();
    this.goCount = 0;
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(GostopState, {
  players: ["string"],
  playerNames: ["string"],
  hands: ["string"],
  captures: ["string"],
  field: "string",
  deck: "string",
  phase: "string",
  turnIndex: "number",
  pending: "string",
  scores: ["number"],
  goCount: "number",
  message: "string",
  winnerId: "string",
});

export type GostopMove =
  | { action: "play"; card: string; matchCard?: string }
  | { action: "go" }
  | { action: "stop" };
