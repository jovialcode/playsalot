import type { PlayerId } from "@playsalot/game-engine-core";
import { isGameOver, ownPits, sow, sweep } from "./rules.js";
import { STORE_INDEX, type MancalaMove, type MancalaState } from "./state.js";

/**
 * Greedy one-ply Mancala bot: it simulates sowing each legal pit and scores
 * the resulting position by its own store lead (own store minus opponent's),
 * plus a bonus for landing the last seed in its store to earn another turn.
 * Highest score wins; ties are broken randomly so it doesn't always open the
 * same way. Room already handles the extra turn by calling this again.
 */
export function chooseMancalaBotMove(state: MancalaState, botPlayerId: PlayerId): MancalaMove {
  const board = Array.from(state.board);
  const botIndex = state.players.indexOf(botPlayerId);
  const ownStore = STORE_INDEX[botIndex === 1 ? 1 : 0];
  const oppStore = STORE_INDEX[botIndex === 1 ? 0 : 1];

  const legal = ownPits(botIndex).filter((pit) => (board[pit] ?? 0) > 0);

  let bestScore = -Infinity;
  let bestPits: number[] = [];
  for (const pit of legal) {
    const { board: next, extraTurn } = sow(board, botIndex, pit);
    const settled = isGameOver(next) ? sweep(next) : next;
    let score = (settled[ownStore] ?? 0) - (settled[oppStore] ?? 0);
    if (extraTurn) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestPits = [pit];
    } else if (score === bestScore) {
      bestPits.push(pit);
    }
  }

  const chosen = bestPits[Math.floor(Math.random() * bestPits.length)] ?? legal[0] ?? 0;
  return { pit: chosen };
}
