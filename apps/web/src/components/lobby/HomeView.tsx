import type { DesignGame } from "@/types/game";
import { useMemo } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";

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
  const popularScroll = useDragScroll<HTMLDivElement>();
  const newScroll = useDragScroll<HTMLDivElement>();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 bg-[var(--cream)]/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-[10px] p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="flex flex-col gap-[2px]">
            <div className="text-[13px] font-medium text-[var(--ink-mute)]">보드게임 라운지</div>
            <div className="text-[32px] font-bold tracking-[-0.03em] text-[var(--ink)] font-[var(--font-display)]">오늘은 어떤 게임 할까요?</div>
          </div>
          <button onClick={onViewAllGames} className="inline-flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink-soft)] cursor-pointer shadow-sm transition-colors hover:bg-[var(--cream-deep)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[26px] p-[0_0_28px]">
        <div className="px-[20px]">
          <div className="rounded-[24px] border border-[var(--sage-deep)] bg-[var(--sage)] p-[28px_24px]">
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">지금 접속 현황</div>
            <div className="my-[20px] mb-[12px] flex items-baseline gap-[10px]">
              <span className="text-[42px] font-medium tracking-[-0.02em] text-[var(--cream)] font-[var(--font-display)]">{liveTotal}</span>
              <span className="text-[15px] text-[var(--sage-tint)]">명이 지금 플레이 중</span>
              <span className="mb-[6px] h-[8px] w-[8px] rounded-full bg-[var(--coral)]" />
            </div>
            <div className="m-0 mb-[24px] text-[15px] leading-[1.5] text-[var(--sage-tint)] opacity-90">랜덤 상대와 바로 대전하거나, 원하는 게임을 골라보세요.</div>
            <button onClick={() => onQuickMatch("omok")} className="group inline-flex items-center gap-[10px] rounded-[12px] border-none bg-[var(--paper)] p-[12px_22px] text-[15px] font-semibold text-[var(--sage)] cursor-pointer font-[var(--font-body)] transition-transform duration-150 active:scale-[.95]">
              빠른 매칭 시작
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-[3px]"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div className="px-[20px]">
          <div className="flex items-center gap-[12px] rounded-[16px] border border-[var(--mist)] bg-[var(--paper)] p-[16px_20px] text-[15px] text-[var(--ink-soft)] shadow-sm">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--ink-faint)]" />
            <span className="flex-1">서연님이 할리갈리에서 승리했어요</span>
          </div>
        </div>

        <div>
          <div className="mb-[12px] flex items-baseline justify-between px-[22px]">
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">인기 보드게임</h3>
            <button onClick={onViewAllGames} className="flex items-center gap-[4px] cursor-pointer border-none bg-none text-[14px] font-medium text-[var(--ink-soft)] font-[var(--font-body)]">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div
            ref={popularScroll.ref}
            onPointerDown={popularScroll.onPointerDown}
            onPointerMove={popularScroll.onPointerMove}
            onPointerUp={popularScroll.onPointerUp}
            onPointerLeave={popularScroll.onPointerLeave}
            onClickCapture={popularScroll.onClickCapture}
            className="flex touch-pan-x gap-[14px] overflow-x-auto p-[4px_20px_12px] cursor-grab active:cursor-grabbing no-scrollbar"
          >
            {games.slice(0, 3).map((game, i) => (
              <div key={game.id} onClick={() => onGameSelect(game.id)} style={{ animationDelay: `${i * 60}ms` }} className="stagger-in flex w-[164px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] shadow-sm transition-transform active:scale-[0.98]">
                <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center p-[12px]" style={{ background: game.tint }}>
                  <div className="absolute inset-0 m-[8px] rounded-[12px] border-2 border-dashed border-black/10" />
                  <div className="z-10 flex flex-col items-center gap-[8px] text-center opacity-60">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <div className="px-2 text-[12px] font-medium leading-tight text-[var(--ink)]">
                      {game.name} 이미지<br/>
                      <span className="text-[10px] opacity-70 underline">or browse files</span>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute left-[10px] top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--coral)] text-[12px] font-bold text-white shadow-sm">{i + 1}</div>
                </div>
                <div className="flex flex-col gap-[4px] p-[16px_16px_18px]">
                  <div className="text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
                  <div className="text-[13px] text-[var(--ink-mute)] font-medium">{game.activeNow.toLocaleString()}명 플레이 중</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-[12px] flex items-baseline justify-between px-[22px]">
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">신규 게임</h3>
            <button onClick={onViewAllGames} className="flex items-center gap-[4px] cursor-pointer border-none bg-none text-[14px] font-medium text-[var(--ink-soft)] font-[var(--font-body)]">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div
            ref={newScroll.ref}
            onPointerDown={newScroll.onPointerDown}
            onPointerMove={newScroll.onPointerMove}
            onPointerUp={newScroll.onPointerUp}
            onPointerLeave={newScroll.onPointerLeave}
            onClickCapture={newScroll.onClickCapture}
            className="flex touch-pan-x gap-[14px] overflow-x-auto p-[4px_20px_12px] cursor-grab active:cursor-grabbing no-scrollbar"
          >
            {games.filter(g => g.isNew).map((game, i) => (
              <div key={game.id} onClick={() => onGameSelect(game.id)} style={{ animationDelay: `${i * 60}ms` }} className="stagger-in flex w-[164px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] shadow-sm transition-transform active:scale-[0.98]">
                <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center p-[12px]" style={{ background: game.tint }}>
                  <div className="absolute inset-0 m-[8px] rounded-[12px] border-2 border-dashed border-black/10" />
                  <div className="z-10 flex flex-col items-center gap-[8px] text-center opacity-60">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <div className="px-2 text-[12px] font-medium leading-tight text-[var(--ink)]">
                      {game.name} 이미지<br/>
                      <span className="text-[10px] opacity-70 underline">or browse files</span>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                  <span className="absolute right-[10px] top-[10px] rounded-[6px] bg-[var(--coral-tint)] p-[3px_8px] text-[10px] font-bold text-[var(--coral-deep)] shadow-sm">신규</span>
                </div>
                <div className="flex flex-col gap-[4px] p-[16px_16px_18px]">
                  <div className="text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
                  <div className="text-[13px] text-[var(--ink-mute)] font-medium">{game.activeNow.toLocaleString()}명 플레이 중</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
