import { describe, expect, it } from "vitest";
import { halliGalliDefinition } from "./definition.js";

function setup() {
  const state = halliGalliDefinition.createInitialState();
  halliGalliDefinition.addPlayer(state, "first");
  halliGalliDefinition.addPlayer(state, "second");
  return state;
}

describe("halliGalliDefinition", () => {
  it("rejects a flip made out of turn", () => {
    const state = setup();
    state.turnIndex = 0;

    const result = halliGalliDefinition.applyMove(state, "second", { action: "flip" });

    expect(result).toEqual({ ok: false, error: "당신의 차례가 아니에요." });
  });

  it("lets any player ring the bell regardless of whose turn it is", () => {
    const state = setup();
    state.turnIndex = 0;
    state.faceUp[0] = "s2";
    state.faceUp[1] = "s3";
    state.decks[0] = "b1";

    const result = halliGalliDefinition.applyMove(state, "second", { action: "ring" });

    expect(result).toEqual({ ok: true });
  });

  it("awards every visible card to whoever rings a correct match", () => {
    const state = setup();
    state.faceUp[0] = "s2";
    state.faceUp[1] = "s3";
    state.decks[0] = "b1";

    const result = halliGalliDefinition.applyMove(state, "first", { action: "ring" });

    expect(result).toEqual({ ok: true });
    expect(state.faceUp[0]).toBe("");
    expect(state.faceUp[1]).toBe("");
    expect(state.decks[0]!.split(",")).toHaveLength(3); // b1 + won s2 + s3
  });

  it("gives the opponent one penalty card when a ring is incorrect", () => {
    const state = setup();
    state.faceUp[0] = "s2";
    state.faceUp[1] = "l1";
    state.decks[0] = "b1,b2";
    state.decks[1] = "";

    const result = halliGalliDefinition.applyMove(state, "first", { action: "ring" });

    expect(result).toEqual({ ok: true });
    expect(state.decks[0]).toBe("b1");
    expect(state.decks[1]).toBe("b2");
  });

  it("skips the penalty when the wrong-ringer has no cards left to give", () => {
    const state = setup();
    state.faceUp[0] = "s2";
    state.faceUp[1] = "l1";
    state.decks[0] = "";
    state.decks[1] = "b1";

    const result = halliGalliDefinition.applyMove(state, "first", { action: "ring" });

    expect(result).toEqual({ ok: true });
    expect(state.decks[1]).toBe("b1");
  });

  it("declares a winner once only one player still holds cards", () => {
    const state = setup();
    state.faceUp[0] = "";
    state.faceUp[1] = "p5";
    state.decks[0] = "s1";
    state.decks[1] = "";

    const result = halliGalliDefinition.applyMove(state, "first", { action: "ring" });

    expect(result).toEqual({ ok: true });
    expect(halliGalliDefinition.checkGameOver(state)).toEqual({ winnerId: "first" });
  });
});
