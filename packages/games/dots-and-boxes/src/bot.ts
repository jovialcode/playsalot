import type { PlayerId } from "@playsalot/game-engine-core";
import { boxesForEdge, boxSideCount, type EdgeState } from "./rules.js";
import { type DotsMove, type DotsState } from "./state.js";

interface Edge {
  type: "h" | "v";
  index: number;
}

function legalEdges(edges: EdgeState): Edge[] {
  const moves: Edge[] = [];
  for (let i = 0; i < edges.h.length; i += 1) if (edges.h[i] === 0) moves.push({ type: "h", index: i });
  for (let i = 0; i < edges.v.length; i += 1) if (edges.v[i] === 0) moves.push({ type: "v", index: i });
  return moves;
}

function withEdge(edges: EdgeState, move: Edge): EdgeState {
  const next: EdgeState = { h: edges.h.slice(), v: edges.v.slice() };
  if (move.type === "h") next.h[move.index] = 1;
  else next.v[move.index] = 1;
  return next;
}

/** How many boxes this edge would immediately complete (reach 4 sides). */
function boxesCompletedBy(edges: EdgeState, move: Edge): number {
  const after = withEdge(edges, move);
  let count = 0;
  for (const [br, bc] of boxesForEdge(move.type, move.index)) {
    if (boxSideCount(after, br, bc) === 4) count += 1;
  }
  return count;
}

/** True if drawing this edge leaves a box with three sides — a free box for the opponent. */
function givesAwayBox(edges: EdgeState, move: Edge): boolean {
  const after = withEdge(edges, move);
  return boxesForEdge(move.type, move.index).some(([br, bc]) => boxSideCount(after, br, bc) === 3);
}

function pick<T>(items: T[]): T {
  const i = Math.floor(Math.random() * items.length);
  return items[i] as T;
}

/**
 * Classic greedy Dots & Boxes bot:
 *  1. if any edge completes a box, take the one completing the most (the room
 *     will call this again for the resulting extra turn, so chains get eaten);
 *  2. otherwise play a "safe" edge that doesn't hand the opponent a
 *     three-sided box;
 *  3. if every remaining edge is unsafe, give one away at random.
 * Ties are broken randomly so it isn't perfectly predictable.
 */
export function chooseDotsBotMove(state: DotsState, _botPlayerId: PlayerId): DotsMove {
  const edges: EdgeState = { h: Array.from(state.hEdges), v: Array.from(state.vEdges) };
  const legal = legalEdges(edges);

  const completing = legal.filter((m) => boxesCompletedBy(edges, m) > 0);
  if (completing.length > 0) {
    const best = Math.max(...completing.map((m) => boxesCompletedBy(edges, m)));
    return pick(completing.filter((m) => boxesCompletedBy(edges, m) === best));
  }

  const safe = legal.filter((m) => !givesAwayBox(edges, m));
  if (safe.length > 0) return pick(safe);

  return pick(legal);
}
