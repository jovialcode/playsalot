import { ArraySchema, defineTypes, Schema } from "@colyseus/schema";

/**
 * 대통령 (Daifugo / President) — 2~4 player variant.
 *
 * Standard 52-card deck. Card ranking (low→high):
 *   3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2
 *
 * Card code: `R-S` e.g. "3-s", "10-h", "J-d", "A-c", "2-s"
 *   Ranks: 3 4 5 6 7 8 9 10 J Q K A 2
 *   Suits: s(♠) h(♥) d(♦) c(♣)
 *
 * Turn mechanics:
 *   - Active player plays 1+ cards of the same rank (or a 4-of-a-kind bomb).
 *   - Pile count is set by the opening play in each round; all subsequent
 *     plays must match that count (except bombs which beat everything).
 *   - Pass: pile stays, turn moves to next non-passed player.
 *   - Round ends when all others pass; last active player leads next round.
 *   - 4-of-a-kind 폭탄 beats any same-sized or smaller play.
 *
 * Game ends when one player empties their hand (winner).
 *
 * Fields use declare + constructor-assignment + defineTypes() — see OmokState.
 */
export class PresidentState extends Schema {
  declare players: ArraySchema<string>;
  declare playerNames: ArraySchema<string>;
  declare hands: ArraySchema<string>;      // CSV of cards per player
  declare pile: string;                    // CSV of cards currently on the table
  declare pileCount: number;               // required card count per play this round
  declare pileRank: number;                // rank value of the current pile (0 = empty)
  declare pileBomb: boolean;               // whether the current pile is a 4-of-a-kind bomb
  declare turnIndex: number;
  declare lastPlayIndex: number;           // player who played last (leads next round)
  declare passFlags: ArraySchema<number>;  // 1 if this player passed this round
  declare phase: string;                   // "wait" | "play" | "done"
  declare message: string;
  declare winnerId: string;

  constructor() {
    super();
    this.players = new ArraySchema<string>();
    this.playerNames = new ArraySchema<string>();
    this.hands = new ArraySchema<string>();
    this.pile = "";
    this.pileCount = 0;
    this.pileRank = 0;
    this.pileBomb = false;
    this.turnIndex = 0;
    this.lastPlayIndex = 0;
    this.passFlags = new ArraySchema<number>();
    this.phase = "wait";
    this.message = "플레이어를 기다리는 중이에요.";
    this.winnerId = "";
  }
}

defineTypes(PresidentState, {
  players: ["string"],
  playerNames: ["string"],
  hands: ["string"],
  pile: "string",
  pileCount: "number",
  pileRank: "number",
  pileBomb: "boolean",
  turnIndex: "number",
  lastPlayIndex: "number",
  passFlags: ["number"],
  phase: "string",
  message: "string",
  winnerId: "string",
});

export type PresidentMove =
  | { action: "play"; cards: string[] }
  | { action: "pass" };
