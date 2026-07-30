"use client";

import type { Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

// ── Card helpers ──────────────────────────────────────────────────────────────

const RANKS = ["3","4","5","6","7","8","9","10","J","Q","K","A","2"] as const;
const SUIT_EMOJI: Record<string, string> = { s:"♠", h:"♥", d:"♦", c:"♣" };
const RED_SUITS = new Set(["h","d"]);

function cardRank(code: string): string { return code.split("-")[0] ?? ""; }
function cardSuit(code: string): string { return code.split("-")[1] ?? ""; }
function rankValue(code: string): number { return RANKS.indexOf(cardRank(code) as (typeof RANKS)[number]); }

function sortCards(cards: string[]): string[] {
  return [...cards].sort((a, b) => {
    const rv = rankValue(a) - rankValue(b);
    return rv !== 0 ? rv : cardSuit(a).localeCompare(cardSuit(b));
  });
}

// ── Card component ────────────────────────────────────────────────────────────

function PlayingCard({
  code,
  selected,
  onClick,
  size = "md",
  faceDown,
}: {
  code: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  faceDown?: boolean;
}) {
  const suit = faceDown ? "" : cardSuit(code);
  const rank = faceDown ? "" : cardRank(code);
  const isRed = RED_SUITS.has(suit);
  const w = size === "sm" ? 38 : 52;
  const h = size === "sm" ? 54 : 72;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        width: w,
        height: h,
        background: faceDown ? "#1e40af" : "#ffffff",
        border: `2px solid ${selected ? "#f59e0b" : faceDown ? "#1e3a8a" : "#d1d5db"}`,
        borderRadius: 8,
        transform: selected ? "translateY(-14px)" : undefined,
        boxShadow: selected
          ? "0 8px 24px rgba(245,158,11,0.4)"
          : "0 1px 3px rgba(0,0,0,0.12)",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        flexShrink: 0,
        transition: "transform 150ms, box-shadow 150ms",
        position: "relative",
      }}
    >
      {faceDown ? (
        <span style={{ fontSize: 18, color: "#93c5fd" }}>🂠</span>
      ) : (
        <>
          <span
            style={{
              fontSize: size === "sm" ? 13 : 18,
              fontWeight: 900,
              color: isRed ? "#dc2626" : "#111827",
              lineHeight: 1,
            }}
          >
            {rank}
          </span>
          <span
            style={{
              fontSize: size === "sm" ? 12 : 16,
              color: isRed ? "#dc2626" : "#111827",
              lineHeight: 1,
            }}
          >
            {SUIT_EMOJI[suit]}
          </span>
        </>
      )}
    </button>
  );
}

// ── Pile display ──────────────────────────────────────────────────────────────

function PileDisplay({ pile, pileCount }: { pile: string[]; pileCount: number }) {
  if (pile.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-[var(--mist)]">
        <span className="text-sm text-[var(--ink-mute)]">패를 내세요</span>
      </div>
    );
  }

  const topRank = cardRank(pile[pile.length - 1] ?? "");
  const isBomb = pile.length === 4;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1.5 justify-center">
        {pile.map((card, i) => (
          <PlayingCard key={`pile-${card}-${i}`} code={card} size="md" />
        ))}
      </div>
      <p className="text-xs text-[var(--ink-mute)]">
        {isBomb ? "💣 폭탄!" : `${topRank} · ${pileCount}장`}
      </p>
    </div>
  );
}

// ── State interface ───────────────────────────────────────────────────────────

interface View {
  players: string[];
  hands: string[];
  pile: string;
  pileCount: number;
  pileRank: number;
  pileBomb: boolean;
  turnIndex: number;
  lastPlayIndex: number;
  passFlags: number[];
  phase: string;
  message: string;
  winnerId: string;
}

const EMPTY: View = {
  players: [], hands: [], pile: "", pileCount: 0, pileRank: 0, pileBomb: false,
  turnIndex: 0, lastPlayIndex: 0, passFlags: [], phase: "wait",
  message: "상대를 기다리는 중...", winnerId: "",
};

function toPile(csv: string): string[] {
  return csv ? csv.split(",").filter(Boolean) : [];
}

// ── Main board ────────────────────────────────────────────────────────────────

