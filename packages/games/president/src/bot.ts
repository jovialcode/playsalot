import type { PlayerId } from "@playsalot/game-engine-core";
import { getHand, rankValue, cardRank, validatePlay, toPile } from "./rules.js";
import type { PresidentState, PresidentMove } from "./state.js";

/**
 * Simple bot strategy:
 * 1. Group hand by rank.
 * 2. If pile is empty: lead lowest single or pair.
 * 3. Otherwise: play the lowest valid combo that beats the pile.
 * 4. If holding a bomb and behind, use it. Otherwise save bombs.
 * 5. Pass if nothing valid.
 */
export function choosePresidentBot(state: PresidentState, botId: PlayerId): PresidentMove {
  const botIdx = state.players.indexOf(botId);
  const hand = getHand(state, botIdx);
  if (hand.length === 0) return { action: "pass" };

  // Group by rank
  const byRank: Record<string, string[]> = {};
  for (const card of hand) {
    const r = cardRank(card);
    (byRank[r] ??= []).push(card);
  }

  const groups = Object.values(byRank).sort(
    (a, b) => rankValue(a[0]!) - rankValue(b[0]!),
  );

  const { pileCount, pileRank, pileBomb } = state;

  // New round: lead lowest pair if possible, else single
  if (pileCount === 0) {
    const pair = groups.find((g) => g.length >= 2);
    if (pair) return { action: "play", cards: pair.slice(0, 2) };
    const single = groups[0];
    if (single) return { action: "play", cards: [single[0]!] };
    return { action: "pass" };
  }

  // Try to play smallest valid combo
  for (const group of groups) {
    if (group.length < pileCount) continue;
    const candidates = group.slice(0, pileCount);
    const { ok } = validatePlay(candidates, pileCount, pileRank, pileBomb);
    if (ok) return { action: "play", cards: candidates };
  }

  // Try bomb if available
  const bomb = groups.find((g) => g.length === 4);
  if (bomb) {
    const { ok } = validatePlay(bomb, pileCount, pileRank, pileBomb);
    if (ok) return { action: "play", cards: bomb };
  }

  return { action: "pass" };
}
