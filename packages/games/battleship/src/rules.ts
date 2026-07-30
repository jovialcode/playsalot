import { GRID_SIZE, SHIP_SIZES, TOTAL_SHIP_CELLS, type BattleshipState, type ShipPlacement } from "./state.js";

export { GRID_SIZE, SHIP_SIZES, TOTAL_SHIP_CELLS };

export const CELL_WATER = 0;
export const CELL_SHIP = 1;
export const CELL_HIT = 2;
export const CELL_MISS = 3;

export function emptyGrid(): number[] {
  return Array(GRID_SIZE * GRID_SIZE).fill(CELL_WATER);
}

export function getGrid(state: BattleshipState, idx: number, type: "own" | "attack"): number[] {
  const arr = type === "own" ? state.ownGrids : state.attackGrids;
  const raw = arr[idx] ?? "";
  return raw ? raw.split(",").map(Number) : emptyGrid();
}

export function setGrid(state: BattleshipState, idx: number, type: "own" | "attack", grid: number[]): void {
  const arr = type === "own" ? state.ownGrids : state.attackGrids;
  arr[idx] = grid.join(",");
}

export function idx(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

/** Validate and place ships on a blank grid. Returns error string or null on success. */
export function placeShips(ships: ShipPlacement[]): { grid: number[]; error: string | null } {
  const grid = emptyGrid();

  if (ships.length !== SHIP_SIZES.length) {
    return { grid, error: `함선 ${SHIP_SIZES.length}척을 배치해야 해요.` };
  }

  const sortedInput = [...ships].map((s) => s.size).sort((a, b) => b - a);
  const expected = [...SHIP_SIZES].sort((a, b) => b - a);
  for (let i = 0; i < expected.length; i += 1) {
    if (sortedInput[i] !== expected[i]) {
      return { grid, error: "함선 크기가 맞지 않아요." };
    }
  }

  for (const ship of ships) {
    const cells: number[] = [];
    for (let i = 0; i < ship.size; i += 1) {
      const r = ship.row + (ship.horizontal ? 0 : i);
      const c = ship.col + (ship.horizontal ? i : 0);
      if (!inBounds(r, c)) return { grid, error: "함선이 보드 밖으로 나가요." };
      const cell = idx(r, c);
      if (grid[cell] === CELL_SHIP) return { grid, error: "함선이 겹쳐요." };
      cells.push(cell);
    }
    for (const cell of cells) grid[cell] = CELL_SHIP;
  }

  return { grid, error: null };
}

/** Returns true if all ship cells in the own grid have been hit. */
export function allShipsSunk(ownGrid: number[]): boolean {
  const hits = ownGrid.filter((c) => c === CELL_HIT).length;
  return hits === TOTAL_SHIP_CELLS;
}

/** Randomly place ships for a bot. */
export function randomShips(): ShipPlacement[] {
  const grid = emptyGrid();
  const result: ShipPlacement[] = [];

  for (const size of SHIP_SIZES) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts += 1;
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const { error, grid: trial } = placeShips([...result, { row, col, size, horizontal }]);
      if (!error) {
        result.push({ row, col, size, horizontal });
        // Rebuild grid to check overlaps properly by re-running placement
        const clean = emptyGrid();
        for (const s of result) {
          for (let i = 0; i < s.size; i += 1) {
            const r = s.row + (s.horizontal ? 0 : i);
            const c = s.col + (s.horizontal ? i : 0);
            clean[idx(r, c)] = CELL_SHIP;
          }
        }
        void trial;
        placed = true;
      }
    }
  }

  return result;
}
