"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

// ── Board geometry ────────────────────────────────────────────────────────────

const HOME = 99;
const OFF_BOARD = -1;

// Raw (0-300) coords; scaled via CSS transform on a 300×300 board
const BOARD_COORDS: Record<number, [number, number]> = {
  0: [300, 0], 1: [300, 60], 2: [300, 120], 3: [300, 180], 4: [300, 240],
  5: [300, 300], 6: [240, 300], 7: [180, 300], 8: [120, 300], 9: [60, 300],
  10: [0, 300], 11: [0, 240], 12: [0, 180], 13: [0, 120], 14: [0, 60],
  15: [0, 0], 16: [60, 0], 17: [120, 0], 18: [180, 0], 19: [240, 0],
  // SE diagonal shortcut
  20: [240, 240], 21: [150, 150], 22: [60, 60],
  // SW anti-diagonal shortcut
  23: [60, 240], 28: [150, 150], 24: [240, 60],
};

const CORNERS = new Set([0, 5, 10, 15]);
const SHORTCUT_CORNERS = new Set([5, 10]);
const THROW_NAME: Record<number, string> = { 1: "도", 2: "개", 3: "걸", 4: "윷", 5: "모" };

// Mirrors the server's yutnori advancePosition rule so the UI can preview the
// exact destination before the player confirms a move.
const NEXT_POSITION: Record<number, number> = {
  0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10,
  10: 11, 11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: HOME,
  20: 21, 21: 22, 22: 15, 23: 28, 28: 24, 24: HOME,
};
const SHORTCUT_START: Record<number, number> = { 5: 20, 10: 23 };

function previewDestination(storedPosition: number, steps: number): number {
  let position = storedPosition === OFF_BOARD ? 0 : storedPosition;
  for (let step = 0; step < steps; step += 1) {
    if (position === HOME) return HOME;
    position = step === 0 && SHORTCUT_START[position] !== undefined
      ? SHORTCUT_START[position]!
      : (NEXT_POSITION[position] ?? HOME);
  }
  return position;
}

// ── State interface ───────────────────────────────────────────────────────────

interface View {
  players: string[];
  pieces: string[]; // CSV per player
  phase: string;
  turnIndex: number;
  throwResult: number;
  extraThrows: number;
  message: string;
  winnerId: string;
}

const EMPTY: View = {
  players: [], pieces: [], phase: "wait", turnIndex: 0,
  throwResult: 0, extraThrows: 0, message: "상대를 기다리는 중...", winnerId: "",
};

function parsePieces(csv: string): number[] {
  return (csv || "-1,-1,-1,-1").split(",").map(Number);
}

// ── SVG Board ─────────────────────────────────────────────────────────────────

const BOARD_EDGES = [
  // Outer ring lines
  ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((p, i, arr) => [p, arr[(i+1) % arr.length]!] as [number, number]),
  // Shortcuts
  [5,20],[20,21],[21,22],[22,15],
  [10,23],[23,28],[28,24],[24,99],
];

// We draw edges between adjacent positions
const DRAW_EDGES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[4,5],
  [5,6],[6,7],[7,8],[8,9],[9,10],
  [10,11],[11,12],[12,13],[13,14],[14,15],
  [15,16],[16,17],[17,18],[18,19],
  // Diagonal shortcuts
  [5,20],[20,21],[21,22],[22,15],
  [10,23],[23,28],[28,24],
];

const BOARD_SIZE = 300;

interface PieceMarker {
  playerIdx: number;
  pieceIdx: number;
  pos: number;
}

