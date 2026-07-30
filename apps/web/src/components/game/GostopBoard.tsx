"use client";

import type { Room } from "colyseus.js";
import { useEffect, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

// ── Card helpers ──────────────────────────────────────────────────────────────

function getMonth(code: string): number {
  return parseInt(code.split("-")[0] ?? "0", 10);
}

function getType(code: string): string {
  return code.split("-")[1] ?? "";
}

const TYPE_LABEL: Record<string, string> = { b: "광", d: "띠", j: "쌍피", p: "피", p2: "피" };
const TYPE_COLOR: Record<string, string> = {
  b: "#fbbf24", d: "#3b82f6", j: "#9ca3af", p: "#9ca3af", p2: "#9ca3af",
};
const MONTH_EMOJI: Record<number, string> = {
  1:"🌸",2:"🎋",3:"🌸",4:"🌿",5:"🌾",6:"🦋",
  7:"🐗",8:"🌕",9:"🍁",10:"🦌",11:"🌧️",12:"🌊",
};

// ── Card component ────────────────────────────────────────────────────────────

function HwatuCard({
  code,
  onClick,
  selected,
  size = "md",
  faceDown,
}: {
  code: string;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md";
  faceDown?: boolean;
}) {
  const month = faceDown ? 0 : getMonth(code);
  const type = faceDown ? "" : getType(code);
  const label = TYPE_LABEL[type] ?? "";
  const typeColor = TYPE_COLOR[type] ?? "#6b7280";
  const emoji = MONTH_EMOJI[month] ?? "🎴";

  const w = size === "sm" ? 40 : 56;
  const h = size === "sm" ? 56 : 78;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        width: w, height: h,
        background: faceDown ? "#374151" : "#fffbeb",
        border: `2px solid ${selected ? "#f59e0b" : "#d1d5db"}`,
        borderRadius: 8,
        transform: selected ? "translateY(-12px)" : undefined,
        boxShadow: selected ? "0 6px 20px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.1)",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        flexShrink: 0,
        transition: "transform 150ms, box-shadow 150ms",
        position: "relative",
      }}
    >
      {faceDown ? (
        <span style={{ fontSize: 18, color: "#9ca3af" }}>🎴</span>
      ) : (
        <>
          <span style={{ fontSize: size === "sm" ? 16 : 22, lineHeight: 1 }}>{emoji}</span>
          <span style={{ fontSize: size === "sm" ? 8 : 10, color: "#6b7280", fontWeight: 600 }}>
            {month}월
          </span>
          <span style={{
            fontSize: size === "sm" ? 8 : 10,
            fontWeight: 800,
            color: typeColor,
            background: "rgba(0,0,0,0.05)",
            borderRadius: 4,
            padding: "1px 4px",
          }}>
            {label}
          </span>
        </>
      )}
    </button>
  );
}

// ── Score display ─────────────────────────────────────────────────────────────

function ScoreBadge({ captures, label }: { captures: string[]; label: string }) {
  const brights = captures.filter((c) => getType(c) === "b").length;
  const ribbons = captures.filter((c) => getType(c) === "d").length;
  const chaff = captures.reduce((n, c) => n + (getType(c) === "j" ? 2 : getType(c).startsWith("p") ? 1 : 0), 0);
  return (
    <div className="text-xs text-[var(--ink-soft)]">
      <span className="font-bold text-[var(--ink)]">{label}</span>
      <span className="ml-1">광{brights} · 띠{ribbons} · 피{chaff}</span>
    </div>
  );
}

// ── State interface ───────────────────────────────────────────────────────────

interface View {
  players: string[];
  hands: string[];
  captures: string[];
  field: string;
  deck: string;
  phase: string;
  turnIndex: number;
  scores: number[];
  goCount: number;
  message: string;
  winnerId: string;
}

const EMPTY: View = {
  players: [], hands: [], captures: [], field: "", deck: "",
  phase: "wait", turnIndex: 0, scores: [], goCount: 0,
  message: "상대를 기다리는 중...", winnerId: "",
};

function toPile(csv: string): string[] {
  return csv ? csv.split(",").filter(Boolean) : [];
}

// ── Main board ────────────────────────────────────────────────────────────────

