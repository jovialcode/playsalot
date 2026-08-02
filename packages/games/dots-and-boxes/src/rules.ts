import { BOXES_PER_SIDE } from "./state.js";

const N = BOXES_PER_SIDE;

/** A snapshot of both edge arrays, for pure geometry helpers. */
export interface EdgeState {
  h: number[];
  v: number[];
}

/** The four edge indices bounding box (br, bc). */
export function boxEdges(br: number, bc: number): { top: number; bottom: number; left: number; right: number } {
  return {
    top: br * N + bc,
    bottom: (br + 1) * N + bc,
    left: br * (N + 1) + bc,
    right: br * (N + 1) + bc + 1,
  };
}

/** How many of box (br, bc)'s four sides are currently drawn (0–4). */
export function boxSideCount(edges: EdgeState, br: number, bc: number): number {
  const e = boxEdges(br, bc);
  return (
    (edges.h[e.top] ? 1 : 0) +
    (edges.h[e.bottom] ? 1 : 0) +
    (edges.v[e.left] ? 1 : 0) +
    (edges.v[e.right] ? 1 : 0)
  );
}

/** The one or two boxes (br, bc) that a given edge borders. */
export function boxesForEdge(type: "h" | "v", index: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  if (type === "h") {
    const row = Math.floor(index / N);
    const col = index % N;
    if (row - 1 >= 0) result.push([row - 1, col]);
    if (row < N) result.push([row, col]);
  } else {
    const row = Math.floor(index / (N + 1));
    const col = index % (N + 1);
    if (col - 1 >= 0) result.push([row, col - 1]);
    if (col < N) result.push([row, col]);
  }
  return result;
}
