import { describe, expect, it } from "vitest";
import { mancalaDefinition } from "./definition.js";

function newGame() {
  const state = mancalaDefinition.createInitialState();
  mancalaDefinition.addPlayer(state, "a");
  mancalaDefinition.addPlayer(state, "b");
  return state;
}

/** Overwrites the board in place (ArraySchema element assignment, like the definition does). */
function setBoard(state: ReturnType<typeof newGame>, slots: number[]) {
  for (let i = 0; i < slots.length; i += 1) state.board[i] = slots[i] ?? 0;
}

describe("mancalaDefinition", () => {
  it("rejects a move made out of turn without touching the board", () => {
    const state = newGame();
    const before = Array.from(state.board);

    const result = mancalaDefinition.applyMove(state, "b", { pit: 7 });

    expect(result).toEqual({ ok: false, error: "Not your turn" });
    expect(Array.from(state.board)).toEqual(before);
  });

  it("rejects sowing a pit that isn't the mover's own", () => {
    const state = newGame();
    expect(mancalaDefinition.applyMove(state, "a", { pit: 7 })).toEqual({
      ok: false,
      error: "That is not one of your pits",
    });
  });

  it("grants another turn when the last seed lands in your own store", () => {
    const state = newGame();
    // Pit 2 holds 4 seeds → sows into 3, 4, 5, and store (index 6).
    const result = mancalaDefinition.applyMove(state, "a", { pit: 2 });

    expect(result).toEqual({ ok: true });
    expect(state.board[6]).toBe(1); // one seed now in player 0's store
    expect(state.board[2]).toBe(0);
    expect(state.currentPlayer).toBe(0); // still player 0's turn
  });

  it("captures the opposite pit when the last seed lands in an own empty pit", () => {
    const state = newGame();
    //             0  1  2  3  4  5   6   7  8  9 10 11 12  13
    setBoard(state, [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 5, 1, 0]);
    // Sow pit 0 (1 seed) → lands in own empty pit 1; opposite pit is 11 (5 seeds).
    const result = mancalaDefinition.applyMove(state, "a", { pit: 0 });

    expect(result).toEqual({ ok: true });
    expect(state.board[6]).toBe(6); // captured 5 + the landing seed
    expect(state.board[1]).toBe(0);
    expect(state.board[11]).toBe(0);
    expect(state.currentPlayer).toBe(1); // no extra turn after a capture
  });

  it("ends the game and sweeps the leftovers to the winner", () => {
    const state = newGame();
    //             0  1  2  3  4  5   6   7  8  9 10 11 12  13
    setBoard(state, [0, 0, 0, 0, 0, 1, 5, 2, 2, 2, 2, 2, 2, 3]);
    // Player 0 sows its last seed into the store, emptying all its pits.
    const result = mancalaDefinition.applyMove(state, "a", { pit: 5 });

    expect(result).toEqual({ ok: true });
    expect(state.board[6]).toBe(6); // player 0's store
    expect(state.board[13]).toBe(15); // player 1 rakes in 3 + 6×2 leftovers
    expect(mancalaDefinition.checkGameOver(state)).toEqual({ winnerId: "b" });
  });
});