function BoardSvg({
  myPieces,
  opponentPieces,
  myIndex,
  phase,
  throwResult,
  selectedPiece,
  plannedDestination,
  onSelectPiece,
  onMoveToDestination,
}: {
  myPieces: number[];
  opponentPieces: number[];
  myIndex: number;
  phase: string;
  throwResult: number;
  selectedPiece: number | null;
  plannedDestination: number | null;
  onSelectPiece: (i: number) => void;
  onMoveToDestination: () => void;
}) {
  const markers: PieceMarker[] = [];
  myPieces.forEach((pos, i) => { if (pos !== OFF_BOARD && pos !== HOME) markers.push({ playerIdx: myIndex, pieceIdx: i, pos }); });
  opponentPieces.forEach((pos, i) => { if (pos !== OFF_BOARD && pos !== HOME) markers.push({ playerIdx: 1 - myIndex, pieceIdx: i, pos }); });

  // Group markers by position for offset stacking
  const byPos: Record<number, PieceMarker[]> = {};
  for (const m of markers) {
    (byPos[m.pos] ??= []).push(m);
  }

  return (
    <svg
      viewBox="-20 -20 340 340"
      style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}
    >
      {/* Board edges */}
      {DRAW_EDGES.map(([a, b], i) => {
        const ca = BOARD_COORDS[a];
        const cb = BOARD_COORDS[b];
        if (!ca || !cb) return null;
        return (
          <line
            key={i}
            x1={ca[0]} y1={ca[1]}
            x2={cb[0]} y2={cb[1]}
            stroke="#d1d5db" strokeWidth={2}
          />
        );
      })}

      {/* Board positions */}
      {Object.entries(BOARD_COORDS).map(([posStr, [cx, cy]]) => {
        const pos = Number(posStr);
        const isCorner = CORNERS.has(pos);
        const isShortcutCorner = SHORTCUT_CORNERS.has(pos);
        return (
          <circle
            key={pos}
            cx={cx} cy={cy}
            r={isCorner ? 10 : 6}
            fill={isShortcutCorner ? "#fef3c7" : pos === 0 ? "#dcfce7" : pos === 21 || pos === 28 ? "#ede9fe" : "#f9fafb"}
            stroke={isShortcutCorner ? "#f59e0b" : pos === 0 ? "#16a34a" : pos === 21 || pos === 28 ? "#7c3aed" : "#9ca3af"}
            strokeWidth={isCorner ? 2 : 1.5}
          />
        );
      })}

      {/* After selecting a piece, its only legal destination is made explicit.
          Tapping this marker confirms the move instead of requiring a second tap on the piece. */}
      {plannedDestination !== null && plannedDestination !== HOME && BOARD_COORDS[plannedDestination] && (() => {
        const [cx, cy] = BOARD_COORDS[plannedDestination]!;
        return (
          <g
            transform={`translate(${cx}, ${cy})`}
            className="cursor-pointer"
            onClick={onMoveToDestination}
          >
            <circle r={16} fill="#fbbf24" fillOpacity={0.25} stroke="#f59e0b" strokeWidth={2.5} />
            <circle r={5} fill="#f59e0b" />
            <text y={-21} textAnchor="middle" fontSize={9} fill="#b45309" fontWeight="bold">이동</text>
          </g>
        );
      })()}

      {/* Corner labels */}
      <text x={300} y={-4} textAnchor="middle" fontSize={9} fill="#16a34a" fontWeight="bold">출발</text>
      <text x={300} y={316} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight="bold">모서리</text>
      <text x={0} y={316} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight="bold">모서리</text>
      <text x={0} y={-4} textAnchor="middle" fontSize={9} fill="#6b7280">NW</text>

      {/* Pieces */}
      {Object.entries(byPos).map(([posStr, ms]) => {
        const pos = Number(posStr);
        const [cx, cy] = BOARD_COORDS[pos] ?? [0, 0];
        return ms.map((m, stackIdx) => {
          const isMe = m.playerIdx === myIndex;
          const isSelected = isMe && m.pieceIdx === selectedPiece;
          const offsetX = stackIdx * 8 - (ms.length - 1) * 4;
          const canMove = isMe && phase === "choose" && throwResult > 0;
          return (
            <g
              key={`${m.playerIdx}-${m.pieceIdx}`}
              transform={`translate(${cx + offsetX}, ${cy})`}
              style={{ cursor: canMove ? "pointer" : "default" }}
              onClick={canMove ? () => onSelectPiece(m.pieceIdx) : undefined}
            >
              <circle
                r={10}
                fill={isMe ? "#3b82f6" : "#ef4444"}
                stroke={isSelected ? "#fbbf24" : "#fff"}
                strokeWidth={isSelected ? 3 : 1.5}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={8}
                fill="white"
                fontWeight="bold"
              >
                {m.pieceIdx + 1}
              </text>
            </g>
          );
        });
      })}
    </svg>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export function YutnoriBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY);
  const [error, setError] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [throwAnim, setThrowAnim] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      if (!state || !state.players || !state.pieces) return;
      setView({
        ...state,
        players: Array.from(state.players),
        pieces: Array.from(state.pieces),
      });
    };
    sync();
    const removeState = room.onStateChange(sync);
    const removeReject = room.onMessage("move-rejected", (p: { error: string }) => setError(p.error));
    const removeOver = room.onMessage("game-over", () => clearReconnectionToken());
    return () => { removeState.remove(sync); removeReject(); removeOver(); };
  }, [room]);

  const prevThrowRef = useRef(0);
  useEffect(() => {
    if (view.throwResult !== prevThrowRef.current) {
      setThrowAnim((n) => n + 1);
      setSelectedPiece(null);
      prevThrowRef.current = view.throwResult;
    }
  }, [view.throwResult]);

  const myIndex = view.players.indexOf(guestId);
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId;
  const canThrow = myTurn && view.phase === "throw";
  const canChoose = myTurn && view.phase === "choose";

  const myPieces = myIndex >= 0 ? parsePieces(view.pieces[myIndex] ?? "") : [];
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const opponentPieces = parsePieces(view.pieces[opponentIndex] ?? "");

  const homeCount = myPieces.filter((p) => p === HOME).length;
  const opponentHomeCount = opponentPieces.filter((p) => p === HOME).length;
  const plannedDestination = selectedPiece === null || !canChoose
    ? null
    : previewDestination(myPieces[selectedPiece] ?? OFF_BOARD, view.throwResult);

  const send = (msg: Record<string, unknown>) => {
    setError("");
    room.send("move", msg);
  };

  function handleThrow() {
    if (!canThrow) return;
    send({ action: "throw" });
  }

  function handlePieceSelect(i: number) {
    if (!canChoose) return;
    setSelectedPiece(i);
  }

  function handleMoveToDestination() {
    if (!canChoose || selectedPiece === null) return;
    send({ action: "move", pieceIndex: selectedPiece });
    setSelectedPiece(null);
  }

  // Off-board pieces the player can choose to enter
  const offBoardIndexes = myPieces.map((p, i) => (p === OFF_BOARD ? i : -1)).filter((i) => i !== -1);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[420px] flex-col justify-between gap-1.5 select-none">

      {/* Status */}
      <div className="shrink-0 rounded-2xl border border-[var(--mist)] bg-[var(--paper)] px-3 py-2 shadow-sm text-center">
        <p className="m-0 text-sm font-medium leading-snug text-[var(--ink)]">
          {view.winnerId
            ? (view.winnerId === guestId ? "🏆 승리했어요!" : "😔 상대방이 이겼어요.")
            : view.message}
        </p>
        <div className="mt-1 flex justify-center gap-6 text-xs text-[var(--ink-soft)]">
          <span>나 🏠 {homeCount}/4</span>
          <span>상대 🏠 {opponentHomeCount}/4</span>
        </div>
      </div>

      {/* Board */}
      <div className="w-[min(100%,340px,calc(100dvh-230px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] shrink-0 rounded-2xl border border-[var(--mist)] bg-white p-1.5 shadow-sm">
        <BoardSvg
          myPieces={myPieces}
          opponentPieces={opponentPieces}
          myIndex={myIndex}
          phase={view.phase}
          throwResult={view.throwResult}
          selectedPiece={selectedPiece}
          plannedDestination={plannedDestination}
          onSelectPiece={handlePieceSelect}
          onMoveToDestination={handleMoveToDestination}
        />
      </div>

      {/* Throw result */}
      {view.throwResult > 0 && (
        <div
          key={`throw-${throwAnim}`}
          className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-center"
          style={{ animation: throwAnim ? "winBounce 400ms ease-out" : undefined }}
        >
          <p className="m-0 text-xl font-black text-amber-800">{THROW_NAME[view.throwResult]} <span className="text-xs font-medium text-amber-600">{view.throwResult}칸 이동</span></p>
        </div>
      )}

      {error && (
        <p className="text-center text-xs text-rose-600">{error}</p>
      )}

      {/* Off-board piece entry buttons (shown when choosing) */}
      {canChoose && offBoardIndexes.length > 0 && (
        <div className="flex shrink-0 gap-2 flex-wrap justify-center">
          {offBoardIndexes.map((i) => (
            <button
              key={i}
              onClick={() => handlePieceSelect(i)}
              className={`h-10 w-10 rounded-full text-sm font-bold text-white shadow transition-transform active:scale-95 ${
                selectedPiece === i ? "bg-yellow-500 scale-110" : "bg-blue-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span className="self-center text-xs text-[var(--ink-mute)]">출발할 말 선택</span>
        </div>
      )}

      {/* Piece confirmation hint */}
      {selectedPiece !== null && plannedDestination === HOME && (
        <button
          type="button"
          onClick={handleMoveToDestination}
          className="shrink-0 rounded-xl bg-[var(--sage-tint)] px-3 py-2 text-center text-sm font-bold text-[var(--sage-deep)] active:scale-[.98]"
        >
          말 {selectedPiece + 1}번을 집으로 이동하기 🏠
        </button>
      )}

      {/* Action buttons */}
      {!waiting && !view.winnerId && (
        <button
          onClick={handleThrow}
          disabled={!canThrow}
          className="w-full shrink-0 rounded-xl bg-[var(--coral)] px-4 py-3 text-base font-black text-white shadow active:scale-[.97] disabled:opacity-40 transition-transform"
        >
          {canThrow ? "🎲 던지기!" : canChoose ? selectedPiece === null ? "말을 선택하세요" : "표시된 칸을 누르세요" : "상대방 차례…"}
        </button>
      )}

      {waiting && (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 border border-amber-200">
          상대방을 기다리는 중이에요…
        </div>
      )}

      {/* Legend */}
      <div className="hidden flex-wrap gap-2 text-[10px] text-[var(--ink-mute)] justify-center sm:flex">
        <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">🟢 출발</span>
        <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">🟡 지름길 모서리</span>
        <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">🟣 중앙</span>
        <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">🔵 내 말</span>
        <span className="rounded-full border border-[var(--mist)] px-2 py-0.5">🔴 상대 말</span>
      </div>
    </div>
  );
}
