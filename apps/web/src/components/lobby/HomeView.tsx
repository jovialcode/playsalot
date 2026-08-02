import type { DesignGame } from "@/types/game";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameCard } from "./GameCard";

interface HomeViewProps {
  games: DesignGame[];
  onGameSelect: (gameId: string) => void;
  onQuickMatch: (gameId: string) => void;
  onViewRanking: () => void;
}

// Mock weekly leaderboard top 3 (mirrors RankingView's data) for the home mini-module.
const TOP_RANKS = [
  { name: "도윤", score: 9840 },
  { name: "서연", score: 9512 },
  { name: "하은", score: 9188 },
];

const TICKER_ITEMS = [
  "서연님이 할리갈리에서 승리했어요",
  "민수님이 오목 대국을 시작했어요",
  "도윤님이 우노에서 5연승 중이에요",
  "지호님이 만칼라에 입장했어요",
  "하은님이 배틀십에서 승리했어요",
];

export function HomeView({ games, onGameSelect, onQuickMatch, onViewRanking }: HomeViewProps) {
  const liveTotal = useMemo(() =>
    games.reduce((sum, g) => sum + g.activeNow, 0).toLocaleString("ko-KR"),
  [games]);

  // Featured spotlight rotates through the busiest playable games.
  const featuredPool = useMemo(() => {
    const playable = games.filter((g) => g.isPlayable);
    const pool = (playable.length > 0 ? playable : games).slice();
    return pool.sort((a, b) => b.activeNow - a.activeNow).slice(0, 5);
  }, [games]);

  const trending = useMemo(
    () => featuredPool.find((g) => g.isNew) ?? featuredPool[1] ?? featuredPool[0],
    [featuredPool],
  );

  const [featuredIdx, setFeaturedIdx] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const moveFeatured = (direction: 1 | -1) => {
    if (featuredPool.length <= 1) return;
    setFeaturedIdx((index) => (index + direction + featuredPool.length) % featuredPool.length);
  };

  useEffect(() => {
    if (featuredPool.length <= 1) return;
    const id = setInterval(() => setFeaturedIdx((i) => (i + 1) % featuredPool.length), 4200);
    return () => clearInterval(id);
  }, [featuredPool.length]);

  const featured = featuredPool[featuredIdx % Math.max(featuredPool.length, 1)] ?? featuredPool[0];

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 bg-[var(--cream)]/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-[10px] p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="flex flex-col gap-[2px]">
            <div className="text-[13px] font-medium text-[var(--ink-mute)]">보드게임 라운지</div>
            <div className="text-[32px] font-bold tracking-[-0.03em] text-[var(--ink)] font-[var(--font-display)]">오늘은 어떤 게임 할까요?</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[18px] p-[0_0_28px]">
        {/* Featured spotlight — large, auto-rotating recommended game. */}
        {featured && (
          <div className="px-[20px]">
            <div
              onClick={() => {
                if (didSwipe.current) {
                  didSwipe.current = false;
                  return;
                }
                onGameSelect(featured.id);
              }}
              onTouchStart={(event) => {
                swipeStartX.current = event.touches[0]?.clientX ?? null;
                didSwipe.current = false;
              }}
              onTouchEnd={(event) => {
                const startX = swipeStartX.current;
                const endX = event.changedTouches[0]?.clientX;
                swipeStartX.current = null;
                if (startX === null || endX === undefined) return;

                const distance = endX - startX;
                if (Math.abs(distance) < 42) return;
                didSwipe.current = true;
                moveFeatured(distance < 0 ? 1 : -1);
              }}
              className="relative min-h-[208px] cursor-pointer touch-pan-y overflow-hidden rounded-[24px] border border-black/5 p-[24px] shadow-sm transition-transform active:scale-[0.99]"
              style={{ background: featured.tint }}
            >
              {/* decorative floating shapes */}
              <span aria-hidden className="pointer-events-none absolute -right-[30px] -top-[30px] h-[140px] w-[140px] rounded-full opacity-30 animate-[floatSlow_7s_ease-in-out_infinite]" style={{ background: featured.tintDeep }} />
              <span aria-hidden className="pointer-events-none absolute -bottom-[40px] left-[30%] h-[90px] w-[90px] rounded-full opacity-20 animate-[floatSlow_9s_ease-in-out_infinite]" style={{ background: featured.tintDeep }} />

              <div key={featured.id} className="relative z-10 flex flex-col animate-[viewFadeIn_360ms_var(--ease)]">
                <div className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: featured.tintDeep }}>🎲 오늘의 추천</div>
                <div className="mt-[10px] text-[30px] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{featured.name}</div>
                <div className="mt-[6px] line-clamp-2 max-w-[86%] text-[14px] leading-[1.45] text-[var(--ink-soft)]">{featured.desc}</div>
                <div className="mt-[12px] flex items-center gap-[6px] text-[13px] font-medium text-[var(--ink-soft)]">
                  <span className="dot-live h-[7px] w-[7px] rounded-full bg-[var(--coral)]" />
                  {featured.activeNow.toLocaleString()}명 플레이 중
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); (featured.isPlayable ? onQuickMatch : onGameSelect)(featured.id); }}
                  className="group mt-[18px] inline-flex items-center gap-[8px] self-start rounded-[12px] px-[22px] py-[12px] text-[15px] font-semibold text-[var(--cream)] transition-transform duration-150 active:scale-[.95]"
                  style={{ background: featured.tintDeep }}
                >
                  ▶ 지금 하기
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-[3px]"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
              </div>

              {featuredPool.length > 1 && (
                <div className="absolute bottom-[18px] right-[22px] z-10 flex items-center gap-[9px]">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); moveFeatured(-1); }}
                    aria-label="이전 추천 게임"
                    className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--paper)]/65 text-[var(--ink-soft)] transition-transform active:scale-90"
                  >
                    <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <div className="flex gap-[6px]">
                  {featuredPool.map((g, i) => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={(e) => { e.stopPropagation(); setFeaturedIdx(i); }}
                      aria-label={`추천 ${i + 1}`}
                      className="h-[7px] rounded-full transition-all duration-300"
                      style={{ width: i === featuredIdx ? 18 : 7, background: i === featuredIdx ? featured.tintDeep : "rgba(0,0,0,0.18)" }}
                    />
                  ))}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); moveFeatured(1); }}
                    aria-label="다음 추천 게임"
                    className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--paper)]/65 text-[var(--ink-soft)] transition-transform active:scale-90"
                  >
                    <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live ticker strip — connection count + flowing activity feed. */}
        <div className="px-[20px]">
          <div className="flex items-center gap-[10px] overflow-hidden rounded-full border border-[var(--mist)] bg-[var(--paper)] px-[16px] py-[10px] shadow-sm">
            <span className="dot-live h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[var(--coral)]" />
            <span className="flex-shrink-0 text-[13px] font-bold text-[var(--ink)]">{liveTotal}명 접속</span>
            <span className="h-[12px] w-px flex-shrink-0 bg-[var(--mist)]" />
            <div className="relative flex-1 overflow-hidden">
              <div className="flex w-max gap-[32px] whitespace-nowrap text-[13px] text-[var(--ink-soft)] animate-[ticker_20s_linear_infinite]">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                  <span key={i} className="flex items-center gap-[6px]">
                    <span className="text-[var(--ink-faint)]">▸</span>{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two mini modules: weekly ranking + trending. */}
        <div className="grid grid-cols-2 gap-[12px] px-[20px]">
          <button
            onClick={onViewRanking}
            className="stagger-in flex flex-col gap-[10px] rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[16px] text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--ink)]">🏆 주간 랭킹</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </div>
            <div className="flex flex-col gap-[7px]">
              {TOP_RANKS.map((p, i) => (
                <div key={p.name} className="flex items-center gap-[8px]">
                  <span
                    className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: i === 0 ? "var(--coral)" : i === 1 ? "var(--sage-tint)" : "var(--warn-tint)",
                      color: i === 0 ? "var(--cream)" : i === 1 ? "var(--sage-deep)" : "#6E4A1A",
                    }}
                  >{i + 1}</span>
                  <span className="flex-1 truncate text-[12px] font-medium text-[var(--ink)]">{p.name}</span>
                  <span className="text-[11px] font-semibold text-[var(--ink-mute)] tabular-nums">{p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </button>

          {trending && (
            <button
              onClick={() => onGameSelect(trending.id)}
              className="stagger-in relative flex flex-col justify-between gap-[8px] overflow-hidden rounded-[20px] border border-black/5 p-[16px] text-left shadow-sm transition-transform active:scale-[0.98]"
              style={{ background: trending.tint }}
            >
              <span aria-hidden className="pointer-events-none absolute -right-[16px] -top-[16px] h-[70px] w-[70px] rounded-full opacity-25 animate-[floatSlow_8s_ease-in-out_infinite]" style={{ background: trending.tintDeep }} />
              <span className="relative z-10 text-[13px] font-bold text-[var(--ink)]">🔥 급상승</span>
              <div className="relative z-10">
                <div className="text-[20px] font-bold leading-tight tracking-[-0.01em] text-[var(--ink)] font-[var(--font-display)]">{trending.name}</div>
                <div className="mt-[4px] inline-flex items-center gap-[4px] rounded-full bg-[var(--paper)]/70 px-[8px] py-[2px] text-[11px] font-bold" style={{ color: trending.tintDeep }}>
                  ▲ 32% 지금 뜨는 중
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Bento game grid — mixed-size tiles break the uniform rhythm. */}
        <div>
          <div className="mb-[12px] px-[22px]">
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">게임 둘러보기</h3>
          </div>
          <div className="grid grid-flow-dense grid-cols-2 gap-[12px] px-[20px]">
            {games.map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onGameSelect}
                wide={i % 5 === 0}
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                badge={
                  game.isNew ? (
                    <span className="absolute right-[10px] top-[10px] rounded-[6px] bg-[var(--coral-tint)] p-[3px_8px] text-[10px] font-bold text-[var(--coral-deep)] shadow-sm">신규</span>
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
