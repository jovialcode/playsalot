"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";
import {
  playFlipSound,
  playLoseSound,
  playRingCorrectSound,
  playRingSound,
  playRingWrongSound,
  playWinSound,
} from "@/lib/sound";

const FRUIT_EMOJI: Record<string, string> = { s: "🍓", l: "🟢", b: "🍌", p: "🟣" };
const FRUIT_LABEL: Record<string, string> = { s: "딸기", l: "라임", b: "바나나", p: "자두" };

function cardFruit(card: string): string {
  return card[0] ?? "s";
}

function cardCount(card: string): number {
  return Number(card.slice(1));
}

function topOf(pile: string): string | null {
  if (!pile) return null;
  const cards = pile.split(",");
  return cards[cards.length - 1] ?? null;
}

function countOf(pile: string): number {
  return pile ? pile.split(",").length : 0;
}

interface View {
  players: string[];
  decks: string[];
  faceUp: string[];
  turnIndex: number;
  phase: string;
  message: string;
  winnerId: string;
}

const EMPTY_VIEW: View = {
  players: [],
  decks: [],
  faceUp: [],
  turnIndex: 0,
  phase: "wait",
  message: "상대를 기다리는 중...",
  winnerId: "",
};

function FruitCard({ card, size = "lg" }: { card: string | null; size?: "lg" | "sm" }) {
  const dims = size === "lg" ? { w: 100, h: 140, fs: 44, cfs: 22 } : { w: 64, h: 90, fs: 28, cfs: 15 };
  if (!card) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--mist)]"
        style={{ width: dims.w, height: dims.h }}
      >
        <span className="text-2xl opacity-20">🃏</span>
      </div>
    );
  }
  const fruit = cardFruit(card);
  const count = cardCount(card);
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--mist)] bg-[var(--paper)] shadow-md"
      style={{ width: dims.w, height: dims.h }}
    >
      <span style={{ fontSize: dims.fs, lineHeight: 1 }}>{FRUIT_EMOJI[fruit] ?? "❓"}</span>
      <b style={{ fontSize: dims.cfs }} className="text-[var(--ink)]">
        x{count}
      </b>
    </div>
  );
}

