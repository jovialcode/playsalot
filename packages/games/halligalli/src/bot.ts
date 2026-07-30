import type { PlayerId } from "@playsalot/game-engine-core";
import { findMatchingFruit, visibleTopCards } from "./rules.js";
import type { HalliGalliMove, HalliGalliState } from "./state.js";

/**
 * The bot is only asked for a move on its own flip-turn (BoardGameRoom's
 * maybeTriggerBotMove only fires when getCurrentTurnPlayerId names it), so
 * this doubles as its only chance to react to a match: check the table
 * first and ring if it's already sitting there unclaimed, otherwise flip.
 */
export function chooseHalliGalliBotMove(state: HalliGalliState, botPlayerId: PlayerId): HalliGalliMove {
  if (state.players.indexOf(botPlayerId) === -1) return { action: "flip" };
  return findMatchingFruit(visibleTopCards(state)) ? { action: "ring" } : { action: "flip" };
}
