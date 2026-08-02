import { describe, expect, it } from "vitest";
import { dotsDefinition } from "./definition.js";

function newGame() {
  const state = dotsDefinition.createInitialState();
  dotsDefinition.addPlayer(state, "a");
  dotsDefinition.addPlayer(state, "b");
  return state;
}

describe("dotsDefinition", () => {
  it("rejects a move made out of turn", () => {
    const state = newGame();
    expect(dotsDefinition.applyMove(state, "b", { type: "h", index: 0 })).toEqual({
      ok: false,
      error: "Not your turn",
    });
  });

  it("rejects redrawing a line that already exists", () => {
    const state = newGame();
    expect(dotsDefinition.applyMove(state, "a", { type: "h", index: 0 })).toEqual({ ok: true });
    // Player 0 kept no box, so it's player 1's turn now.
    expect(dotsDefinition.applyMove(state, "b", { type: "h", index: 0 })).toEqual({
      ok: false,
      error: "That line is already drawn",
    });
  });

  it("passes the turn when a move completes no box", () => {
    const state = newGame();
    const result = dotsDefinition.applyMove(state, "a", { type: "h", index: 0 });

    expect(result).toEqual({ ok: true });
    expect(state.hEdges[0]).toBe(1);
    expect(state.currentPlayer).toBe(1);
  });

  it("claims the box and grants an extra turn when a move closes it", () => {
    const state = newGame();
    // Pre-draw three sides of box (0,0): top h[0], left v[0], right v[1].
    state.hEdges[0] = 1;
    state.vEdges[0] = 1;
    state.vEdges[1] = 1;

    // Player 0 draws the bottom (h[4]) to close the box.
    const result = dotsDefinition.applyMove(state, "a", { type: "h", index: 4 });

    expect(result).toEqual({ ok: true });
    expect(state.boxes[0]).toBe(1); // claimed by player 0
    expect(state.currentPlayer).toBe(0); // extra turn
  });

  it("declares the box majority winner once every box is claimed", () => {
    const state = newGame();
    // Pre-claim 15 of 16 boxes: 8 for player 0, 7 for player 1.
    for (let i = 0; i < 8; i += 1) state.boxes[i] = 1;
    for (let i = 8; i < 15; i += 1) state.boxes[i] = 2;
    // Three sides of the last box (3,3): top h[15], left v[18], right v[19].
    state.hEdges[15] = 2;
    state.vEdges[18] = 1;
    state.vEdges[19] = 1;

    // Player 0 closes box 15 → 9 vs 7.
    const result = dotsDefinition.applyMove(state, "a", { type: "h", index: 19 });

    expect(result).toEqual({ ok: true });
    expect(state.boxes[15]).toBe(1);
    expect(dotsDefinition.checkGameOver(state)).toEqual({ winnerId: "a" });
  });
});
