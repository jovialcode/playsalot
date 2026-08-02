"use client";

interface MissionsViewProps {
  onShowToast: (message: string) => void;
}

// Mock progression data — a real quest system would be server-driven later.
const STREAK_DAYS = [
  { label: "월", state: "done" },
  { label: "화", state: "done" },
  { label: "수", state: "done" },
  { label: "목", state: "today" },
  { label: "금", state: "future" },
  { label: "토", state: "future" },
  { label: "일", state: "future" },
] as const;

const MISSIONS = [
  { title: "아무 게임 1판 하기", reward: 50, done: true },
  { title: "봇을 이기기", reward: 80, done: false },
  { title: "친구와 대전하기", reward: 100, done: false },
  { title: "서로 다른 게임 3개 플레이", reward: 120, done: false },
];

export function MissionsView({ onShowToast }: MissionsViewProps) {
  const earned = MISSIONS.filter((m) => m.done).reduce((s, m) => s + m.reward, 0);
  const total = MISSIONS.reduce((s, m) => s + m.reward, 0);
  const pct = Math.round((earned / total) * 100);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">라운지</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">도전</div>
        </div>
      </div>

      <div className="flex flex-col gap-[22px] p-[18px_20px_32px]">
        {/* Streak card */}
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--sage-deep)] bg-[var(--sage)] p-[22px_20px]">
          <span aria-hidden className="pointer-events-none absolute -right-[24px] -top-[24px] h-[110px] w-[110px] rounded-full bg-[var(--sage-deep)] opacity-30 animate-[floatSlow_8s_ease-in-out_infinite]" />
          <div className="relative z-10">
            <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--sage-tint)]">연속 접속</div>
            <div className="mt-[6px] text-[26px] font-bold text-[var(--cream)] font-[var(--font-display)]">🔥 3일 연속!</div>
            <div className="mt-[16px] flex justify-between gap-[6px]">
              {STREAK_DAYS.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-[6px]">
                  <div
                    className="flex aspect-square w-full items-center justify-center rounded-[10px] text-[13px] font-bold"
                    style={{
                      background: d.state === "done" ? "var(--cream)" : d.state === "today" ? "var(--coral)" : "rgba(255,255,255,0.16)",
                      color: d.state === "done" ? "var(--sage-deep)" : d.state === "today" ? "var(--cream)" : "var(--sage-tint)",
                    }}
                  >
                    {d.state === "done" ? "✓" : d.state === "today" ? "!" : ""}
                  </div>
                  <span className="text-[10px] text-[var(--sage-tint)]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's missions */}
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-baseline justify-between">
            <h3 className="m-0 text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)]">오늘의 미션</h3>
            <span className="text-[12px] font-medium text-[var(--ink-mute)]">{earned} / {total} P</span>
          </div>
          {MISSIONS.map((m, i) => (
            <div
              key={m.title}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`stagger-in flex items-center gap-[12px] rounded-[14px] border p-[12px_14px] transition-transform active:scale-[.98] ${
                m.done ? "border-[var(--sage-soft)] bg-[var(--sage-tint)]" : "border-[var(--mist)] bg-[var(--paper)] shadow-sm"
              }`}
            >
              <div
                className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  background: m.done ? "var(--sage)" : "transparent",
                  borderColor: m.done ? "var(--sage)" : "var(--mist)",
                  color: "var(--cream)",
                }}
              >
                {m.done && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                )}
              </div>
              <div className={`flex-1 text-[14px] font-medium ${m.done ? "text-[var(--ink-soft)] line-through" : "text-[var(--ink)]"}`}>{m.title}</div>
              <div className="flex-shrink-0 text-[13px] font-bold" style={{ color: m.done ? "var(--sage-deep)" : "var(--coral-deep)" }}>+{m.reward}</div>
            </div>
          ))}
        </div>

        {/* Reward box */}
        <div className="flex flex-col gap-[12px] rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[18px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-[var(--ink)]">🎁 보상 상자</span>
            <span className="text-[12px] font-medium text-[var(--ink-mute)]">{pct}%</span>
          </div>
          <div className="h-[10px] w-full overflow-hidden rounded-full bg-[var(--cream-deep)]">
            <div className="h-full rounded-full bg-[var(--sage)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <button
            onClick={() =>
              onShowToast(pct >= 100 ? "보상 상자를 열었어요! 🎉" : "미션을 모두 완료하면 상자를 열 수 있어요")
            }
            className="mt-[2px] rounded-[12px] py-[12px] text-[14px] font-semibold text-[var(--cream)] transition-transform active:scale-[.97]"
            style={{ background: pct >= 100 ? "var(--sage)" : "var(--ink-faint)" }}
          >
            {pct >= 100 ? "보상 받기" : "상자 열기"}
          </button>
        </div>
      </div>
    </div>
  );
}
