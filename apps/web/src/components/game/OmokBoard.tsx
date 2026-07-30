"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";
import {
  playInvalidSound,
  playLoseSound,
  playStoneSound,
  playTurnStartSound,
  playWinSound,
} from "@/lib/sound";

const BOARD_SIZE = 15;
const GRID_SPANS = BOARD_SIZE - 1;
// All board geometry is expressed as % of the (square) board container so it
// scales down on narrow phone viewports instead of overflowing at a fixed px size.
const BOARD_PADDING_PCT = 7;
const CELL_PCT = (100 - BOARD_PADDING_PCT * 2) / GRID_SPANS;
const STONE_PCT = CELL_PCT * 0.8;
const WIN_DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;

function intersectionPct(i: number) {
  return BOARD_PADDING_PCT + i * CELL_PCT;
}

interface OmokView {
  board: number[];
  players: string[];
  turnIndex: number;
  winnerId: string;
  isDraw: boolean;
}

const EMPTY_VIEW: OmokView = {
  board: Array(BOARD_SIZE * BOARD_SIZE).fill(0),
  players: [],
  turnIndex: 0,
  winnerId: "",
  isDraw: false,
};

/** No winning-line data comes from the server (state only has winnerId), so the client
 * re-derives the 5 connected stones itself from the final board once someone has won. */
function findWinningLine(board: number[], stone: number): number[] {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row * BOARD_SIZE + col] !== stone) continue;
      for (const [dr, dc] of WIN_DIRECTIONS) {
        const cells: number[] = [];
        for (let k = 0; k < 5; k += 1) {
          const r = row + dr * k;
          const c = col + dc * k;
          if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
          if (board[r * BOARD_SIZE + c] !== stone) break;
          cells.push(r * BOARD_SIZE + c);
        }
        if (cells.length >= 5) return cells;
      }
    }
  }
  return [];
}