export function HalliGalliBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY_VIEW);
  const [error, setError] = useState("");
  const [ringing, setRinging] = useState(false);
  const [myFlipPulse, setMyFlipPulse] = useState(0);
  const [oppFlipPulse, setOppFlipPulse] = useState(0);
  const [ringFx, setRingFx] = useState<"none" | "correct" | "wrong">("none");
  const [ringFxPulse, setRingFxPulse] = useState(0);
  const [errorShake, setErrorShake] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      // room.state can briefly be an incompletely-hydrated object during a dev-server
      // Fast Refresh or a reconnect race, so guard on the fields we're about to read.
      if (!state || !state.players || !state.decks || !state.faceUp) return;
      setView({
        ...state,
        players: Array.from(state.players),
        decks: Array.from(state.decks),
        faceUp: Array.from(state.faceUp),
      });
    };
    sync();
    const removeStateListener = room.onStateChange(sync);
    const removeRejectListener = room.onMessage("move-rejected", (p: { error: string }) => {
      setError(p.error);
      setErrorShake((n) => n + 1);
    });
    const removeGameOverListener = room.onMessage("game-over", () => clearReconnectionToken());
    return () => {
      removeStateListener.remove(sync);
      removeRejectListener();
      removeGameOverListener();
    };
  }, [room]);

  const myIndex = view.players.indexOf(guestId);
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId;

  const myTop = topOf(view.faceUp[myIndex] ?? "");
  const opponentTop = topOf(view.faceUp[opponentIndex] ?? "");
  const myDeckCount = countOf(view.decks[myIndex] ?? "");
  const opponentDeckCount = countOf(view.decks[opponentIndex] ?? "");

  // ── Game feel: detect actual state transitions (a card flipped, a ring
  // resolved correctly/incorrectly, someone won) and replay a CSS animation
  // + sound for each, instead of the board just snapping to the new state.
  const prevRef = useRef<{ myTop: string | null; oppTop: string | null; message: string; winnerId: string }>({
    myTop: null, oppTop: null, message: "", winnerId: "",
  });

  useEffect(() => {
    const prev = prevRef.current;
    if (myTop !== prev.myTop) {
      setMyFlipPulse((n) => n + 1);
      playFlipSound();
    }
    if (opponentTop !== prev.oppTop) {
      setOppFlipPulse((n) => n + 1);
    }
    if (view.message !== prev.message && prev.message !== "") {
      const wasShowingMatch = prev.myTop !== null && prev.oppTop !== null;
      if (wasShowingMatch && myTop === null && opponentTop === null && !view.winnerId) {
        setRingFx("correct");
        setRingFxPulse((n) => n + 1);
        playRingCorrectSound();
      } else if (view.message.includes("잘못 종")) {
        setRingFx("wrong");
        setRingFxPulse((n) => n + 1);
        playRingWrongSound();
      }
    }
    if (view.winnerId && view.winnerId !== prev.winnerId) {
      if (view.winnerId === guestId) playWinSound();
      else playLoseSound();
    }
    prevRef.current = { myTop, oppTop: opponentTop, message: view.message, winnerId: view.winnerId };
  }, [myTop, opponentTop, view.message, view.winnerId, guestId]);

  function handleFlip() {
    if (!myTurn) return;
    setError("");
    room.send("move", { action: "flip" });
  }

  function handleRing() {
    setError("");
    setRinging(true);
    window.setTimeout(() => setRinging(false), 150);
    playRingSound();
    room.send("move", { action: "ring" });
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4">
      <div className="w-full rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 text-center shadow-sm">
        <p
          key={view.winnerId || "playing"}
          className="m-0 text-sm font-medium text-[var(--ink)]"
          style={{ animation: view.winnerId ? "winBounce 500ms ease-out" : undefined }}
        >
          {view.winnerId
            ? view.winnerId === guestId
              ? "🎉 카드를 모두 모아 승리했습니다!"
              : "💀 상대가 카드를 모두 모았어요."
            : view.message}
        </p>
      </div>

      <div className="flex w-full items-center justify-between px-2" style={{ perspective: 700 }}>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[var(--ink-mute)]">상대방 · {opponentDeckCount}장</span>
          <div key={`opp-flip-${oppFlipPulse}`} style={{ animation: "flipReveal 300ms ease-out" }}>
            <FruitCard card={opponentTop} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[var(--ink-mute)]">나 · {myDeckCount}장</span>
          <div key={`my-flip-${myFlipPulse}`} style={{ animation: "flipReveal 300ms ease-out" }}>
            <FruitCard card={myTop} />
          </div>
        </div>
      </div>

      {error && (
        <p
          key={`error-${errorShake}`}
          className="m-0 text-center text-xs text-[var(--danger)]"
          style={{ animation: errorShake ? "shake 320ms" : undefined }}
        >
          {error}
        </p>
      )}

      <div
        key={`ring-fx-${ringFxPulse}`}
        className="rounded-full"
        style={{
          animation:
            ringFx === "correct" ? "ringSuccess 500ms ease-out" : ringFx === "wrong" ? "shake 350ms" : undefined,
        }}
      >
        <button
          onClick={handleRing}
          disabled={waiting || !!view.winnerId}
          className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold text-white shadow-xl transition-transform active:scale-90 disabled:opacity-40 ${
            ringing ? "scale-90 bg-red-700" : "bg-red-600"
          }`}
        >
          🔔
        </button>
      </div>
      <p className="m-0 -mt-2 text-xs text-[var(--ink-mute)]">같은 과일이 5개면 종을 치세요! (언제든 가능)</p>

      {waiting && (
        <div className="w-full rounded-xl bg-[var(--cream-deep)] p-3 text-center text-sm text-[var(--ink-mute)]">
          상대방을 기다리는 중이에요…
        </div>
      )}

      {!waiting && !view.winnerId && (
        <button
          onClick={handleFlip}
          disabled={!myTurn}
          className="w-full rounded-xl bg-[var(--sage)] px-4 py-3 font-bold text-white shadow active:scale-[.98] disabled:opacity-40"
        >
          {myTurn ? "🔄 카드 뒤집기" : "상대방의 차례입니다…"}
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-2 text-[10px] text-[var(--ink-mute)]">
        {Object.entries(FRUIT_LABEL).map(([code, label]) => (
          <span key={code} className="rounded-full border border-[var(--mist)] px-2 py-0.5">
            {FRUIT_EMOJI[code]} {label}
          </span>
        ))}
      </div>
    </div>
  );
}
