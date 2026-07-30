"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";
import {
  playCardSound,
  playDrawSound,
  playFlipSound,
  playInvalidSound,
  playLoseSound,
  playTurnStartSound,
  playWinSound,
} from "@/lib/sound";

// ── Card helpers ──────────────────────────────────────────────────────────────

function cardColor(code: string): string {
  return code === "w" || code === "wd" ? "w" : (code[0] ?? "r");
}

function cardLabel(code: string): string {
  if (code === "w") return "🌈";
  if (code === "wd") return "+4";
  const t = code.slice(1);
  if (t === "s") return "⊘";
  if (t === "r") return "↺";
  if (t === "d") return "+2";
  return t;
}

function canPlayCard(card: string, topCard: string, currentColor: string): boolean {
  if (card === "w" || card === "wd") return true;
  const cc = cardColor(card);
  if (cc === currentColor) return true;
  const cardType = card.slice(1);
  const topType = topCard === "w" || topCard === "wd" ? topCard : topCard.slice(1);
  return cardType === topType;
}

const CARD_BG: Record<string, string> = {
  r: "#ef4444", y: "#eab308", g: "#22c55e", b: "#3b82f6", w: "#1f2937",
};
const CARD_BORDER: Record<string, string> = {
  r: "#b91c1c", y: "#a16207", g: "#15803d", b: "#1d4ed8", w: "#374151",
};
const COLOR_LABEL: Record<string, string> = { r: "빨강", y: "노랑", g: "초록", b: "파랑" };
const COLOR_RING: Record<string, string> = {
  r: "ring-red-400", y: "ring-yellow-400", g: "ring-green-400", b: "ring-blue-400",
};

// ── Card component ────────────────────────────────────────────────────────────

interface CardProps {
  code: string;
  onClick?: () => void;
  selected?: boolean;
  playable?: boolean;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
}

