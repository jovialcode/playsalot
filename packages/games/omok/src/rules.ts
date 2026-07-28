import { BOARD_SIZE } from "./state.js";

const DIRECTIONS: Array<[number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal ↘
  [1, -1], // diagonal ↙
];

const WIN_LENGTH = 5;

function countStones(
  board: ArrayLike<number>,
  row: number,
  col: number,
  stone: number,
  deltaRow: number,
  deltaCol: number,
): number {
  let count = 0;
  let r = row + deltaRow;
  let c = col + deltaCol;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r * BOARD_SIZE + c] === stone) {
    count += 1;
    r += deltaRow;
    c += deltaCol;
  }
  return count;
}

/** Returns true if placing `stone` at (row, col) completes a line of WIN_LENGTH. */
export function checkFiveInARow(board: ArrayLike<number>, row: number, col: number, stone: number): boolean {
  return DIRECTIONS.some(([deltaRow, deltaCol]) => {
    const forward = countStones(board, row, col, stone, deltaRow, deltaCol);
    const backward = countStones(board, row, col, stone, -deltaRow, -deltaCol);
    return forward + backward + 1 >= WIN_LENGTH;
  });
}

export function isBoardFull(board: ArrayLike<number>): boolean {
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === 0) return false;
  }
  return true;
}
