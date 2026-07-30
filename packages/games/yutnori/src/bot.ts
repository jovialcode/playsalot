import type { PlayerId } from "@playsalot/game-engine-core";
import { HOME, OFF_BOARD, NUM_PIECES, advancePosition, getPieces, isExtraThrow } from "./rules.js";
import type { YutnoriState, YutnoriMove } from "./state.js";

const SHORTCUT_CORNERS = new Set([5, 10]);

/** Score a move: higher is better for the bot. */
function scoreMove(pieces: number[], pieceIdx: number, steps: number, opponentPieces: number[]): number {
  const fromPos = pieces[pieceIdx]!;
  if (fromPos === HOME) return -Infinity;

  const newPos = advancePosition(fromPos, steps);
  let score = 0;

  // Reaching home is best
  if (newPos === HOME) return 1000;

  // Capture opponent piece — very high priority
  if (newPos !== OFF_BOARD && opponentPieces.some((op) => op === newPos)) {
    score += 500;
  }

  // Land on shortcut corner (윷놀이 strategic position)
  if (SHORTCUT_CORNERS.has(newPos)) score += 50;

  // Stack with friendly pieces (safety + group move)
  const stackBonus = pieces.filter((p, i) => p === newPos && i !== pieceIdx).length * 30;
  score += stackBonus;

  // Advance pieces that are furthest along (to finish the game faster)
  const progress = newPos === OFF_BOARD ? 0 : (newPos > 22 ? newPos : newPos);
  score += progress * 2;

  // Prefer moving pieces already on the board over off-board pieces
  if (fromPos !== OFF_BOARD) score += 10;

  return score;
}

export function chooseYutnoriBot(state: YutnoriState, botId: PlayerId): YutnoriMove {
  if (state.phase === "throw") return { action: "throw" };

  const botIdx = state.players.indexOf(botId);
  const opponentIdx = 1 - botIdx;
  const pieces = getPieces(state, botIdx);
  const opponentPieces = getPieces(state, opponentIdx);
  const steps = state.throwResult;

  let bestScore = -Infinity;
  let bestIdx = 0;

  // Find off-board pieces: if throw is 윷/모 (extra), prefer to enter new piece
  const offBoardExists = pieces.some((p) => p === OFF_BOARD);
  const extraBonus = isExtraThrow(steps) ? 20 : 0;

  for (let i = 0; i < NUM_PIECES; i += 1) {
    if (pieces[i] === HOME) continue;
    const s = scoreMove(pieces, i, steps, opponentPieces);
    // Slight bonus for entering with extra-throw moves
    const adjusted = s + (pieces[i] === OFF_BOARD && offBoardExists ? extraBonus : 0);
    if (adjusted > bestScore) {
      bestScore = adjusted;
      bestIdx = i;
    }
  }

  return { action: "move", pieceIndex: bestIdx };
}
