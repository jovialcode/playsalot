import type { GuestSession } from "@playsalot/shared-types";

interface MyPageViewProps {
  session: GuestSession | null;
}

export function MyPageView({ session }: MyPageViewProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">계정</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">마이페이지</div>
        </div>
      </div>
      <div className="flex flex-col gap-[22px] p-[18px_20px_32px]">
        <div className="flex items-center gap-[14px]">
          <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] font-[var(--font-display)] text-[20px] font-medium">
            {session?.displayName?.[0] || "게"}
          </div>
          <div>
            <div className="text-[19px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{session?.displayName || "게스트"}</div>
            <span className="chip mt-[6px] inline-flex">실버 티어</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[8px]">
          {[["24", "승리"], ["42", "플레이"], ["1,250", "포인트"]].map(([value, label], i) => (
            <div key={label} style={{ animationDelay: `${i * 60}ms` }} className="stagger-in card-interactive rounded-[12px] border border-[var(--mist)] bg-[var(--paper)] p-[14px_8px] text-center">
              <div className="text-[22px] font-medium text-[var(--ink)] font-[var(--font-display)]">{value}</div>
              <div className="mt-[4px] text-[11px] text-[var(--ink-mute)]">{label}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost text-[var(--danger)] justify-start px-0">로그아웃</button>
      </div>
    </div>
  );
}
