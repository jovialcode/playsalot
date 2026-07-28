import type { PlayerId } from "@playsalot/game-engine-core";
import { checkFiveInARow } from "./rules.js";
import { BOARD_SIZE, type OmokMove, type OmokState } from "./state.js";

function emptyCellIndexes(board: number[]): number[] {
  const cells: number[] = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === 0) cells.push(i);
  }
  return cells;
}

function toMove(index: number): OmokMove {
  return { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
}

/** Returns a move that completes 5-in-a-row for `stone` right now, if one exists. */
function findWinningMove(board: number[], stone: number): OmokMove | null {
  for (const index of emptyCellIndexes(board)) {
    const { row, col } = toMove(index);
    board[index] = stone;
    const wins = checkFiveInARow(board, row, col, stone);
    board[index] = 0;
    if (wins) return { row, col };
  }
  return null;
}

const NEIGHBOR_RADIUS = 2;
const CENTER = Math.floor(BOARD_SIZE / 2);

/** Rewards cells near existing stones (own stones weighted higher than the opponent's) and mild center bias. */
function heuristicScore(board: number[], index: number, botStone: number, opponentStone: number): number {
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  let score = 0;

  for (let deltaRow = -NEIGHBOR_RADIUS; deltaRow <= NEIGHBOR_RADIUS; deltaRow += 1) {
    for (let deltaCol = -NEIGHBOR_RADIUS; deltaCol <= NEIGHBOR_RADIUS; deltaCol += 1) {
      if (deltaRow === 0 && deltaCol === 0) continue;
      const r = row + deltaRow;
      const c = col + deltaCol;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;

      const neighbor = board[r * BOARD_SIZE + c];
      if (neighbor !== botStone && neighbor !== opponentStone) continue;

      const distance = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
      const weight = 1 / distance;
      score += neighbor === botStone ? weight * 2 : weight * 1.5;
    }
  }

  const centerDistance = Math.abs(row - CENTER) + Math.abs(col - CENTER);
  score += (BOARD_SIZE - centerDistance) * 0.05;
  return score;
}

/**
 * Simple but non-random Omok bot: win immediately if possible, otherwise
 * block the opponent's immediate win, otherwise play the empty cell that
 * scores highest by proximity to existing stones (own stones weighted
 * higher, mild center bias for an empty board). Ties broken randomly so
 * the bot isn't perfectly predictable.
 */
export function chooseOmokBotMove(state: OmokState, botPlayerId: PlayerId): OmokMove {
  const board = Array.from(state.board);
  const botIndex = state.players.indexOf(botPlayerId);
  const botStone = botIndex + 1;
  const opponentStone = botStone === 1 ? 2 : 1;

  const winningMove = findWinningMove(board, botStone);
  if (winningMove) return winningMove;

  const blockingMove = findWinningMove(board, opponentStone);
  if (blockingMove) return blockingMove;

  const emptyIndexes = emptyCellIndexes(board);
  const fallbackIndex = emptyIndexes[0];
  if (fallbackIndex === undefined) {
    // Only reachable if the board is completely full — checkGameOver
    // already ends the game before the bot would ever be asked to move.
    throw new Error("chooseOmokBotMove called with no empty cells");
  }

  let bestScore = -Infinity;
  let bestIndexes: number[] = [];
  for (const index of emptyIndexes) {
    const score = heuristicScore(board, index, botStone, opponentStone);
    if (score > bestScore) {
      bestScore = score;
      bestIndexes = [index];
    } else if (score === bestScore) {
      bestIndexes.push(index);
    }
  }

  const chosenIndex = bestIndexes[Math.floor(Math.random() * bestIndexes.length)] ?? fallbackIndex;
  return toMove(chosenIndex);
}
