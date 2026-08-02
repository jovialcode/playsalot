"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";
import {
  playInvalidSound,
  playLoseSound,
  playStoneSound,
  playTurnStartSound,
  playWinSound,
} from "@/lib/sound";

// Flat 14-slot Kalah board, mirroring the server's mancala state layout.
const P0_PITS = [0, 1, 2, 3, 4, 5];
const P1_PITS = [7, 8, 9, 10, 11, 12];
const STORE = [6, 13] as const;

interface MancalaView {
  board: number[];
  players: string[];
  currentPlayer: number;
  winnerId: string;
  isDraw: boolean;
}

const EMPTY_VIEW: MancalaView = {
  board: Array(14).fill(0),
  players: [],
  currentPlayer: 0,
  winnerId: "",
  isDraw: false,
};

/** A small cluster of seed pips (capped) so a pit reads at a glance without counting. */
function Seeds({ count }: { count: number }) {
  const pips = Math.min(count, 12);
  return (
    <div className="pointer-events-none flex max-w-[80%] flex-wrap items-center justify-center gap-[3px]">
      {Array.from({ length: pips }).map((_, i) => (
        <span key={i} className="h-[6px] w-[6px] rounded-full bg-[var(--sage-deep)]" />
      ))}
    </div>
  );
}

export function MancalaBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<MancalaView>(EMPTY_VIEW);
  const [rejection, setRejection] = useState<string | null>(null);
  const [errorShake, setErrorShake] = useState(0);
  const [turnPulse, setTurnPulse] = useState(0);

  useEffect(() => {
    const syncFromState = () => {
      const state = room.state as unknown as
        | (MancalaView & { board: Iterable<number>; players: Iterable<string> })
        | null;
      if (!state || !state.board || !state.players) return;
      setView({
        board: Array.from(state.board),
        players: Array.from(state.players),
        currentPlayer: state.currentPlayer,
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
  const myIndex = Math.max(view.players.indexOf(guestId), 0);
  const oppIndex = myIndex === 0 ? 1 : 0;
  const isMyTurn = !waitingForOpponent && view.currentPlayer === myIndex && !view.winnerId && !view.isDraw;

  const myPits = myIndex === 0 ? P0_PITS : P1_PITS;
  const oppPits = oppIndex === 0 ? P0_PITS : P1_PITS;
  const myStore = STORE[myIndex];
  const oppStore = STORE[oppIndex];

  // ── Game feel: click sound on any seed movement, glow when your turn begins.
  const prevRef = useRef({ board: EMPTY_VIEW.board, myTurn: false, winnerId: "" });
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.board.length === view.board.length) {
      for (let i = 0; i < view.board.length; i += 1) {
        if (prev.board[i] !== view.board[i]) {
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

  function handlePitClick(pit: number) {
    if (!isMyTurn || (view.board[pit] ?? 0) <= 0) return;
    setRejection(null);
    room.send("move", { pit });
  }

  const seedCount = (i: number) => view.board[i] ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-5">
      {/* Player header */}
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sage)] text-sm font-bold text-white">나</span>
          <div className="text-sm">
            <div className="font-bold text-[var(--ink)]">내 창고</div>
            <div className="text-[11px] text-[var(--ink-mute)]">{seedCount(myStore)}알</div>
          </div>
        </div>
        <div className="text-[var(--ink-mute)] font-medium">VS</div>
        <div className="flex items-center gap-2 text-right">
          <div className="text-sm">
            <div className="font-bold text-[var(--ink)]">상대 창고</div>
            <div className="text-[11px] text-[var(--ink-mute)]">{seedCount(oppStore)}알</div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--coral)] text-sm font-bold text-white">적</span>
        </div>
      </div>

      {/* Status pill */}
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
              {isMyTurn ? "🔔 내 구덩이를 선택하세요" : "상대방의 차례입니다..."}
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

      {/* Board: opponent store on the left, my store on the right, two pit rows between. */}
      <div className="flex w-full items-stretch gap-2 rounded-3xl bg-[#d8b878] p-3 shadow-inner ring-4 ring-[#c59c4a]">
        <Store label="상대" seeds={seedCount(oppStore)} tone="coral" />

        <div className="grid flex-1 grid-cols-6 grid-rows-2 gap-2">
          {/* Top row: opponent pits, shown right-to-left so play flows counterclockwise. */}
          {[...oppPits].reverse().map((pit) => (
            <Pit key={pit} seeds={seedCount(pit)} tone="coral" />
          ))}
          {/* Bottom row: my pits, left-to-right, tappable on my turn. */}
          {myPits.map((pit) => (
            <Pit
              key={pit}
              seeds={seedCount(pit)}
              tone="sage"
              active={isMyTurn && seedCount(pit) > 0}
              onClick={() => handlePitClick(pit)}
            />
          ))}
        </div>

        <Store label="나" seeds={seedCount(myStore)} tone="sage" />
      </div>
    </div>
  );
}

function Pit({
  seeds,
  tone,
  active = false,
  onClick,
}: {
  seeds: number;
  tone: "sage" | "coral";
  active?: boolean;
  onClick?: () => void;
}) {
  const ring = tone === "sage" ? "ring-[var(--sage-soft)]" : "ring-[var(--coral-soft,#e8b3a3)]";
  return (
    <button
      onClick={onClick}
      disabled={!active}
      className={`relative flex aspect-square items-center justify-center rounded-full bg-[var(--cream)] ring-2 transition-all ${ring} ${
        active ? "cursor-pointer ring-[var(--sage)] hover:scale-105 active:scale-95" : "cursor-default"
      }`}
    >
      <Seeds count={seeds} />
      <span className="absolute bottom-[3px] right-[6px] text-[11px] font-bold text-[var(--ink-mute)]">{seeds}</span>
    </button>
  );
}

function Store({ label, seeds, tone }: { label: string; seeds: number; tone: "sage" | "coral" }) {
  const bg = tone === "sage" ? "bg-[var(--sage)]" : "bg-[var(--coral)]";
  return (
    <div className={`flex w-14 flex-col items-center justify-center gap-1 rounded-[28px] ${bg} py-3 text-white`}>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span className="text-2xl font-extrabold tabular-nums">{seeds}</span>
    </div>
  );
}
