"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";
import {
  playBuildSound,
  playCashGainSound,
  playCashLossSound,
  playDiceLandSound,
  playDiceRollSound,
  playLoseSound,
  playPurchaseSound,
  playStepSound,
  playTurnStartSound,
  playWinSound,
} from "@/lib/sound";

const SPACES = [
  "출발", "서울", "부산", "황금", "제주", "도쿄", "휴식", "파리", "런던", "황금",
  "뉴욕", "시드니", "무인도", "로마", "베를린", "황금", "홍콩", "싱가포르", "여행", "두바이",
];

const COSTS = [0, 180, 150, 0, 220, 250, 0, 280, 300, 0, 330, 260, 0, 290, 310, 0, 340, 360, 0, 270];

const POSITIONS = [
  // Tile centers sit inside the board by half a tile on every edge. The previous
  // 2% left/top centers clipped the outer tiles and made the board look right-heavy.
  [92, 92], [75.2, 92], [58.4, 92], [41.6, 92], [24.8, 92], [8, 92],
  [8, 75.2], [8, 58.4], [8, 41.6], [8, 24.8], [8, 8],
  [24.8, 8], [41.6, 8], [58.4, 8], [75.2, 8], [92, 8],
  [92, 24.8], [92, 41.6], [92, 58.4], [92, 75.2],
];

const BOARD_SIZE = SPACES.length;
/** Diffed positions further apart than this are treated as a teleport (e.g. the world-trip
 * tile snapping a player back to GO) and snap instantly instead of walking tile-by-tile. */
const MAX_WALK_STEPS = 12;

/** Mirrors packages/games/burumable/src/definition.ts so the info card can show accurate numbers. */
const rentAt = (space: number, level: number) => Math.round(COSTS[space]! * (0.3 + level * 0.25));
const buildCostOf = (space: number) => Math.round(COSTS[space]! * 0.45);

const EVENT_INFO: Record<number, string> = {
  0: "이 칸을 지나거나 도착하면 보너스 ₩200을 받아요.",
  6: "휴식 공간이에요. 도착하면 한 턴을 쉬어가요.",
  12: "무인도에 도착하면 탈출 비용 ₩100을 내야 해요. (보유금이 부족하면 파산)",
  18: "세계여행 칸! 도착하면 출발점으로 이동하고 보너스 ₩200을 받아요.",
};
const isGoldenKey = (space: number) => space === 3 || space === 9 || space === 15;

interface View {
  players: string[];
  positions: number[];
  cash: number[];
  owners: number[];
  levels: number[];
  bankrupt: number[];
  turnIndex: number;
  phase: string;
  lastRoll: number;
  message: string;
  winnerId: string;
}

const EMPTY_VIEW: View = {
  players: [],
  positions: [],
  cash: [],
  owners: Array(20).fill(-1),
  levels: Array(20).fill(0),
  bankrupt: [],
  turnIndex: 0,
  phase: "roll",
  lastRoll: 0,
  message: "상대를 기다리는 중...",
  winnerId: "",
};

function toView(state: unknown): View {
  const s = state as View;
  return {
    ...s,
    players: Array.from(s.players),
    positions: Array.from(s.positions),
    cash: Array.from(s.cash),
    owners: Array.from(s.owners),
    levels: Array.from(s.levels),
    bankrupt: Array.from(s.bankrupt),
  };
}

function DiceDots({ count, pulse }: { count: number; pulse: number }) {
  if (count <= 1) return null;
  return (
    <div
      key={pulse}
      className="mt-3 flex gap-1"
      style={{ animation: pulse ? "dicePop 260ms ease-out" : undefined }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-amber-700" />
      ))}
    </div>
  );
}

function CenterLogo({ diceCount, dicePulse }: { diceCount: number; dicePulse: number }) {
  return (
    <div className="absolute left-[18%] top-[18%] flex h-[64%] w-[64%] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-[#fff7df]/85 p-3 text-center max-[380px]:rounded-xl max-[380px]:p-1.5">
      <span className="text-3xl max-[380px]:text-2xl">🏝️</span>
      <b className="mt-1 font-serif text-xl text-[#704123] max-[380px]:text-base">WORLD TRIP</b>
      <span className="mt-1 text-xs text-amber-800 max-[380px]:text-[10px] max-[360px]:leading-tight">
        땅을 사고, 도시를 키워
        <br />
        마지막까지 살아남으세요
      </span>
      <DiceDots count={diceCount} pulse={dicePulse} />
    </div>
  );
}

