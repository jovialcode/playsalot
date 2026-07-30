import type { PlayerId } from "@playsalot/game-engine-core";
import {
  getHand, toPile, fieldMatchesFor, getMonth, isBright, isRibbon,
  computeScore, getCaptures,
} from "./rules.js";
import type { GostopState, GostopMove } from "./state.js";

/** Simple bot: prefer capturing cards, prioritize brights > ribbons > chaff. */
export function chooseGostopBot(state: GostopState, botId: PlayerId): GostopMove {
  const botIdx = state.players.indexOf(botId);

  if (state.phase === "go-stop") {
    // Go if score is not overwhelming for opponent, else stop
    const myScore = computeScore(getCaptures(state, botIdx)).total;
    const oppScore = computeScore(getCaptures(state, 1 - botIdx)).total;
    return myScore > oppScore + 2 ? { action: "stop" } : { action: "go" };
  }

  const hand = getHand(state, botIdx);
  if (hand.length === 0) return { action: "play", card: "" };

  const field = toPile(state.field);

  // Score each card in hand: higher = better to play
  function cardScore(card: string): number {
    const month = getMonth(card);
    const matches = fieldMatchesFor(field, month);
    let score = 0;
    if (matches.length > 0) score += 10; // can capture something
    const targetCard = matches[0];
    if (targetCard) {
      if (isBright(targetCard)) score += 20;
      if (isRibbon(targetCard)) score += 10;
    }
    if (isBright(card)) score += 5;
    if (isRibbon(card)) score += 3;
    return score;
  }

  const sorted = [...hand].sort((a, b) => cardScore(b) - cardScore(a));
  const best = sorted[0]!;
  return { action: "play", card: best };
}
