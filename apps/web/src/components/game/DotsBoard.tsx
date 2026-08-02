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

// Must match the server's BOXES_PER_SIDE in @playsalot/game-dots-and-boxes.
const N = 4;
const H_COUNT = (N + 1) * N;
const V_COUNT = N * (N + 1);
const BOX_COUNT = N * N;

const PAD = 9; // board padding, %
const CELL = (100 - PAD * 2) / N; // spacing between dots, %
const pos = (i: number) => PAD + i * CELL;

// Owner (edge/box value) → colour. 1 = me by convention below is remapped per player.
const LINE_COLOR = ["var(--mist)", "var(--sage)", "var(--coral)"];
const BOX_FILL = ["transparent", "var(--sage-tint)", "var(--coral-tint)"];

interface DotsView {
  hEdges: number[];
  vEdges: number[];
  boxes: number[];
  players: string[];
  currentPlayer: number;
  winnerId: string;
  isDraw: boolean;
}

const EMPTY_VIEW: DotsView = {
  hEdges: Array(H_COUNT).fill(0),
  vEdges: Array(V_COUNT).fill(0),
  boxes: Array(BOX_COUNT).fill(0),
  players: [],
  currentPlayer: 0,
  winnerId: "",
  isDraw: false,
};

export function DotsBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<DotsView>(EMPTY_VIEW);
  const [rejection, setRejection] = useState<string | null>(null);
  const [errorShake, setErrorShake] = useState(0);
  const [turnPulse, setTurnPulse] = useState(0);

  useEffect(() => {
    const syncFromState = () => {
      const state = room.state as unknown as
        | (DotsView & { hEdges: Iterable<number>; vEdges: Iterable<number>; boxes: Iterable<number>; players: Iterable<string> })
        | null;
      if (!state || !state.hEdges || !state.vEdges || !state.boxes || !state.players) return;
      setView({
        hEdges: Array.from(state.hEdges),
        vEdges: Array.from(state.vEdges),
        boxes: Array.from(state.boxes),
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
  const isMyTurn = !waitingForOpponent && view.currentPlayer === myIndex && !view.winnerId && !view.isDraw;

  const myScore = useMemo(() => view.boxes.filter((o) => o === myIndex + 1).length, [view.boxes, myIndex]);
  const oppScore = useMemo(() => view.boxes.filter((o) => o !== 0 && o !== myIndex + 1).length, [view.boxes, myIndex]);

  // ── Game feel: tap on any newly drawn edge, glow when your turn begins.
  const prevRef = useRef({ edges: 0, myTurn: false, winnerId: "" });
  useEffect(() => {
    const drawn = view.hEdges.filter(Boolean).length + view.vEdges.filter(Boolean).length;
    const prev = prevRef.current;
    if (drawn > prev.edges) playStoneSound();
    if (isMyTurn && !prev.myTurn) {
      setTurnPulse((n) => n + 1);
      playTurnStartSound();
    }
    if (view.winnerId && view.winnerId !== prev.winnerId) {
      if (view.winnerId === guestId) playWinSound();
      else playLoseSound();
    }
    prevRef.current = { edges: drawn, myTurn: isMyTurn, winnerId: view.winnerId };
  }, [view.hEdges, view.vEdges, isMyTurn, view.winnerId, guestId]);

  function handleEdgeClick(type: "h" | "v", index: number, drawn: boolean) {
    if (!isMyTurn || drawn) return;
    setRejection(null);
    room.send("move", { type, index });
  }

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
      {/* Player header / score */}
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sage)] text-sm font-bold text-white">나</span>
          <div className="text-sm">
            <div className="font-bold text-[var(--ink)]">내 상자</div>
            <div className="text-[11px] text-[var(--ink-mute)]">{myScore}개</div>
          </div>
        </div>
        <div className="text-[var(--ink-mute)] font-medium">VS</div>
        <div className="flex items-center gap-2 text-right">
          <div className="text-sm">
            <div className="font-bold text-[var(--ink)]">상대 상자</div>
            <div className="text-[11px] text-[var(--ink-mute)]">{oppScore}개</div>
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
              {isMyTurn ? "🔔 선을 하나 그으세요" : "상대방의 차례입니다..."}
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

      {/* Board */}
      <div className="relative w-full aspect-square rounded-2xl bg-[var(--paper)] ring-1 ring-[var(--mist)]">
        {/* Claimed boxes */}
        {view.boxes.map((owner, i) => {
          if (owner === 0) return null;
          const br = Math.floor(i / N);
          const bc = i % N;
          const mine = owner === myIndex + 1;
          return (
            <div
              key={`box-${i}`}
              className="absolute flex items-center justify-center rounded-[6px] text-xs font-bold"
              style={{
                left: `${pos(bc)}%`,
                top: `${pos(br)}%`,
                width: `${CELL}%`,
                height: `${CELL}%`,
                backgroundColor: BOX_FILL[owner],
                color: mine ? "var(--sage-deep)" : "var(--coral-deep)",
                animation: "housePop 220ms ease-out",
              }}
            >
              {mine ? "나" : "적"}
            </div>
          );
        })}

        {/* Horizontal edges */}
        {view.hEdges.map((owner, index) => {
          const row = Math.floor(index / N);
          const col = index % N;
          const drawn = owner !== 0;
          return (
            <button
              key={`h-${index}`}
              onClick={() => handleEdgeClick("h", index, drawn)}
              disabled={drawn || !isMyTurn}
              className="absolute flex items-center justify-center"
              style={{
                left: `${pos(col)}%`,
                top: `${pos(row)}%`,
                width: `${CELL}%`,
                height: "8%",
                transform: "translateY(-50%)",
                cursor: !drawn && isMyTurn ? "pointer" : "default",
              }}
            >
              <span
                className="h-[4px] w-full rounded-full transition-colors"
                style={{
                  backgroundColor: drawn ? LINE_COLOR[owner] : "var(--mist)",
                  opacity: drawn ? 1 : isMyTurn ? 0.5 : 0.25,
                }}
              />
            </button>
          );
        })}

        {/* Vertical edges */}
        {view.vEdges.map((owner, index) => {
          const row = Math.floor(index / (N + 1));
          const col = index % (N + 1);
          const drawn = owner !== 0;
          return (
            <button
              key={`v-${index}`}
              onClick={() => handleEdgeClick("v", index, drawn)}
              disabled={drawn || !isMyTurn}
              className="absolute flex items-center justify-center"
              style={{
                left: `${pos(col)}%`,
                top: `${pos(row)}%`,
                width: "8%",
                height: `${CELL}%`,
                transform: "translateX(-50%)",
                cursor: !drawn && isMyTurn ? "pointer" : "default",
              }}
            >
              <span
                className="w-[4px] h-full rounded-full transition-colors"
                style={{
                  backgroundColor: drawn ? LINE_COLOR[owner] : "var(--mist)",
                  opacity: drawn ? 1 : isMyTurn ? 0.5 : 0.25,
                }}
              />
            </button>
          );
        })}

        {/* Dots on top */}
        {Array.from({ length: (N + 1) * (N + 1) }).map((_, i) => {
          const r = Math.floor(i / (N + 1));
          const c = i % (N + 1);
          return (
            <span
              key={`dot-${i}`}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)]"
              style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
