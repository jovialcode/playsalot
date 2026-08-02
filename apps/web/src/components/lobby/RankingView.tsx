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
  const podium = rankingData.slice(0, 3);
  const remainingRanks = rankingData.slice(3);
  const podiumOrder = [podium[1], podium[0], podium[2]];
  const podiumStyle = {
    1: {
      accent: "#D7A83F",
      surface: "linear-gradient(145deg, #FFF7DB 0%, #F3DE9A 100%)",
      height: "h-[146px]",
      medal: "1",
      label: "CHAMPION",
    },
    2: {
      accent: "#71808A",
      surface: "linear-gradient(145deg, #F1F4F2 0%, #D6DFDC 100%)",
      height: "h-[122px]",
      medal: "2",
      label: "SECOND",
    },
    3: {
      accent: "#A86B42",
      surface: "linear-gradient(145deg, #F9E8D8 0%, #EBC99F 100%)",
      height: "h-[108px]",
      medal: "3",
      label: "THIRD",
    },
  } as const;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">리더보드</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">랭킹</div>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] p-[16px_20px_20px]">
        <section className="stagger-in overflow-hidden rounded-[22px] border border-[var(--mist)] bg-[var(--paper)] p-[18px_12px_12px] shadow-[var(--shadow-2)]" aria-label="상위 3명">
          <div className="mb-[14px] flex items-center justify-between px-[6px]">
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] text-[var(--coral)]">WEEKLY HIGHLIGHTS</div>
              <div className="mt-[2px] text-[16px] font-bold tracking-[-0.02em] text-[var(--ink)]">이번 주의 챔피언</div>
            </div>
            <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H5a2 2 0 1 0 0 4h2M17 6h2a2 2 0 1 1 0 4h-2" />
            </svg>
          </div>
          <div className="flex items-end justify-center gap-[6px]">
            {podiumOrder.map((p, i) => {
              const style = podiumStyle[p.rank as 1 | 2 | 3];
              return (
                <div key={p.name} className={`flex min-w-0 flex-1 flex-col items-center ${p.rank === 1 ? "-translate-y-[6px]" : ""}`} style={{ animationDelay: `${i * 75}ms` }}>
                  <div className="relative mb-[7px] flex flex-col items-center">
                    {p.rank === 1 && <span className="absolute -top-[19px] text-[19px] leading-none" aria-label="왕관">♛</span>}
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full border-[3px] bg-[var(--sage)] text-[16px] text-[var(--cream)] shadow-sm font-[var(--font-display)]" style={{ borderColor: style.accent }}>{p.name[0]}</div>
                  </div>
                  <div className="max-w-full truncate text-[13px] font-bold text-[var(--ink)]">{p.name}</div>
                  <div className="mb-[7px] text-[10px] font-semibold tabular-nums text-[var(--ink-soft)]">{p.score.toLocaleString()} P</div>
                  <div className={`relative flex w-full flex-col items-center justify-center rounded-t-[12px] ${style.height}`} style={{ background: style.surface, color: style.accent }}>
                    <div className="mb-[2px] text-[9px] font-bold tracking-[0.12em] opacity-75">{style.label}</div>
                    <div className="font-[var(--font-display)] text-[30px] font-bold leading-none">{style.medal}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <div className="mb-[2px] mt-[8px] px-[2px] text-[11px] font-semibold tracking-[0.08em] text-[var(--ink-mute)]">전체 순위</div>
        {remainingRanks.map((p, i) => (
          <div
            key={p.name}
            style={{ background: p.isMe ? "var(--sage-tint)" : "var(--paper)", animationDelay: `${(i + 3) * 45}ms` }}
            className="stagger-in flex items-center gap-[12px] rounded-[12px] border border-[var(--mist)] p-[12px_14px] transition-transform duration-150 active:scale-[.98]"
          >
            <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[var(--ink-mute)]">{p.rank}</div>
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] font-[var(--font-display)] text-[13px]">{p.name[0]}</div>
            <div className="flex-1 min-w-0 text-[14px] font-medium text-[var(--ink)]">{p.name}</div>
            <div className="text-[14px] font-bold text-[var(--ink)]">{p.score.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