function UnoCard({ code, onClick, selected, playable, size = "md", faceDown }: CardProps) {
  const color = faceDown ? "w" : cardColor(code);
  const label = faceDown ? "UNO" : cardLabel(code);
  const bg = CARD_BG[color] ?? "#6b7280";
  const border = CARD_BORDER[color] ?? "#4b5563";

  const dims: Record<string, { w: number; h: number; fs: number; corner: number }> = {
    sm: { w: 44, h: 62, fs: 14, corner: 8 },
    md: { w: 56, h: 80, fs: 18, corner: 10 },
    lg: { w: 88, h: 124, fs: 30, corner: 14 },
  };
  const { w, h, fs, corner } = dims[size]!;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        width: w, height: h,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 2,
        borderStyle: "solid",
        borderRadius: corner,
        transform: selected ? "translateY(-14px) scale(1.05)" : undefined,
        boxShadow: selected
          ? "0 8px 24px rgba(0,0,0,0.25)"
          : playable
            ? "0 2px 8px rgba(0,0,0,0.15)"
            : "0 1px 3px rgba(0,0,0,0.1)",
        opacity: onClick && !playable && !faceDown ? 0.45 : 1,
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        flexShrink: 0,
        transition: "transform 150ms, box-shadow 150ms",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Inner oval */}
      <div style={{
        position: "absolute",
        inset: 5,
        borderRadius: corner - 3,
        backgroundColor: "rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ fontSize: fs, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{label}</span>
      </div>
      {/* Corner labels */}
      {!faceDown && (
        <>
          <span style={{ position: "absolute", top: 3, left: 5, fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{label}</span>
          <span style={{ position: "absolute", bottom: 3, right: 5, fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 700, transform: "rotate(180deg)" }}>{label}</span>
        </>
      )}
      {/* Playable highlight ring */}
      {playable && !selected && (
        <div style={{
          position: "absolute",
          inset: -3,
          borderRadius: corner + 2,
          border: "2px solid rgba(255,255,255,0.7)",
          pointerEvents: "none",
        }} />
      )}
    </button>
  );
}

// ── Color picker ──────────────────────────────────────────────────────────────

function ColorPicker({ onChoose }: { onChoose: (c: string) => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl bg-white p-5 shadow-xl text-center">
        <p className="mb-3 text-sm font-bold text-gray-800">색을 선택하세요</p>
        <div className="grid grid-cols-2 gap-2">
          {(["r", "y", "g", "b"] as const).map((c) => (
            <button
              key={c}
              onClick={() => onChoose(c)}
              style={{ backgroundColor: CARD_BG[c] }}
              className="h-14 w-14 rounded-xl font-bold text-white text-sm shadow-md active:scale-95 transition-transform"
            >
              {COLOR_LABEL[c]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── State interface ───────────────────────────────────────────────────────────

interface View {
  players: string[];
  hands: string[];
  topCard: string;
  currentColor: string;
  turnIndex: number;
  direction: number;
  phase: string;
  message: string;
  winnerId: string;
}

const empty: View = {
  players: [], hands: [], topCard: "", currentColor: "r",
  turnIndex: 0, direction: 1, phase: "wait",
  message: "상대를 기다리는 중...", winnerId: "",
};

// ── Main board ────────────────────────────────────────────────────────────────

export function UnoBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(empty);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [discardPop, setDiscardPop] = useState(0);
  const [handPulse, setHandPulse] = useState(0);
  const [turnPulse, setTurnPulse] = useState(0);
  const [errorShake, setErrorShake] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      // room.state can briefly be an incompletely-hydrated object during a dev-server
      // Fast Refresh or a reconnect race, so guard on the fields we're about to read.
      if (!state || !state.players || !state.hands) return;
      setView({
        ...state,
        players: Array.from(state.players),
        hands: Array.from(state.hands),
      });
    };
    sync();
    const remove = room.onStateChange(sync);
    const reject = room.onMessage("move-rejected", (p: { error: string }) => {
      setError(p.error);
      setErrorShake((n) => n + 1);
      playInvalidSound();
    });
    const over = room.onMessage("game-over", () => clearReconnectionToken());
    return () => { remove.remove(sync); reject(); over(); };
  }, [room]);

  const myIndex = view.players.indexOf(guestId);
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId && view.phase !== "wait";
  const isChoosingColor = myTurn && view.phase === "choose-color";

  const myHand = myIndex >= 0 ? (view.hands[myIndex] ?? "").split(",").filter(Boolean) : [];
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const opponentHand = (view.hands[opponentIndex] ?? "").split(",").filter(Boolean);

  // ── Game feel: replay a CSS animation (via key bump) and a sound whenever
  // the underlying state actually transitions, not on every unrelated render.
  const prevRef = useRef({ topCard: "", myHandLen: 0, myTurn: false, winnerId: "" });

  useEffect(() => {
    const prev = prevRef.current;
    if (view.topCard && view.topCard !== prev.topCard && prev.topCard !== "") {
      setDiscardPop((n) => n + 1);
      playCardSound();
    }
    if (myHand.length > prev.myHandLen) {
      setHandPulse((n) => n + 1);
      playDrawSound();
    }
    if (myTurn && !prev.myTurn) {
      setTurnPulse((n) => n + 1);
      playTurnStartSound();
    }
    if (view.winnerId && view.winnerId !== prev.winnerId) {
      if (view.winnerId === guestId) playWinSound();
      else playLoseSound();
    }
    prevRef.current = { topCard: view.topCard, myHandLen: myHand.length, myTurn, winnerId: view.winnerId };
  }, [view.topCard, myHand.length, myTurn, view.winnerId, guestId]);

  const send = (msg: Record<string, unknown>) => { setError(""); room.send("move", msg); };

  function handleCardClick(card: string) {
    if (!myTurn || view.phase !== "play") return;
    if (selected === card) {
      // Confirm play
      send({ action: "play", card });
      setSelected(null);
    } else {
      setSelected(card);
      playFlipSound();
    }
  }

  function handleDraw() {
    if (!myTurn || view.phase !== "play") return;
    setSelected(null);
    send({ action: "draw" });
  }

  function handleChooseColor(color: string) {
    send({ action: "choose-color", color });
  }

  const colorRing = view.currentColor ? (COLOR_RING[view.currentColor] ?? "") : "";

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] flex-col gap-3 select-none">

      {/* Color picker overlay */}
      {isChoosingColor && <ColorPicker onChoose={handleChooseColor} />}

      {/* Status bar */}
      <div
        key={`status-${turnPulse}`}
        className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm"
        style={{ animation: turnPulse ? "turnGlow 900ms ease-out" : undefined }}
      >
        <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
          <span>나 <b className="text-[var(--ink)]">{myHand.length}장</b></span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
            view.direction === 1 ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
          }`}>
            {view.direction === 1 ? "→ 순서" : "← 역순"}
          </span>
          <span>상대 <b className="text-[var(--ink)]">{opponentHand.length}장</b></span>
        </div>
        <p
          key={view.winnerId || "playing"}
          className="mt-2 text-center text-sm font-medium text-[var(--ink)]"
          style={{ animation: view.winnerId ? "winBounce 500ms ease-out" : undefined }}
        >
          {view.winnerId
            ? (view.winnerId === guestId ? "🏆 승리했어요!" : "😔 상대방이 이겼어요.")
            : view.message}
        </p>
      </div>

      {/* Opponent hand (face-down cards) */}
      <div className="overflow-x-auto">
        <div className="flex w-full items-center justify-center" style={{ minWidth: "max-content" }}>
          {Array.from({ length: Math.min(opponentHand.length, 12) }).map((_, i) => (
            <div key={i} style={{ marginLeft: i > 0 ? -20 : 0 }}>
              <UnoCard code="back" size="sm" faceDown />
            </div>
          ))}
          {opponentHand.length > 12 && (
            <span className="ml-1 text-xs text-[var(--ink-mute)]">+{opponentHand.length - 12}</span>
          )}
        </div>
      </div>

      {/* Center: discard + draw pile */}
      <div className="flex items-center justify-center gap-6 py-2">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-1">
          <UnoCard code="back" size="lg" faceDown onClick={myTurn && view.phase === "play" ? handleDraw : undefined} />
          <span className="text-[10px] text-[var(--ink-mute)]">뽑기</span>
        </div>

        {/* Current color indicator */}
        <div className="flex flex-col items-center gap-2">
          {view.currentColor && (
            <div
              style={{ backgroundColor: CARD_BG[view.currentColor], width: 16, height: 16, borderRadius: 8 }}
              className="shadow-sm"
            />
          )}
          <span className="text-[10px] text-[var(--ink-mute)]">현재 색</span>
        </div>

        {/* Discard pile (top card) */}
        <div className="flex flex-col items-center gap-1">
          {view.topCard ? (
            <div
              key={`discard-${discardPop}`}
              className={`rounded-[16px] ring-4 ring-offset-2 ${colorRing}`}
              style={{ animation: discardPop ? "cardPop 260ms ease-out" : undefined }}
            >
              <UnoCard code={view.topCard} size="lg" />
            </div>
          ) : (
            <div className="flex h-[124px] w-[88px] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--mist)]">
              <span className="text-2xl opacity-30">🃏</span>
            </div>
          )}
          <span className="text-[10px] text-[var(--ink-mute)]">버린 카드</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          key={`error-${errorShake}`}
          className="text-center text-xs text-rose-600"
          style={{ animation: errorShake ? "shake 320ms" : undefined }}
        >
          {error}
        </p>
      )}

      {/* My hand */}
      <div>
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-xs font-medium text-[var(--ink-soft)]">내 카드</span>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-[var(--ink-mute)] underline"
            >
              취소
            </button>
          )}
        </div>
        <div className="overflow-x-auto pb-2">
          <div
            key={`hand-${handPulse}`}
            className="flex items-end gap-1.5 px-1"
            style={{ minWidth: "max-content", animation: handPulse ? "handPulse 200ms ease-out" : undefined }}
          >
            {myHand.map((card, i) => {
              const isPlayable = myTurn && view.phase === "play" && canPlayCard(card, view.topCard, view.currentColor);
              return (
                <UnoCard
                  key={`${card}-${i}`}
                  code={card}
                  size="md"
                  selected={selected === card}
                  playable={isPlayable}
                  onClick={myTurn && view.phase === "play" ? () => handleCardClick(card) : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Action hint */}
      {selected && (
        <div className="rounded-xl bg-[var(--sage-tint)] p-2.5 text-center text-sm font-medium text-[var(--sage-deep)]">
          한 번 더 탭하면 카드를 내요
        </div>
      )}
      {waiting && (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 border border-amber-200">
          상대방을 기다리는 중이에요…
        </div>
      )}
      {!waiting && !myTurn && !view.winnerId && view.phase !== "wait" && (
        <div className="rounded-xl bg-[var(--cream-deep)] p-2.5 text-center text-sm text-[var(--ink-soft)]">
          상대방의 차례입니다…
        </div>
      )}
    </div>
  );
}
