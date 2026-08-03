"use client";

import { useEffect, useState } from "react";
import type { Friend, GuestSession } from "@playsalot/shared-types";
import { friendRequest, isMember } from "@/lib/session";
import { LoginRequired } from "./LoginRequired";

interface FriendsViewProps {
  session: GuestSession | null;
  onShowToast: (message: string) => void;
  onGoLogin: () => void;
}

function Avatar({ name }: { name: string }) {
  return <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] font-[var(--font-display)] text-[15px] text-[var(--cream)]">{name[0]}</div>;
}

export function FriendsView({ session, onShowToast, onGoLogin }: FriendsViewProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCode, setFriendCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const loggedIn = isMember(session);

  useEffect(() => {
    if (!session || !isMember(session)) return;
    Promise.all([
      friendRequest<Friend[]>(session, "/friends"),
      friendRequest<{ friendCode: string }>(session, "/friends/profile"),
    ]).then(([list, profile]) => { setFriends(list); setMyCode(profile.friendCode); })
      .catch((error: Error) => onShowToast(error.message))
      .finally(() => setLoading(false));
  }, [session, onShowToast]);

  async function addFriend() {
    if (!session || !friendCode.trim()) return;
    try {
      const friend = await friendRequest<Friend>(session, "/friends", { method: "POST", body: JSON.stringify({ friendCode }) });
      setFriends((current) => [...current, friend]);
      setFriendCode(""); setIsAdding(false);
      onShowToast(`${friend.displayName}님을 친구로 추가했어요.`);
    } catch (error) { onShowToast(error instanceof Error ? error.message : "친구 추가에 실패했어요."); }
  }

  async function removeFriend(friend: Friend) {
    if (!session || !confirm(`${friend.displayName}님을 친구 목록에서 삭제할까요?`)) return;
    try {
      await friendRequest<void>(session, `/friends/${friend.guestId}`, { method: "DELETE" });
      setFriends((current) => current.filter((item) => item.guestId !== friend.guestId));
      onShowToast(`${friend.displayName}님을 삭제했어요.`);
    } catch (error) { onShowToast(error instanceof Error ? error.message : "친구 삭제에 실패했어요."); }
  }

  if (!loggedIn) {
    return <LoginRequired feature="친구" title="친구" eyebrow="라운지" onGoLogin={onGoLogin} />;
  }

  return <div className="flex flex-col">
    <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
      <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
        <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">라운지</div>
        <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">친구</div>
      </div>
    </div>
    <div className="flex flex-col gap-[20px] p-[18px_20px_32px]">
      <section className="rounded-[14px] border border-[var(--mist)] bg-[var(--paper)] p-[14px] shadow-sm">
        <div className="text-[13px] font-bold text-[var(--ink)]">내 친구 코드</div>
        <div className="mt-[5px] flex items-center justify-between gap-3"><code className="text-[18px] font-bold tracking-[.12em] text-[var(--sage)]">{myCode || "불러오는 중"}</code><button onClick={() => navigator.clipboard.writeText(myCode).then(() => onShowToast("친구 코드를 복사했어요."))} disabled={!myCode} className="rounded-full border border-[var(--mist)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--ink-soft)] disabled:opacity-40">복사</button></div>
      </section>
      <section className="rounded-[14px] border border-[var(--mist)] bg-[var(--paper)] p-[14px] shadow-sm">
        <div className="flex items-center justify-between"><div className="text-[13px] font-bold text-[var(--ink)]">친구 추가</div><button onClick={() => setIsAdding((open) => !open)} className="text-[13px] font-semibold text-[var(--sage)]">{isAdding ? "닫기" : "+ 코드 입력"}</button></div>
        {isAdding && <div className="mt-[12px] flex gap-2"><input autoFocus value={friendCode} onChange={(event) => setFriendCode(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && addFriend()} placeholder="친구 코드 8자리" maxLength={8} className="min-w-0 flex-1 rounded-[10px] border border-[var(--mist)] bg-[var(--cream)] px-3 py-2 text-[14px] uppercase outline-none focus:border-[var(--sage)]"/><button onClick={addFriend} disabled={!friendCode.trim()} className="rounded-[10px] bg-[var(--sage)] px-4 text-[13px] font-semibold text-[var(--cream)] disabled:opacity-40">추가</button></div>}
      </section>
      <section className="flex flex-col gap-[10px]"><div className="text-[13px] font-bold text-[var(--ink)]">내 친구 <span className="text-[var(--ink-mute)]">({friends.length})</span></div>{loading ? <div className="text-[13px] text-[var(--ink-mute)]">친구 목록을 불러오는 중이에요.</div> : friends.length === 0 ? <div className="rounded-[14px] border border-dashed border-[var(--mist)] p-6 text-center text-[13px] text-[var(--ink-mute)]">친구 코드를 입력해 첫 친구를 추가해 보세요.</div> : friends.map((friend) => <div key={friend.guestId} className="flex items-center gap-[12px] rounded-[14px] border border-[var(--mist)] bg-[var(--paper)] p-[10px_12px] shadow-sm"><Avatar name={friend.displayName}/><div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold text-[var(--ink)]">{friend.displayName}</div><div className="text-[12px] text-[var(--ink-mute)]">친구</div></div><button onClick={() => removeFriend(friend)} className="rounded-full border border-[var(--mist)] px-[12px] py-[7px] text-[12px] font-semibold text-[var(--ink-soft)]">삭제</button></div>)}</section>
    </div>
  </div>;
}
