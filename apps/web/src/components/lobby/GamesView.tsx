import { CATEGORIES } from "@/constants/games";
import type { DesignGame } from "@/types/game";
import { useMemo, useState } from "react";

interface GamesViewProps {
  games: DesignGame[];
  onGameSelect: (gameId: string) => void;
}

export function GamesView({ games, onGameSelect }: GamesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredGames = useMemo(() => {
    return games.filter(g => 
        (activeCategory === "전체" || g.category === activeCategory) &&
        (g.name.includes(searchQuery))
    );
  }, [activeCategory, games, searchQuery]);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">전체 목록</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">게임</div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] p-[14px_20px_0]">
        <input 
          className="input" 
          placeholder="게임 이름으로 검색" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <div className="flex gap-[8px] overflow-x-auto pb-[4px]">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className="flex-shrink-0 cursor-pointer rounded-full border px-[14px] py-[8px] text-[13px] font-[var(--font-body)] whitespace-nowrap"
              style={{ 
                  background: activeCategory === cat ? "var(--sage)" : "var(--paper)",
                  color: activeCategory === cat ? "var(--cream)" : "var(--ink-soft)",
                  border: activeCategory === cat ? "var(--sage)" : "var(--mist)",
                  fontWeight: activeCategory === cat ? 600 : 400
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[12px] p-[4px_20px_28px]">
        {filteredGames.map((game) => (
          <div key={game.id} onClick={() => onGameSelect(game.id)} className="card-paper flex cursor-pointer flex-col gap-[10px] p-[14px]">
            <div className="flex items-start justify-between">
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px]" style={{ background: game.tint, color: game.tintDeep }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/></svg>
              </div>
              {game.isNew && <span className="badge bg-[var(--coral-tint)] text-[var(--coral-deep)]">신규</span>}
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
              <div className="mt-[2px] text-[12px] text-[var(--ink-mute)]">{game.category} · {game.playersLabel}</div>
            </div>
            <div className="flex items-center gap-[6px] text-[12px] text-[var(--ink-soft)]">
              <span className="h-[6px] w-[6px] rounded-full bg-[var(--coral)]"></span>
              {game.activeNow.toLocaleString()}명 플레이 중
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