export function OmokBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<OmokView>(EMPTY_VIEW);
  const [rejection, setRejection] = useState<string | null>(null);
  const [errorShake, setErrorShake] = useState(0);
  const [turnPulse, setTurnPulse] = useState(0);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);

  useEffect(() => {
    const syncFromState = () => {
      const state = room.state as unknown as (OmokView & { board: Iterable<number>; players: Iterable<string> }) | null;
      // room.state can briefly be an incompletely-hydrated object during a dev-server
      // Fast Refresh or a reconnect race, so guard on the fields we're about to read.
      if (!state || !state.board || !state.players) return;
      setView({
        board: Array.from(state.board),
        players: Array.from(state.players),
        turnIndex: state.turnIndex,
        winnerId: state.winnerId,
        isDraw: state.isDraw,
      });
    };

    syncFromState();
    const removeStateListener = room.onStateChange(syncFromState);
    const removeRejectionListener = room.onMessage("move-rejected", (payload: { error: string }) => {
      setRejection(payload.error);
      setErrorShake((n) => n + 1);
      playInvalidSound();
    });
    const removeGameOverListener = room.onMessage("game-over", () => clearReconnectionToken());

    return () => {
      removeStateListener.remove(syncFromState);
      removeRejectionListener();
      removeGameOverListener();
    };
  }, [room]);

  const waitingForOpponent = view.players.length < 2;
  const myIndex = view.players.indexOf(guestId);
  const isMyTurn = !waitingForOpponent && myIndex === view.turnIndex % view.players.length;

  const winningLine = useMemo(() => {
    if (!view.winnerId) return [];
    const winnerIndex = view.players.indexOf(view.winnerId);
    if (winnerIndex === -1) return [];
    return findWinningLine(view.board, winnerIndex + 1);
  }, [view.board, view.winnerId, view.players]);

  // ── Game feel: play a placement tap on any new stone, glow the status pill
  // when your turn starts, and mark the most recently placed stone.
  const prevRef = useRef({ board: EMPTY_VIEW.board, myTurn: false, winnerId: "" });
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.board.length > 0) {
      for (let i = 0; i < view.board.length; i += 1) {
        if (prev.board[i] === 0 && view.board[i] !== 0) {
          setLastMoveIndex(i);
          playStoneSound();
          break;
        }
      }
    }
    if (isMyTurn && !prev.myTurn) {
      setTurnPulse((n) => n + 1);
      playTurnStartSound();
    }
    if (view.winnerId && view.winnerId !== prev.winnerId) {
      if (view.winnerId === guestId) playWinSound();
      else playLoseSound();
    }
    prevRef.current = { board: [...view.board], myTurn: isMyTurn, winnerId: view.winnerId };
  }, [view.board, isMyTurn, view.winnerId, guestId]);

  function handleCellClick(row: number, col: number) {
    if (waitingForOpponent || !isMyTurn || view.winnerId || view.isDraw) return;
    setRejection(null);
    room.send("move", { row, col });
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-white font-bold transition-shadow ${myIndex === 0 ? 'bg-zinc-800' : 'bg-zinc-100 border border-zinc-300 !text-zinc-800'} ${isMyTurn && !view.winnerId ? 'ring-2 ring-[var(--sage)] ring-offset-2' : ''}`}
            >
                {myIndex === 0 ? '●' : '○'}
            </div>
            <div className="text-sm">
                <div className="font-bold text-[var(--ink)]">나</div>
                <div className="text-[11px] text-[var(--ink-mute)]">{myIndex === 0 ? '흑' : '백'}</div>
            </div>
        </div>
        <div className="text-[var(--ink-mute)] font-medium">VS</div>
        <div className="flex items-center gap-3 text-right">
            <div className="text-sm">
                <div className="font-bold text-[var(--ink)]">상대방</div>
                <div className="text-[11px] text-[var(--ink-mute)]">{myIndex === 0 ? '백' : '흑'}</div>
            </div>
            <div
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-white font-bold transition-shadow ${myIndex === 1 ? 'bg-zinc-800' : 'bg-zinc-100 border border-zinc-300 !text-zinc-800'} ${!isMyTurn && !waitingForOpponent && !view.winnerId ? 'ring-2 ring-[var(--sage)] ring-offset-2' : ''}`}
            >
                {myIndex === 1 ? '●' : '○'}
            </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div
          key={`status-${turnPulse}`}
          className="rounded-full bg-[var(--cream-deep)] px-4 py-1 text-sm font-medium"
          style={{ animation: turnPulse ? "turnGlow 900ms ease-out" : undefined }}
        >
            {waitingForOpponent && <span className="text-[var(--ink-mute)]">상대방을 기다리는 중...</span>}
            {!waitingForOpponent && view.winnerId && (
                <span className={view.winnerId === guestId ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                    {view.winnerId === guestId ? "🎉 승리했습니다!" : "💀 패배했습니다."}
                </span>
            )}
            {!waitingForOpponent && view.isDraw && <span className="text-[var(--ink-soft)]">무승부입니다.</span>}
            {!waitingForOpponent && !view.winnerId && !view.isDraw && (
                <span className={isMyTurn ? "text-[var(--sage)] font-bold" : "text-[var(--ink-mute)]"}>
                    {isMyTurn ? "🔔 당신의 차례입니다" : "상대방의 차례입니다..."}
                </span>
            )}
        </div>
        {rejection && (
          <div
            key={`error-${errorShake}`}
            className="text-xs text-[var(--danger)]"
            style={{ animation: errorShake ? "shake 320ms" : undefined }}
          >
            {rejection}
          </div>
        )}
      </div>

      <div
        className="relative w-full aspect-square rounded-lg shadow-xl ring-4 sm:ring-8 ring-[#c59c4a]"
        style={{
          backgroundColor: '#dcb35c',
          backgroundImage: 'radial-gradient(circle, #e5c175 1px, transparent 1px)',
          backgroundSize: '7.14% 7.14%',
        }}
      >
        <div
          className="absolute"
          style={{
            left: `${BOARD_PADDING_PCT}%`,
            top: `${BOARD_PADDING_PCT}%`,
            right: `${BOARD_PADDING_PCT}%`,
            bottom: `${BOARD_PADDING_PCT}%`,
            backgroundImage:
              `repeating-linear-gradient(to right, rgba(39,39,42,0.35) 0, rgba(39,39,42,0.35) 1px, transparent 1px, transparent calc(100%/${GRID_SPANS})),` +
              `repeating-linear-gradient(to bottom, rgba(39,39,42,0.35) 0, rgba(39,39,42,0.35) 1px, transparent 1px, transparent calc(100%/${GRID_SPANS}))`,
          }}
        />
        {/* 화점 표시 */}
        {[3, 11].map(row => [3, 11].map(col => (
             <div key={`${row}-${col}`} className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800/40" style={{ left: `${intersectionPct(col)}%`, top: `${intersectionPct(row)}%` }} />
        )))}
        <div className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800/40" style={{ left: `${intersectionPct(7)}%`, top: `${intersectionPct(7)}%` }} />

        {view.board.map((cell, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;
          return (
            <button
              key={index}
              onClick={() => handleCellClick(row, col)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all active:scale-95"
              style={{
                left: `${intersectionPct(col)}%`,
                top: `${intersectionPct(row)}%`,
                width: `${CELL_PCT}%`,
                height: `${CELL_PCT}%`,
              }}
            >
              {cell !== 0 && (
                <span
                  className={`relative rounded-full shadow-lg ${cell === 1 ? "bg-zinc-900 bg-gradient-to-br from-zinc-700 to-zinc-900" : "bg-zinc-50 bg-gradient-to-br from-white to-zinc-200"}`}
                  style={{
                    width: `${STONE_PCT}%`,
                    height: `${STONE_PCT}%`,
                    boxShadow: cell === 1 ? 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 4px rgba(0,0,0,0.3)' : 'inset -2px -2px 4px rgba(0,0,0,0.1), 2px 2px 4px rgba(0,0,0,0.2)',
                    animation: winningLine.includes(index)
                      ? "stonePop 180ms ease-out, stoneWinGlow 1.4s ease-in-out infinite"
                      : "stonePop 180ms ease-out",
                  }}
                >
                  {index === lastMoveIndex && !winningLine.includes(index) && (
                    <span
                      className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${cell === 1 ? "bg-white/70" : "bg-zinc-900/50"}`}
                    />
                  )}
                </span>
              )}
              {cell === 0 && isMyTurn && !view.winnerId && (
                  <span className="w-2 h-2 rounded-full bg-zinc-800/10 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
