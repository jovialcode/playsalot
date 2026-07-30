import type { PlayerId } from "@playsalot/game-engine-core";
import { CELL_HIT, CELL_MISS, GRID_SIZE, getGrid, idx, inBounds, randomShips } from "./rules.js";
import type { BattleshipState, BattleshipMove } from "./state.js";

export function chooseBattleshipBot(state: BattleshipState, botId: PlayerId): BattleshipMove {
  const botIdx = state.players.indexOf(botId);

  if (state.phase === "setup") {
    return { action: "place-ships", ships: randomShips() };
  }

  // Attack phase: hunt-and-target strategy
  const attackGrid = getGrid(state, botIdx, "attack");

  // Check if there's a recent hit to follow up on (target mode)
  const hitCells: number[] = [];
  for (let i = 0; i < attackGrid.length; i += 1) {
    if (attackGrid[i] === CELL_HIT) hitCells.push(i);
  }

  // Find adjacent cells to known hits that haven't been attacked
  const candidates: Set<number> = new Set();
  for (const hitCell of hitCells) {
    const row = Math.floor(hitCell / GRID_SIZE);
    const col = hitCell % GRID_SIZE;
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
      const nr = row + dr;
      const nc = col + dc;
      if (inBounds(nr, nc)) {
        const ni = idx(nr, nc);
        if (attackGrid[ni] !== CELL_HIT && attackGrid[ni] !== CELL_MISS) {
          candidates.add(ni);
        }
      }
    }
  }

  // Fall back to hunt mode: attack unattacked cells on a checkerboard pattern
  if (candidates.size === 0) {
    for (let r = 0; r < GRID_SIZE; r += 1) {
      for (let c = (r % 2); c < GRID_SIZE; c += 2) {
        const i = idx(r, c);
        if (attackGrid[i] !== CELL_HIT && attackGrid[i] !== CELL_MISS) {
          candidates.add(i);
        }
      }
    }
    // If checkerboard exhausted, try all remaining cells
    if (candidates.size === 0) {
      for (let i = 0; i < attackGrid.length; i += 1) {
        if (attackGrid[i] !== CELL_HIT && attackGrid[i] !== CELL_MISS) candidates.add(i);
      }
    }
  }

  const arr = [...candidates];
  const pick = arr[Math.floor(Math.random() * arr.length)] ?? 0;
  return {
    action: "attack",
    row: Math.floor(pick / GRID_SIZE),
    col: pick % GRID_SIZE,
  };
}
