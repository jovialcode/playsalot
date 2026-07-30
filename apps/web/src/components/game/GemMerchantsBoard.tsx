"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useState } from "react";
import { clearReconnectionToken } from "@/lib/reconnect";

const COLORS = ["r", "b", "g", "w"] as const;
const COLOR: Record<string, { label: string; dot: string; text: string }> = {
  r: { label: "루비", dot: "bg-rose-500", text: "text-rose-700" }, b: { label: "사파이어", dot: "bg-sky-500", text: "text-sky-700" },
  g: { label: "에메랄드", dot: "bg-emerald-500", text: "text-emerald-700" }, w: { label: "진주", dot: "bg-stone-100 border border-stone-300", text: "text-stone-600" },
};
type View = { players: string[]; gems: string[]; bonuses: string[]; scores: number[]; market: string[]; bank: string; turnIndex: number; message: string; winnerId: string };
const EMPTY: View = { players: [], gems: [], bonuses: [], scores: [], market: [], bank: "4,4,4,4", turnIndex: 0, message: "상대를 기다리는 중이에요.", winnerId: "" };
const CARD: Record<string, { name: string; bonus: string; points: number; cost: number[] }> = {
  c0:{name:"광산",bonus:"r",points:1,cost:[0,2,1,1]},c1:{name:"항구",bonus:"b",points:1,cost:[2,0,1,1]},c2:{name:"정원",bonus:"g",points:1,cost:[1,1,0,2]},c3:{name:"성소",bonus:"w",points:1,cost:[1,2,1,0]},
  c4:{name:"루비 궁전",bonus:"r",points:2,cost:[0,3,2,2]},c5:{name:"푸른 시장",bonus:"b",points:2,cost:[3,0,2,2]},c6:{name:"비취 탑",bonus:"g",points:2,cost:[2,2,0,3]},c7:{name:"백은 길드",bonus:"w",points:2,cost:[2,3,2,0]},
  c8:{name:"왕실 금고",bonus:"r",points:3,cost:[0,4,3,3]},c9:{name:"별빛 항로",bonus:"b",points:3,cost:[4,0,3,3]},c10:{name:"숲의 계약",bonus:"g",points:3,cost:[3,3,0,4]},c11:{name:"달빛 저택",bonus:"w",points:3,cost:[3,4,3,0]},
};
const values = (csv: string) => csv.split(",").map(Number);

export function GemMerchantsBoard({ room, guestId }: { room: Room; guestId: string }) {
  const [view, setView] = useState<View>(EMPTY); const [chosen, setChosen] = useState<string[]>([]); const [error, setError] = useState("");
  useEffect(() => { const sync = () => { const s = room.state as unknown as View | null; if (s?.players && s.gems) setView({ ...s, players:Array.from(s.players), gems:Array.from(s.gems), bonuses:Array.from(s.bonuses), scores:Array.from(s.scores), market:Array.from(s.market) }); }; sync(); const state = room.onStateChange(sync); const reject = room.onMessage("move-rejected", (p:{error:string}) => setError(p.error)); const over = room.onMessage("game-over", () => clearReconnectionToken()); return () => { state.remove(sync); reject(); over(); }; }, [room]);
  const myIndex = view.players.indexOf(guestId); const waiting = view.players.length < 2; const myTurn = !waiting && view.turnIndex === myIndex && !view.winnerId;
  const gems = values(view.gems[myIndex] ?? "0,0,0,0"); const bonus = values(view.bonuses[myIndex] ?? "0,0,0,0"); const bank = values(view.bank); const opponent = myIndex === 0 ? 1 : 0;
  const canBuy = (id:string) => { const card = CARD[id]; return !!card && card.cost.every((cost, i) => cost <= gems[i]! + bonus[i]!); };
  const take = (color:string) => { if (!myTurn || bank[COLORS.indexOf(color as typeof COLORS[number])]! <= 0) return; setChosen((items) => items.includes(color) ? items.filter((item) => item !== color) : items.length < 2 ? [...items, color] : items); };
  const send = (move: unknown) => { setError(""); room.send("move", move); };
  const status = useMemo(() => view.winnerId ? view.winnerId === guestId ? "🏆 왕실의 최고 상인이 되었습니다!" : "상대가 왕실의 선택을 받았습니다." : view.message, [view, guestId]);
  return <div className="mx-auto flex h-full min-h-0 w-full max-w-[420px] flex-col justify-between gap-2 select-none">
    <section className="shrink-0 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-3 py-2 text-center"><p className="m-0 text-sm font-semibold text-amber-950">{status}</p><div className="mt-1 flex justify-center gap-5 text-xs text-amber-800"><span>나 ★ {view.scores[myIndex] ?? 0}/12</span><span>상대 ★ {view.scores[opponent] ?? 0}/12</span></div></section>
    <section className="shrink-0"><p className="mb-1 text-[11px] font-bold tracking-wider text-[var(--ink-mute)]">왕실 시장</p><div className="grid grid-cols-4 gap-1.5">{view.market.map((id) => { const card=CARD[id]; if (!card) return null; return <button type="button" key={id} disabled={!myTurn || !canBuy(id)} onClick={() => send({action:"buy",cardId:id})} className="min-h-[104px] rounded-xl border border-amber-200 bg-[#fffdf5] p-1.5 text-left shadow-sm disabled:opacity-55 active:scale-[.98]"><div className="flex items-start justify-between"><span className={`h-3 w-3 rounded-full ${COLOR[card.bonus]!.dot}`} /><b className="text-sm text-amber-800">★{card.points}</b></div><b className="mt-2 block text-[11px] leading-tight text-[var(--ink)]">{card.name}</b><div className="mt-2 flex flex-wrap gap-0.5">{card.cost.map((cost,i) => cost ? <span key={i} className={`text-[9px] font-bold ${COLOR[COLORS[i]!]!.text}`}>{cost}</span> : null)}</div></button>;})}</div></section>
    <section className="shrink-0 rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-2"><div className="mb-1 flex items-center justify-between text-xs"><b className="text-[var(--ink)]">내 보석 · 할인</b><span className="text-[var(--ink-mute)]">서로 다른 보석 최대 2개</span></div><div className="grid grid-cols-4 gap-2">{COLORS.map((color,i) => <button type="button" key={color} disabled={!myTurn || bank[i]===0} onClick={() => take(color)} className={`flex h-11 items-center justify-center gap-1 rounded-xl border text-xs font-bold active:scale-95 disabled:opacity-40 ${chosen.includes(color) ? "border-amber-500 bg-amber-100" : "border-[var(--mist)] bg-white"}`}><span className={`h-3 w-3 rounded-full ${COLOR[color].dot}`}/>{gems[i]} <small className={COLOR[color].text}>+{bonus[i]}</small></button>)}</div></section>
    {error && <p className="m-0 text-center text-xs text-rose-600">{error}</p>}
    {!waiting && !view.winnerId && <button type="button" disabled={!myTurn || chosen.length===0} onClick={() => { send({action:"take",colors:chosen}); setChosen([]); }} className="w-full shrink-0 rounded-xl bg-[#704123] py-3 text-base font-bold text-white shadow disabled:opacity-40">{myTurn ? chosen.length ? `${chosen.length}개 보석 가져오기` : "보석을 선택하세요" : "상대방의 차례…"}</button>}
  </div>;
}
