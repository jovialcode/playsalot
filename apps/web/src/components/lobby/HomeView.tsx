import type { DesignGame } from "@/types/game";
import { useMemo } from "react";

interface HomeViewProps {
  games: DesignGame[];
  onGameSelect: (gameId: string) => void;
  onQuickMatch: (gameId: string) => void;
  onViewAllGames: () => void;
}

export function HomeView({ games, onGameSelect, onQuickMatch, onViewAllGames }: HomeViewProps) {
  const liveTotal = useMemo(() => 
    games.reduce((sum, g) => sum + g.activeNow, 0).toLocaleString("ko-KR"),
  [games]);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="flex items-end justify-between gap-[10px] p-[20px_22px_14px]">
          <div>
            <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">보드게임 라운지</div>
            <div className="text-[26px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">오늘은 어떤 게임 할까요?</div>
          </div>
          <button onClick={onViewAllGames} className="inline-flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink-soft)] cursor-pointer">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[26px] p-[16px_0_28px]">
        <div className="px-[20px]">
          <div className="rounded-[16px] border border-[var(--sage-deep)] bg-[var(--sage)] p-[22px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-tint)]">지금 접속 현황</div>
            <div className="my-[10px] mb-[6px] flex items-baseline gap-[8px]">
              <span className="text-[34px] font-medium tracking-[-0.02em] text-[var(--cream)] font-[var(--font-display)]">{liveTotal}</span>
              <span className="text-[14px] text-[var(--sage-tint)]">명이 지금 플레이 중</span>
            </div>
            <p className="m-0 mb-[16px] text-[14px] leading-[1.45] text-[var(--sage-tint)]">랜덤 상대와 바로 대전하거나, 원하는 게임을 골라보세요.</p>
            <button onClick={() => onQuickMatch("omok")} className="inline-flex items-center gap-[8px] rounded-[10px] border-none bg-[var(--cream)] p-[11px_18px] text-[14px] font-medium text-[var(--sage)] cursor-pointer font-[var(--font-body)]">
              빠른 매칭 시작
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="mb-[10px] flex items-baseline justify-between px-[20px]">
            <h3 className="m-0 text-[19px]">인기 보드게임</h3>
            <button onClick={onViewAllGames} className="cursor-pointer border-none bg-none text-[13px] font-medium text-[var(--sage)] font-[var(--font-body)]">전체보기 →</button>
          </div>
          <div className="flex gap-[12px] overflow-x-auto p-[2px_20px_4px]">
            {games.slice(0, 3).map((game, i) => (
              <div key={game.id} onClick={() => onGameSelect(game.id)} className="card-paper flex w-[152px] flex-shrink-0 cursor-pointer flex-col gap-[10px] p-[14px] shadow-none">
                <div className="flex items-center gap-[8px]">
                  <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: i === 0 ? "var(--coral)" : "var(--cream-deep)", color: i === 0 ? "var(--cream)" : "var(--ink-soft)" }}>{i + 1}</div>
                  <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: game.tint, color: game.tintDeep }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/></svg>
                  </div>
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
                <div className="text-[11px] text-[var(--ink-mute)]">{game.activeNow.toLocaleString()}명 플레이 중</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-[10px] flex items-baseline justify-between px-[20px]">
            <h3 className="m-0 text-[19px]">신규 게임</h3>
            <button onClick={onViewAllGames} className="cursor-pointer border-none bg-none text-[13px] font-medium text-[var(--sage)] font-[var(--font-body)]">전체보기 →</button>
          </div>
          <div className="flex gap-[12px] overflow-x-auto p-[2px_20px_4px]">
            {games.filter(g => g.isNew).map((game) => (
              <div key={game.id} onClick={() => onGameSelect(game.id)} className="card-paper flex w-[152px] flex-shrink-0 cursor-pointer flex-col gap-[10px] p-[14px] shadow-none">
                <div className="flex items-center justify-between">
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px]" style={{ background: game.tint, color: game.tintDeep }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/></svg>
                  </div>
                  <span className="badge bg-[var(--coral-tint)] text-[var(--coral-deep)]">신규</span>
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold text-[var(--ink)]">{game.name}</div>
                <div className="text-[11px] text-[var(--ink-mute)]">{game.activeNow.toLocaleString()}명 플레이 중</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
