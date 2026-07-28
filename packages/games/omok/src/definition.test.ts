import { describe, expect, it } from "vitest";
import { omokDefinition } from "./definition.js";

describe("omokDefinition", () => {
  it("rejects a move made out of turn without mutating the board", () => {
    const state = omokDefinition.createInitialState();
    omokDefinition.addPlayer(state, "first");
    omokDefinition.addPlayer(state, "second");

    const result = omokDefinition.applyMove(state, "second", { row: 7, col: 7 });

    expect(result).toEqual({ ok: false, error: "Not your turn" });
    expect(state.board[7 * 15 + 7]).toBe(0);
  });

  it("declares a winner after five connected stones", () => {
    const state = omokDefinition.createInitialState();
    omokDefinition.addPlayer(state, "first");
    omokDefinition.addPlayer(state, "second");

    for (let col = 0; col < 4; col += 1) {
      expect(omokDefinition.applyMove(state, "first", { row: 0, col })).toEqual({ ok: true });
      expect(omokDefinition.applyMove(state, "second", { row: 1, col })).toEqual({ ok: true });
    }
    expect(omokDefinition.applyMove(state, "first", { row: 0, col: 4 })).toEqual({ ok: true });

    expect(omokDefinition.checkGameOver(state)).toEqual({ winnerId: "first" });
  });
});