export function GostopBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      if (!state || !state.players || !state.hands) return;
      setView({
        ...state,
        players: Array.from(state.players),
        hands: Array.from(state.hands),
        captures: Array.from(state.captures),
        scores: Array.from(state.scores),
      });
    };
    sync();
    const removeState = room.onStateChange(sync);
    const removeReject = room.onMessage("move-rejected", (p: { error: string }) => setError(p.error));
    const removeOver = room.onMessage("game-over", () => clearReconnectionToken());
    return () => { removeState.remove(sync); removeReject(); removeOver(); };
  }, [room]);

  const myIndex = view.players.indexOf(guestId);
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId;
  const isGoStop = view.phase === "go-stop" && myTurn;

  const myHand = myIndex >= 0 ? toPile(view.hands[myIndex] ?? "") : [];
  const myCaptures = myIndex >= 0 ? toPile(view.captures[myIndex] ?? "") : [];
  const opponentHand = toPile(view.hands[opponentIndex] ?? "");
  const opponentCaptures = toPile(view.captures[opponentIndex] ?? "");
  const fieldCards = toPile(view.field);
  const deckCount = toPile(view.deck).length;

  const send = (msg: Record<string, unknown>) => { setError(""); room.send("move", msg); };

  function handleCardClick(card: string) {
    if (!myTurn || view.phase !== "play") return;
    if (selected === card) {
      // Double tap = play the card
      send({ action: "play", card });
      setSelected(null);
    } else {
      setSelected(card);
    }
  }

  function handleFieldClick(card: string) {
    if (!selected || !myTurn || view.phase !== "play") return;
    // Play selected hand card, choosing this field card as match
    send({ action: "play", card: selected, matchCard: card });
    setSelected(null);
  }

  const myScore = view.scores[myIndex] ?? 0;
  const oppScore = view.scores[opponentIndex] ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-3 select-none">

      {/* Status */}
      <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm text-center">
        <p className="text-sm font-medium text-[var(--ink)]">
          {view.winnerId
            ? (view.winnerId === guestId ? "🏆 승리했어요!" : "😔 상대방이 이겼어요.")
            : view.message}
        </p>
        <div className="mt-1.5 flex justify-center gap-6 text-xs">
          <span className="text-[var(--ink-soft)]">나 <b className="text-[var(--ink)]">{myScore}점</b></span>
          {view.goCount > 0 && (
            <span className="font-bold text-amber-600">고 ×{view.goCount} (배율 ×{Math.pow(2, view.goCount)})</span>
          )}
          <span className="text-[var(--ink-soft)]">상대 <b className="text-[var(--ink)]">{oppScore}점</b></span>
        </div>
      </div>

      {error && <p className="text-center text-xs text-rose-600">{error}</p>}

      {/* Opponent hand (face-down) */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-[-4px]">
          {Array.from({ length: Math.min(opponentHand.length, 8) }).map((_, i) => (
            <div key={i} style={{ marginLeft: i > 0 ? -16 : 0 }}>
              <HwatuCard code="back" size="sm" faceDown />
            </div>
          ))}
        </div>
        <ScoreBadge captures={opponentCaptures} label="상대" />
      </div>

      {/* Field */}
      <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-2 shadow-sm">
        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--ink-mute)]">
          <span>🃏 덱 {deckCount}장</span>
          <span className="font-bold text-[var(--ink-soft)]">필드</span>
          <span>{selected ? "← 탭해서 맞출 카드 선택" : ""}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center min-h-[90px] items-center">
          {fieldCards.length === 0 ? (
            <span className="text-xs text-[var(--ink-mute)] opacity-40">비어있어요</span>
          ) : fieldCards.map((card, i) => (
            <HwatuCard
              key={`field-${card}-${i}`}
              code={card}
              onClick={selected ? () => handleFieldClick(card) : undefined}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Go/Stop decision */}
      {isGoStop && (
        <div className="flex gap-2">
          <button
            onClick={() => send({ action: "go" })}
            className="flex-1 rounded-xl bg-[var(--coral)] py-3 font-black text-white shadow active:scale-95"
          >
            고! (계속)
          </button>
          <button
            onClick={() => send({ action: "stop" })}
            className="flex-1 rounded-xl bg-[var(--sage)] py-3 font-black text-white shadow active:scale-95"
          >
            스톱 (승리)
          </button>
        </div>
      )}

      {/* My hand */}
      <div>
        <div className="mb-1 flex items-center justify-between px-1">
          <ScoreBadge captures={myCaptures} label="나" />
          {selected && (
            <button onClick={() => setSelected(null)} className="text-xs text-[var(--ink-mute)] underline">
              취소
            </button>
          )}
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 px-1" style={{ minWidth: "max-content" }}>
            {myHand.map((card, i) => (
              <HwatuCard
                key={`hand-${card}-${i}`}
                code={card}
                selected={selected === card}
                onClick={myTurn && view.phase === "play" ? () => handleCardClick(card) : undefined}
                size="md"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hint */}
      {selected && (
        <div className="rounded-xl bg-[var(--sage-tint)] p-2.5 text-center text-sm text-[var(--sage-deep)]">
          필드의 같은 달 카드를 탭해서 가져가거나, 한 번 더 탭하면 그냥 내요
        </div>
      )}

      {waiting && (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 border border-amber-200">
          상대방을 기다리는 중이에요…
        </div>
      )}

      {!waiting && !myTurn && !view.winnerId && view.phase === "play" && (
        <div className="rounded-xl bg-[var(--cream-deep)] p-2.5 text-center text-sm text-[var(--ink-soft)]">
          상대방의 차례입니다…
        </div>
      )}

      {/* Rules legend */}
      <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-2.5 text-[10px] text-[var(--ink-mute)]">
        <p className="font-bold mb-1">득점 기준</p>
        <p>광 3장=3점 · 4장=4점 · 5장=15점</p>
        <p>띠 5+장 → (장수-4)점 · 고도리(2·4·8월띠)=5점</p>
        <p>피 10+장 → (장수-9)점 · 쌍피=피2장</p>
        <p>고 선언 시 최종 점수 2배</p>
      </div>
    </div>
  );
}