function BoardTile({
  index,
  myIndex,
  view,
  visualPositions,
  hopPulses,
  onSelect,
}: {
  index: number;
  myIndex: number;
  view: View;
  visualPositions: number[];
  hopPulses: number[];
  onSelect: (index: number) => void;
}) {
  const [left, top] = POSITIONS[index];
  const owner = view.owners[index];
  const level = view.levels[index];
  const visitors = visualPositions
    .map((at, player) => (at === index ? player : -1))
    .filter((player) => player >= 0);

  return (
    <button
      type="button"
      aria-label={`${SPACES[index]} 칸 정보 보기`}
      onClick={() => onSelect(index)}
      className="absolute flex h-[16%] w-[16%] cursor-pointer flex-col justify-between rounded-md border border-[#8b5a32] bg-[#fff5d5] p-1 text-left shadow-sm transition-transform active:scale-95 max-[380px]:p-0.5"
      style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="truncate text-[9px] font-bold leading-tight text-[#5c351f] max-[380px]:text-[8px]">{SPACES[index]}</div>
      <div className="text-[8px] text-[#946235] max-[360px]:hidden">{COSTS[index] ? `₩${COSTS[index]}` : "EVENT"}</div>
      {owner >= 0 && (
        <>
          <div className={`h-1 rounded ${owner === myIndex ? "bg-emerald-500" : "bg-rose-500"}`} />
          {/* Mounts fresh only the instant ownership is assigned, so the flash plays once. */}
          <div
            key={`owned-${owner}`}
            className="pointer-events-none absolute inset-0 rounded-md"
            style={{ animation: "tileFlashBuy 700ms ease-out" }}
          />
        </>
      )}
      {level > 0 && (
        <div
          key={`level-${level}`}
          className="text-[9px] leading-none max-[380px]:text-[8px]"
          style={{ animation: "housePop 300ms ease-out" }}
        >
          {Array(level).fill("🏠").join("")}
        </div>
      )}
      <div className="absolute -bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-0.5 max-[380px]:-bottom-1.5">
        {visitors.map((player) => (
          <span
            key={`${player}-${hopPulses[player] ?? 0}`}
            className={`flex h-4 w-4 items-center justify-center rounded-full border border-white text-[8px] max-[380px]:h-3.5 max-[380px]:w-3.5 max-[380px]:text-[7px] ${
              player === myIndex ? "bg-emerald-500" : "bg-rose-500"
            }`}
            style={{ animation: "tokenHop 260ms ease-out" }}
          >
            {player === myIndex ? "나" : "상"}
          </span>
        ))}
      </div>
    </button>
  );
}

