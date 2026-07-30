"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

// ── Constants ─────────────────────────────────────────────────────────────────

const GRID_SIZE = 8;
const SHIP_SIZES = [4, 3, 3, 2, 2];

const CELL_WATER = 0;
const CELL_SHIP = 1;
const CELL_HIT = 2;
const CELL_MISS = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShipPlacement {
  row: number;
  col: number;
  size: number;
  horizontal: boolean;
}

interface View {
  players: string[];
  ownGrids: string[];
  attackGrids: string[];
  readyFlags: number[];
  phase: string;
  turnIndex: number;
  message: string;
  winnerId: string;
}

const EMPTY: View = {
  players: [], ownGrids: [], attackGrids: [], readyFlags: [],
  phase: "wait", turnIndex: 0, message: "상대를 기다리는 중...", winnerId: "",
};

function parseGrid(csv: string): number[] {
  return csv ? csv.split(",").map(Number) : Array(GRID_SIZE * GRID_SIZE).fill(CELL_WATER);
}

function cellIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

// ── Ship placement preview ────────────────────────────────────────────────────

function buildPreviewGrid(placed: ShipPlacement[], preview?: { row: number; col: number; size: number; horizontal: boolean }): number[] {
  const grid = Array(GRID_SIZE * GRID_SIZE).fill(CELL_WATER);
  const toPlace = preview ? [...placed, preview] : placed;
  for (const s of toPlace) {
    for (let i = 0; i < s.size; i += 1) {
      const r = s.row + (s.horizontal ? 0 : i);
      const c = s.col + (s.horizontal ? i : 0);
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        grid[cellIndex(r, c)] = CELL_SHIP;
      }
    }
  }
  return grid;
}

// ── Grid display ──────────────────────────────────────────────────────────────

function GridCell({ value, onClick, isPreview }: { value: number; onClick?: () => void; isPreview?: boolean }) {
  let bg = "bg-blue-100";
  let content = "";
  if (value === CELL_SHIP) { bg = isPreview ? "bg-gray-400" : "bg-gray-600"; }
  else if (value === CELL_HIT) { bg = "bg-red-500"; content = "💥"; }
  else if (value === CELL_MISS) { bg = "bg-blue-300"; content = "○"; }
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`aspect-square w-full ${bg} border border-blue-200 text-xs flex items-center justify-center transition-colors ${
        onClick ? "hover:bg-blue-200 active:scale-90 cursor-pointer" : "cursor-default"
      } ${isPreview ? "opacity-70" : ""}`}
    >
      {content}
    </button>
  );
}

