"use client";

import type { Room } from "colyseus.js";
import { useEffect, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

const BOARD_SIZE = 15;
const CELL_SIZE = 28;
const BOARD_PADDING = 16;
const BOARD_PIXELS = CELL_SIZE * (BOARD_SIZE - 1);
const STONE_SIZE = 22;
const HIT_SIZE = CELL_SIZE;

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

export function OmokBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<OmokView>(EMPTY_VIEW);
  const [rejection, setRejection] = useState<string | null>(null);

  useEffect(() => {
    const syncFromState = () => {
      const state = room.state as unknown as (OmokView & { board: Iterable<number>; players: Iterable<string> }) | null;
      if (!state) return;
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
    const removeRejectionListener = room.onMessage("move-rejected", (payload: { error: string }) => setRejection(payload.error));
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

  function handleCellClick(row: number, col: number) {
    if (waitingForOpponent || !isMyTurn || view.winnerId || view.isDraw) return;
    setRejection(null);
    room.send("move", { row, col });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-white font-bold ${myIndex === 0 ? 'bg-zinc-800' : 'bg-zinc-100 border border-zinc-300 !text-zinc-800'}`}>
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
            <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-white font-bold ${myIndex === 1 ? 'bg-zinc-800' : 'bg-zinc-100 border border-zinc-300 !text-zinc-800'}`}>
                {myIndex === 1 ? '●' : '○'}
            </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-[var(--cream-deep)] px-4 py-1 text-sm font-medium">
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
        {rejection && <div className="text-xs text-[var(--danger)] animate-pulse">{rejection}</div>}
      </div>

      <div
        className="relative rounded-lg shadow-xl ring-8 ring-[#c59c4a]"
        style={{
          width: BOARD_PIXELS + BOARD_PADDING * 2,
          height: BOARD_PIXELS + BOARD_PADDING * 2,
          backgroundColor: '#dcb35c',
          backgroundImage: 'radial-gradient(circle, #e5c175 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute bg-zinc-800/30"
            style={{ left: BOARD_PADDING, top: BOARD_PADDING + i * CELL_SIZE, width: BOARD_PIXELS, height: 1 }}
          />
        ))}
        {Array.from({ length: BOARD_SIZE }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute bg-zinc-800/30"
            style={{ top: BOARD_PADDING, left: BOARD_PADDING + i * CELL_SIZE, height: BOARD_PIXELS, width: 1 }}
          />
        ))}
        {/* 화점 표시 */}
        {[3, 11].map(row => [3, 11].map(col => (
             <div key={`${row}-${col}`} className="absolute w-1.5 h-1.5 bg-zinc-800/40 rounded-full" style={{ left: BOARD_PADDING + col * CELL_SIZE - 3, top: BOARD_PADDING + row * CELL_SIZE - 3 }} />
        )))}
        <div className="absolute w-1.5 h-1.5 bg-zinc-800/40 rounded-full" style={{ left: BOARD_PADDING + 7 * CELL_SIZE - 3, top: BOARD_PADDING + 7 * CELL_SIZE - 3 }} />

        {view.board.map((cell, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;
          return (
            <button
              key={index}
              onClick={() => handleCellClick(row, col)}
              className="absolute flex items-center justify-center transition-all active:scale-95"
              style={{
                left: BOARD_PADDING + col * CELL_SIZE - HIT_SIZE / 2,
                top: BOARD_PADDING + row * CELL_SIZE - HIT_SIZE / 2,
                width: HIT_SIZE,
                height: HIT_SIZE,
              }}
            >
              {cell !== 0 && (
                <span
                  className={`rounded-full shadow-lg ${cell === 1 ? "bg-zinc-900 bg-gradient-to-br from-zinc-700 to-zinc-900" : "bg-zinc-50 bg-gradient-to-br from-white to-zinc-200"}`}
                  style={{ 
                    width: STONE_SIZE, 
                    height: STONE_SIZE,
                    boxShadow: cell === 1 ? 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 4px rgba(0,0,0,0.3)' : 'inset -2px -2px 4px rgba(0,0,0,0.1), 2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
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