export function PresidentBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [playPulse, setPlayPulse] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      if (!state || !state.players || !state.hands) return;
      setView({
        ...state,
        players: Array.from(state.players),
        hands: Array.from(state.hands),
        passFlags: Array.from(state.passFlags),
      });
    };
    sync();
    const removeState = room.onStateChange(sync);
    const removeReject = room.onMessage("move-rejected", (p: { error: string }) => setError(p.error));
    const removeOver = room.onMessage("game-over", () => clearReconnectionToken());
    return () => { removeState.remove(sync); removeReject(); removeOver(); };
  }, [room]);

  const prevPileRef = useRef("");
  useEffect(() => {
    if (view.pile !== prevPileRef.current) {
      setPlayPulse((n) => n + 1);
      setSelected(new Set());
      prevPileRef.current = view.pile;
    }
  }, [view.pile]);

  const myIndex = view.players.indexOf(guestId);
  const waiting = view.players.length < 2;
  const myTurn = !waiting && myIndex === view.turnIndex && !view.winnerId && view.phase === "play";

  const myHand = sortCards(toPile(view.hands[myIndex] ?? ""));
  const pileCards = toPile(view.pile);

  const opponentIndexes = view.players
    .map((_, i) => i)
    .filter((i) => i !== myIndex);

  // Group my hand by rank for display
  const byRank: Record<string, string[]> = {};
  for (const card of myHand) {
    (byRank[cardRank(card)] ??= []).push(card);
  }

  const send = (msg: Record<string, unknown>) => { setError(""); room.send("move", msg); };

  function toggleCard(card: string) {
    if (!myTurn) return;
    const next = new Set(selected);
    if (next.has(card)) next.delete(card);
    else next.add(card);
    setSelected(next);
  }

  function handlePlay() {
    if (selected.size === 0) { setError("낼 카드를 선택하세요."); return; }
    send({ action: "play", cards: [...selected] });
  }

  function handlePass() {
    send({ action: "pass" });
  }

  // Bomb hint: all 4 of same rank
  const hasBomb = Object.values(byRank).some((g) => g.length === 4);

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-3 select-none">

      {/* Status */}
      <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm text-center">
        <p className="text-sm font-medium text-[var(--ink)]">
          {view.winnerId
            ? (view.winnerId === guestId ? "🏆 대통령! 승리했어요!" : "😔 상대방이 대통령이 됐어요.")
            : view.message}
        </p>
        {view.phase === "play" && (
          <div className="mt-1.5 flex justify-center gap-3 text-[10px] text-[var(--ink-mute)]">
            {view.players.map((_, i) => (
              <span
                key={i}
                className={`rounded-full px-2 py-0.5 border ${
                  i === view.turnIndex
                    ? "border-[var(--sage)] bg-[var(--sage-tint)] text-[var(--sage-deep)] font-bold"
                    : view.passFlags[i] ? "opacity-40 line-through border-[var(--mist)]" : "border-[var(--mist)]"
                }`}
              >
                P{i + 1}{i === myIndex ? " (나)" : ""}
                {view.passFlags[i] ? " 패스" : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-center text-xs text-rose-600 font-medium">{error}</p>}

      {/* Opponent hand previews */}
      {opponentIndexes.map((oppIdx) => {
        const oppHandCount = toPile(view.hands[oppIdx] ?? "").length;
        return (
          <div key={oppIdx} className="flex items-center gap-2 px-1">
            <span className="text-xs text-[var(--ink-mute)] w-12 shrink-0">P{oppIdx + 1}</span>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <div className="flex" style={{ gap: -10, minWidth: "max-content" }}>
                {Array.from({ length: Math.min(oppHandCount, 13) }).map((_, i) => (
                  <div key={i} style={{ marginLeft: i > 0 ? -16 : 0 }}>
                    <PlayingCard code="back" size="sm" faceDown />
                  </div>
                ))}
              </div>
            </div>
            <span className="shrink-0 text-xs text-[var(--ink-mute)]">{oppHandCount}장</span>
          </div>
        );
      })}

      {/* Current pile */}
      <div
        key={`pile-${playPulse}`}
        className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-3 shadow-sm"
        style={{ animation: playPulse > 1 ? "winBounce 300ms ease-out" : undefined }}
      >
        <PileDisplay pile={pileCards} pileCount={view.pileCount} />
      </div>

      {/* My hand */}
      <div>
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-xs text-[var(--ink-mute)]">내 패 ({myHand.length}장)</span>
          {selected.size > 0 && (
            <span className="text-xs text-amber-600 font-bold">{selected.size}장 선택됨</span>
          )}
          {hasBomb && (
            <span className="text-[10px] text-purple-600 font-bold">💣 폭탄 있음</span>
          )}
        </div>
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-1 px-1" style={{ minWidth: "max-content" }}>
            {myHand.map((card, i) => (
              <PlayingCard
                key={`hand-${card}-${i}`}
                code={card}
                selected={selected.has(card)}
                onClick={myTurn ? () => toggleCard(card) : undefined}
                size="md"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!waiting && !view.winnerId && (
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            disabled={!myTurn || selected.size === 0}
            className="flex-1 rounded-xl bg-[var(--coral)] py-3 font-black text-white shadow active:scale-95 disabled:opacity-40 transition-transform"
          >
            내기 ({selected.size > 0 ? `${selected.size}장` : "탭해서 선택"})
          </button>
          <button
            onClick={handlePass}
            disabled={!myTurn || view.pileCount === 0}
            className="rounded-xl bg-[var(--mist)] px-4 py-3 font-bold text-[var(--ink)] shadow active:scale-95 disabled:opacity-40 transition-transform"
          >
            패스
          </button>
        </div>
      )}

      {waiting && (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 border border-amber-200">
          상대방을 기다리는 중이에요…
        </div>
      )}

      {/* Rules */}
      <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-2.5 text-[10px] text-[var(--ink-mute)]">
        <p className="font-bold mb-1">기본 규칙</p>
        <p>카드 세기: 3 &lt; 4 &lt; … &lt; K &lt; A &lt; 2</p>
        <p>같은 숫자 카드만 함께 낼 수 있어요 (1장, 2장, 3장)</p>
        <p>💣 같은 숫자 4장 = 폭탄 (어떤 패도 이김)</p>
        <p>모두 패스하면 마지막에 낸 사람이 새 판 시작</p>
      </div>
    </div>
  );
}