function Grid({
  grid,
  label,
  onCellClick,
  previewGrid,
}: {
  grid: number[];
  label: string;
  onCellClick?: (row: number, col: number) => void;
  previewGrid?: number[];
}) {
  return (
    <div className="flex-1">
      <p className="mb-1 text-center text-xs font-bold text-[var(--ink-soft)]">{label}</p>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: 1 }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const row = Math.floor(i / GRID_SIZE);
          const col = i % GRID_SIZE;
          const display = previewGrid ? previewGrid[i] : grid[i];
          return (
            <GridCell
              key={i}
              value={display ?? CELL_WATER}
              onClick={onCellClick ? () => onCellClick(row, col) : undefined}
              isPreview={!!(previewGrid && previewGrid[i] !== grid[i])}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Setup phase ───────────────────────────────────────────────────────────────

function SetupPhase({
  onReady,
  alreadyReady,
}: {
  onReady: (ships: ShipPlacement[]) => void;
  alreadyReady: boolean;
}) {
  const [placed, setPlaced] = useState<ShipPlacement[]>([]);
  const [currentSize, setCurrentSize] = useState(SHIP_SIZES[0]!);
  const [horizontal, setHorizontal] = useState(true);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const currentShipIdx = placed.length;
  const allPlaced = placed.length === SHIP_SIZES.length;

  const ownGrid = buildPreviewGrid(placed);
  const previewGrid = hoverCell
    ? buildPreviewGrid(placed, { row: hoverCell.row, col: hoverCell.col, size: currentSize, horizontal })
    : undefined;

  function handleCellClick(row: number, col: number) {
    if (allPlaced) return;
    const newShip: ShipPlacement = { row, col, size: currentSize, horizontal };
    // Validate: check bounds and overlap
    const cells: number[] = [];
    let valid = true;
    for (let i = 0; i < currentSize; i += 1) {
      const r = row + (horizontal ? 0 : i);
      const c = col + (horizontal ? i : 0);
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || ownGrid[cellIndex(r, c)] === CELL_SHIP) {
        valid = false; break;
      }
      cells.push(cellIndex(r, c));
    }
    if (!valid) return;
    const newPlaced = [...placed, newShip];
    setPlaced(newPlaced);
    const nextSize = SHIP_SIZES[newPlaced.length];
    if (nextSize) setCurrentSize(nextSize);
  }

  if (alreadyReady) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-[var(--ink-soft)]">배치 완료! 상대방을 기다리는 중…</p>
        <div className="mt-2">
          <Grid grid={ownGrid} label="내 함대" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm font-medium text-[var(--ink)]">
        함선 배치 ({currentShipIdx + 1}/{SHIP_SIZES.length}) — 크기 {currentSize}칸
      </p>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setHorizontal(true)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${horizontal ? "bg-[var(--sage)] text-white border-[var(--sage)]" : "bg-white text-[var(--ink)] border-[var(--mist)]"}`}
        >
          → 가로
        </button>
        <button
          onClick={() => setHorizontal(false)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${!horizontal ? "bg-[var(--sage)] text-white border-[var(--sage)]" : "bg-white text-[var(--ink)] border-[var(--mist)]"}`}
        >
          ↓ 세로
        </button>
        <button
          onClick={() => {
            const prev = placed.slice(0, -1);
            setPlaced(prev);
            setCurrentSize(SHIP_SIZES[prev.length] ?? SHIP_SIZES[0]!);
          }}
          disabled={placed.length === 0}
          className="rounded-lg px-3 py-1.5 text-xs border border-rose-300 text-rose-600 bg-white disabled:opacity-40"
        >
          ↩ 취소
        </button>
      </div>

      <div
        onMouseLeave={() => setHoverCell(null)}
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const row = Math.floor(i / GRID_SIZE);
          const col = i % GRID_SIZE;
          const display = previewGrid ? previewGrid[i] : ownGrid[i];
          return (
            <button
              key={i}
              className={`aspect-square w-full text-xs border border-blue-200 transition-colors ${
                display === CELL_SHIP ? "bg-gray-600" : "bg-blue-100 hover:bg-blue-200"
              } ${!allPlaced ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => handleCellClick(row, col)}
              onMouseEnter={() => setHoverCell({ row, col })}
            />
          );
        })}
      </div>

      {allPlaced && (
        <button
          onClick={() => onReady(placed)}
          className="w-full rounded-xl bg-[var(--sage)] py-3 font-bold text-white shadow"
        >
          ✅ 준비 완료!
        </button>
      )}
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export function BattleshipBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY);
  const [error, setError] = useState("");
  const [lastHitPulse, setLastHitPulse] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      if (!state || !state.players || !state.ownGrids) return;
      setView({
        ...state,
        players: Array.from(state.players),
        ownGrids: Array.from(state.ownGrids),
        attackGrids: Array.from(state.attackGrids),
        readyFlags: Array.from(state.readyFlags),
      });
    };
    sync();
    const removeState = room.onStateChange(sync);
    const removeReject = room.onMessage("move-rejected", (p: { error: string }) => setError(p.error));
    const removeOver = room.onMessage("game-over", () => clearReconnectionToken());
    return () => { removeState.remove(sync); removeReject(); removeOver(); };
  }, [room]);

  const prevMsgRef = useRef("");
  useEffect(() => {
    if (view.message.includes("명중") && view.message !== prevMsgRef.current) {
      setLastHitPulse((n) => n + 1);
    }
    prevMsgRef.current = view.message;
  }, [view.message]);

  const myIndex = view.players.indexOf(guestId);
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId && view.phase === "play";
  const iAmReady = (view.readyFlags[myIndex] ?? 0) === 1;

  const myOwnGrid = parseGrid(view.ownGrids[myIndex] ?? "");
  const myAttackGrid = parseGrid(view.attackGrids[myIndex] ?? "");

  function handleReady(ships: ShipPlacement[]) {
    setError("");
    room.send("move", { action: "place-ships", ships });
  }

  function handleAttack(row: number, col: number) {
    if (!myTurn) return;
    const cell = cellIndex(row, col);
    if (myAttackGrid[cell] === CELL_HIT || myAttackGrid[cell] === CELL_MISS) return;
    setError("");
    room.send("move", { action: "attack", row, col });
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-3 select-none">

      {/* Status */}
      <div
        key={`msg-${lastHitPulse}`}
        className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm text-center"
        style={{ animation: lastHitPulse ? "winBounce 400ms ease-out" : undefined }}
      >
        <p className="text-sm font-medium text-[var(--ink)]">
          {view.winnerId
            ? (view.winnerId === guestId ? "🏆 승리했어요!" : "😔 상대방이 이겼어요.")
            : view.message}
        </p>
      </div>

      {error && <p className="text-center text-xs text-rose-600">{error}</p>}

      {waiting && (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 border border-amber-200">
          상대방을 기다리는 중이에요…
        </div>
      )}

      {/* Setup phase */}
      {!waiting && view.phase === "setup" && (
        <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm">
          <SetupPhase onReady={handleReady} alreadyReady={iAmReady} />
        </div>
      )}

      {/* Play phase — stacked (not side-by-side) so each grid keeps large,
          easy-to-tap cells on narrow phone widths instead of splitting the
          already-narrow content column in half. */}
      {view.phase === "play" || view.phase === "done" ? (
        <div className="flex flex-col gap-3">
          {/* Attack grid first — it's the one you interact with each turn */}
          <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-2 shadow-sm">
            <Grid
              grid={myAttackGrid}
              label={myTurn ? "🎯 공격 (탭!)" : "공격 현황"}
              onCellClick={myTurn ? handleAttack : undefined}
            />
          </div>

          {/* My board (opponent sees this) */}
          <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-2 shadow-sm">
            <Grid grid={myOwnGrid} label="내 함대" />
          </div>
        </div>
      ) : null}

      {/* Legend */}
      {(view.phase === "play" || view.phase === "done") && (
        <div className="flex flex-wrap gap-2 text-[10px] text-[var(--ink-mute)] justify-center">
          <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">⬜ 물</span>
          <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">⬛ 함선</span>
          <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">💥 명중</span>
          <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">○ 빗나감</span>
        </div>
      )}
    </div>
  );
}