function PropertyCard({
  index,
  view,
  myIndex,
  onClose,
}: {
  index: number;
  view: View;
  myIndex: number;
  onClose: () => void;
}) {
  const name = SPACES[index]!;
  const price = COSTS[index]!;
  const owner = view.owners[index];
  const level = view.levels[index];
  const isProperty = price > 0;
  const ownerLabel = owner === -1 || owner === undefined ? "없음" : owner === myIndex ? "나" : "상대";

  return (
    <div
      className="fixed inset-0 z-40 flex animate-[fadeIn_200ms_ease-out] items-end justify-center bg-[rgba(27,31,28,0.5)]"
      onClick={onClose}
    >
      <div
        className="max-h-[min(82dvh,620px)] w-full max-w-[420px] overflow-y-auto animate-[sheetUp_220ms_ease-out] rounded-t-[24px] bg-[var(--paper)] p-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-[var(--shadow-3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 font-serif text-xl text-[#5c351f]">{name}</h3>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)]"
          >
            ✕
          </button>
        </div>

        {isProperty ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">매입가</span>
              <b className="text-[var(--ink)]">₩{price.toLocaleString()}</b>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">소유자</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  owner === -1 || owner === undefined
                    ? "bg-stone-100 text-stone-500"
                    : owner === myIndex
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                }`}
              >
                {ownerLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">건설 단계</span>
              <b className="text-[var(--ink)]">{level > 0 ? Array(level).fill("🏠").join("") : "미건설"}</b>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">다음 건설비</span>
              <b className="text-[var(--ink)]">{level >= 4 ? "최대 단계" : `₩${buildCostOf(index).toLocaleString()}`}</b>
            </div>
            <div className="rounded-xl border border-[var(--mist)] p-3">
              <p className="m-0 mb-2 text-xs font-bold text-[var(--ink-soft)]">단계별 통행료</p>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                {[0, 1, 2, 3, 4].map((lv) => (
                  <div
                    key={lv}
                    className={`rounded-lg py-1.5 ${
                      lv === level ? "bg-[var(--sage-tint)] font-bold text-[var(--sage-deep)]" : "text-[var(--ink-mute)]"
                    }`}
                  >
                    <div className="text-[10px]">{lv === 0 ? "기본" : `${lv}단계`}</div>
                    <div>₩{rentAt(index, lv).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {isGoldenKey(index) ? "황금열쇠" : "이벤트 칸"}
            </span>
            <p className="m-0 text-sm text-[var(--ink-soft)]">
              {EVENT_INFO[index] ?? (isGoldenKey(index) ? "도착하면 보너스 ₩120을 받아요." : "특별한 효과가 있는 칸이에요.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type CashFx = { delta: number; pulseId: number } | null;

function CashFloat({ fx, align }: { fx: CashFx; align: "left" | "right" }) {
  if (!fx) return null;
  return (
    <span
      key={fx.pulseId}
      className={`pointer-events-none absolute -top-4 text-xs font-bold ${align === "left" ? "left-0" : "right-0"} ${
        fx.delta > 0 ? "text-emerald-600" : "text-rose-600"
      }`}
      style={{ animation: "cashFloat 700ms ease-out forwards" }}
    >
      {fx.delta > 0 ? "+" : ""}₩{fx.delta.toLocaleString()}
    </span>
  );
}

function StatusHeader({
  view,
  myIndex,
  guestId,
  turnPulse,
  myCashFx,
  oppCashFx,
}: {
  view: View;
  myIndex: number;
  guestId: string;
  turnPulse: number;
  myCashFx: CashFx;
  oppCashFx: CashFx;
}) {
  const opponentIndex = myIndex === 0 ? 1 : 0;
  return (
    <div
      key={`status-${turnPulse}`}
      className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm max-[380px]:p-3"
      style={{ animation: turnPulse ? "turnGlow 900ms ease-out" : undefined }}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-sm max-[380px]:gap-1 max-[380px]:text-xs">
        <div className="relative min-w-0">
          <b className="text-amber-900">나</b>
          <span className="ml-1 whitespace-nowrap text-amber-700 sm:ml-2">₩{(view.cash[myIndex] ?? 0).toLocaleString()}</span>
          <CashFloat fx={myCashFx} align="left" />
        </div>
        <div className="rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-700 sm:px-3">
          {view.lastRoll ? `🎲 ${view.lastRoll}` : "🎲 준비"}
        </div>
        <div className="relative min-w-0 text-right">
          <b className="text-orange-900">상대</b>
          <span className="ml-1 whitespace-nowrap text-orange-700 sm:ml-2">
            ₩{(view.cash[opponentIndex] ?? 0).toLocaleString()}
          </span>
          <CashFloat fx={oppCashFx} align="right" />
        </div>
      </div>
      <p
        key={view.winnerId || "playing"}
        className="mb-0 mt-3 text-center text-sm font-medium leading-snug text-amber-900 max-[380px]:mt-2 max-[380px]:text-xs"
        style={{ animation: view.winnerId ? "winBounce 500ms ease-out" : undefined }}
      >
        {view.winnerId
          ? view.winnerId === guestId
            ? "🏆 승리했습니다!"
            : "게임이 끝났습니다."
          : view.message}
      </p>
    </div>
  );
}

function ActionBar({
  view,
  waiting,
  myTurn,
  canBuy,
  canBuild,
  rollShakePulse,
  onAction,
}: {
  view: View;
  waiting: boolean;
  myTurn: boolean;
  canBuy: boolean;
  canBuild: boolean;
  rollShakePulse: number;
  onAction: (action: "roll" | "buy" | "pass" | "build") => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 max-[380px]:gap-1.5">
      {myTurn && view.phase === "roll" && (
        <button
          key={rollShakePulse}
          onClick={() => onAction("roll")}
          className="col-span-3 min-h-12 rounded-xl bg-[#704123] px-4 py-3 font-bold text-white shadow active:scale-[.98]"
          style={{ animation: rollShakePulse ? "diceShake 400ms ease-out" : undefined }}
        >
          🎲 주사위 굴리기
        </button>
      )}
      {canBuy && (
        <button
          onClick={() => onAction("buy")}
          className="min-h-12 rounded-xl bg-emerald-600 px-2 py-3 text-sm font-bold text-white max-[380px]:text-xs"
        >
          ₩ 매입
        </button>
      )}
      {canBuild && (
        <button
          onClick={() => onAction("build")}
          className="min-h-12 rounded-xl bg-blue-600 px-2 py-3 text-sm font-bold text-white max-[380px]:text-xs"
        >
          🏠 건설
        </button>
      )}
      {myTurn && view.phase === "buy" && (
        <button
          onClick={() => onAction("pass")}
          className="min-h-12 rounded-xl border border-amber-300 bg-white px-2 py-3 text-sm font-bold text-amber-900 max-[380px]:text-xs"
        >
          넘기기
        </button>
      )}
      {waiting && (
        <div className="col-span-3 rounded-xl bg-amber-100 p-3 text-center text-sm text-amber-800">
          상대방을 기다리는 중이에요…
        </div>
      )}
      {!waiting && !myTurn && !view.winnerId && (
        <div className="col-span-3 rounded-xl bg-stone-100 p-3 text-center text-sm text-stone-600">
          상대방의 차례입니다…
        </div>
      )}
    </div>
  );
}

export function BurumableBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY_VIEW);
  const [error, setError] = useState("");
  const [errorShake, setErrorShake] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [visualPositions, setVisualPositions] = useState<number[]>([]);
  const [hopPulses, setHopPulses] = useState<number[]>([]);
  const [rollShakePulse, setRollShakePulse] = useState(0);
  const [dicePopPulse, setDicePopPulse] = useState(0);
  const [turnPulse, setTurnPulse] = useState(0);
  const [myCashFx, setMyCashFx] = useState<CashFx>(null);
  const [oppCashFx, setOppCashFx] = useState<CashFx>(null);

  useEffect(() => {
    const sync = () => {
      const state = room.state as unknown as View | null;
      // room.state can briefly be an incompletely-hydrated object during a dev-server
      // Fast Refresh or a reconnect race, so guard on the fields we're about to read.
      if (!state || !state.players || !state.positions) return;
      setView(toView(state));
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

  const currentSpace = view.positions[myIndex] ?? 0;
  const canBuy = myTurn && view.phase === "buy" && view.owners[currentSpace] === -1 && COSTS[currentSpace] > 0;
  const canBuild = myTurn && view.phase === "buy" && view.owners[currentSpace] === myIndex;

  const diceCount = useMemo(() => view.lastRoll || 1, [view.lastRoll]);

  // ── Game feel: walk each player's token tile-by-tile toward its new
  // position instead of snapping, so the board no longer teleports pieces.
  const prevPositionsRef = useRef<number[]>([]);
  const stepTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (view.positions.length === 0) return;
    const prevPositions = prevPositionsRef.current;

    if (prevPositions.length === 0) {
      setVisualPositions([...view.positions]);
      setHopPulses(view.positions.map(() => 0));
    } else {
      view.positions.forEach((newPos, playerIdx) => {
        const oldPos = prevPositions[playerIdx];
        if (oldPos === undefined || oldPos === newPos) return;
        const steps = (newPos - oldPos + BOARD_SIZE) % BOARD_SIZE;
        if (steps === 0) return;

        if (steps > MAX_WALK_STEPS) {
          // Teleport (e.g. the world-trip tile sending a player back to GO): snap instantly.
          setVisualPositions((vp) => { const next = [...vp]; next[playerIdx] = newPos; return next; });
          setHopPulses((hp) => { const next = [...hp]; next[playerIdx] = (next[playerIdx] ?? 0) + 1; return next; });
          return;
        }

        for (let step = 1; step <= steps; step += 1) {
          const tile = (oldPos + step) % BOARD_SIZE;
          const timerId = window.setTimeout(() => {
            setVisualPositions((vp) => { const next = [...vp]; next[playerIdx] = tile; return next; });
            setHopPulses((hp) => { const next = [...hp]; next[playerIdx] = (next[playerIdx] ?? 0) + 1; return next; });
            playStepSound();
            if (step === steps) playDiceLandSound();
          }, step * 140);
          stepTimersRef.current.push(timerId);
        }
      });
    }
    prevPositionsRef.current = [...view.positions];
  }, [view.positions]);

  useEffect(() => () => { stepTimersRef.current.forEach(clearTimeout); }, []);

  // ── Game feel: detect purchase/build/cash/turn/win transitions and play
  // the matching sound (the tile-level visuals self-trigger via key changes).
  const prevGameRef = useRef<{ owners: number[]; levels: number[]; cash: number[]; myTurn: boolean; winnerId: string }>({
    owners: [], levels: [], cash: [], myTurn: false, winnerId: "",
  });
  const cashPulseRef = useRef(0);

  useEffect(() => {
    const prev = prevGameRef.current;
    if (prev.owners.length > 0) {
      view.owners.forEach((owner, i) => {
        if (prev.owners[i] === -1 && owner >= 0) playPurchaseSound();
      });
      view.levels.forEach((level, i) => {
        if ((prev.levels[i] ?? 0) < level) playBuildSound();
      });
      if (myIndex >= 0) {
        const delta = (view.cash[myIndex] ?? 0) - (prev.cash[myIndex] ?? 0);
        if (delta !== 0) {
          cashPulseRef.current += 1;
          setMyCashFx({ delta, pulseId: cashPulseRef.current });
          if (delta > 0) playCashGainSound();
          else playCashLossSound();
        }
      }
      if (opponentIndex >= 0 && opponentIndex < view.cash.length) {
        const delta = (view.cash[opponentIndex] ?? 0) - (prev.cash[opponentIndex] ?? 0);
        if (delta !== 0) {
          cashPulseRef.current += 1;
          setOppCashFx({ delta, pulseId: cashPulseRef.current });
        }
      }
    }
    if (myTurn && !prev.myTurn) {
      setTurnPulse((n) => n + 1);
      playTurnStartSound();
    }
    if (view.winnerId && view.winnerId !== prev.winnerId) {
      if (view.winnerId === guestId) playWinSound();
      else playLoseSound();
    }
    prevGameRef.current = { owners: [...view.owners], levels: [...view.levels], cash: [...view.cash], myTurn, winnerId: view.winnerId };
  }, [view.owners, view.levels, view.cash, myTurn, view.winnerId, myIndex, opponentIndex, guestId]);

  // Dice pips only re-render with a fresh value when the server actually
  // sets lastRoll (property landings); other tiles resolve and reset it
  // before we ever observe it, so this is a best-effort visual pop.
  const prevLastRollRef = useRef(0);
  useEffect(() => {
    if (view.lastRoll && view.lastRoll !== prevLastRollRef.current) {
      setDicePopPulse((n) => n + 1);
    }
    prevLastRollRef.current = view.lastRoll;
  }, [view.lastRoll]);

  const send = (action: "roll" | "buy" | "pass" | "build") => {
    setError("");
    if (action === "roll") {
      setRollShakePulse((n) => n + 1);
      playDiceRollSound();
    }
    room.send("move", { action });
  };

  return (
    <div className="mx-auto flex w-full max-w-[660px] flex-col gap-4 max-[380px]:gap-3">
      <StatusHeader
        view={view}
        myIndex={myIndex}
        guestId={guestId}
        turnPulse={turnPulse}
        myCashFx={myCashFx}
        oppCashFx={oppCashFx}
      />

      <div
        className="relative aspect-square w-full touch-manipulation rounded-[28px] border-[10px] border-[#6e4227] bg-[#f7d88b] p-1 shadow-xl max-[380px]:rounded-[20px] max-[380px]:border-[6px]"
        style={{ backgroundImage: "radial-gradient(#fff1ba 1px, transparent 1px)", backgroundSize: "12px 12px" }}
      >
        <CenterLogo diceCount={diceCount} dicePulse={dicePopPulse} />
        {SPACES.map((_, index) => (
          <BoardTile
            key={index}
            index={index}
            myIndex={myIndex}
            view={view}
            visualPositions={visualPositions}
            hopPulses={hopPulses}
            onSelect={setSelectedTile}
          />
        ))}
      </div>

      {selectedTile !== null && (
        <PropertyCard
          index={selectedTile}
          view={view}
          myIndex={myIndex}
          onClose={() => setSelectedTile(null)}
        />
      )}

      {error && (
        <p
          key={`error-${errorShake}`}
          className="m-0 text-center text-xs text-rose-600"
          style={{ animation: errorShake ? "shake 320ms" : undefined }}
        >
          {error}
        </p>
      )}

      <ActionBar
        view={view}
        waiting={waiting}
        myTurn={myTurn}
        canBuy={canBuy}
        canBuild={canBuild}
        rollShakePulse={rollShakePulse}
        onAction={send}
      />
    </div>
  );
}
