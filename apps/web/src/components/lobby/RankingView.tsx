export function RankingView() {
  const rankingData = [
    { name: "도윤", score: 9840, rank: 1 },
    { name: "서연", score: 9512, rank: 2 },
    { name: "하은", score: 9188, rank: 3 },
    { name: "지호", score: 8890, rank: 4 },
    { name: "수아", score: 8600, rank: 5 },
    { name: "예준", score: 8055, rank: 6 },
    { name: "나", score: 1250, rank: 24, isMe: true },
  ];

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">리더보드</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">랭킹</div>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] p-[16px_20px_20px]">
        {rankingData.map((p, i) => (
          <div
            key={p.name}
            style={{ background: p.isMe ? "var(--sage-tint)" : "var(--paper)", animationDelay: `${i * 45}ms` }}
            className="stagger-in flex items-center gap-[12px] rounded-[12px] border border-[var(--mist)] p-[12px_14px] transition-transform duration-150 active:scale-[.98]"
          >
            <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: p.rank === 1 ? "var(--coral)" : p.rank === 2 ? "var(--sage-tint)" : p.rank === 3 ? "var(--warn-tint)" : "transparent", color: p.rank === 1 ? "var(--cream)" : p.rank === 2 ? "var(--sage-deep)" : p.rank === 3 ? "#6E4A1A" : "var(--ink-mute)" }}>{p.rank}</div>
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] font-[var(--font-display)] text-[13px]">{p.name[0]}</div>
            <div className="flex-1 min-w-0 text-[14px] font-medium text-[var(--ink)]">{p.name}</div>
            <div className="text-[14px] font-bold text-[var(--ink)]">{p.score.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
