import { DesignGame } from "@/types/game";
import { useState } from "react";

interface GameDetailViewProps {
  game: DesignGame;
  onClose: () => void;
  onQuickMatch: (gameId: string) => void;
  onPlayWithBot: (gameId: string) => void;
  onShowToast: (msg: string) => void;
}

export function GameDetailView({ 
  game, 
  onClose, 
  onQuickMatch, 
  onPlayWithBot, 
  onShowToast 
}: GameDetailViewProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[var(--cream)] animate-[viewFadeIn_260ms_var(--ease)]">
      <div className="sticky top-0 z-20 flex items-center gap-[12px] bg-[var(--cream)]/80 p-[16px_22px_14px] pt-[calc(16px+env(safe-area-inset-top,0px))] backdrop-blur-md">
        <button onClick={onClose} className="inline-flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] cursor-pointer shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-[20px] font-bold tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{game.name}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[28px] overflow-y-auto p-[0_20px_calc(28px+env(safe-area-inset-bottom,0px))] no-scrollbar">
        {/* Hero Section */}
        <div className="relative -mx-[20px] flex h-[260px] flex-col items-start justify-center p-[0_32px]" style={{ background: game.tint }}>
          <div className="absolute inset-0 m-[12px] rounded-[20px] border-2 border-dashed border-black/10" />
          
          <div className="z-10 flex flex-col items-start gap-[8px]">
            <h2 className="m-0 text-[22px] font-bold leading-tight tracking-[-0.03em] text-white font-[var(--font-display)]">{game.name}</h2>
            <div className="text-[14px] font-medium text-white/70">{game.category} · {game.playersLabel}</div>
            <div className="mt-[12px] inline-flex items-center gap-[8px] rounded-full bg-black/40 p-[6px_14px] text-[14px] font-medium text-white backdrop-blur-sm">
              <span className="h-[8px] w-[8px] rounded-full bg-[var(--coral)]" />
              {game.activeNow.toLocaleString()} 명 플레이 중
            </div>
          </div>

          <div className="absolute right-[40px] top-1/2 -translate-y-1/2 text-white opacity-60">
             <div className="flex flex-col items-center gap-[10px] text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <div className="text-[13px] font-medium leading-tight">
                  {game.name} 대표 이미지<br/>
                  <span className="text-[11px] opacity-70 underline">or browse files</span>
                </div>
             </div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Description */}
        <p className="m-0 font-[var(--font-accent)] text-[22px] italic leading-[1.4] tracking-[-0.01em] text-[var(--ink-soft)]">
          {game.desc}
        </p>

        {/* Matching Options */}
        <div>
          <div className="mb-[14px] text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--ink-mute)]">매칭 방법</div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div onClick={() => game.isPlayable ? onQuickMatch(game.id) : onShowToast("이 게임은 아직 준비 중이에요!")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[16px] font-bold text-[var(--ink)]">빠른 매칭</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">랜덤 상대와 즉시 시작</div>
              </div>
            </div>

            <div onClick={() => onShowToast("준비 중인 기능입니다")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[16px] font-bold text-[var(--ink)]">방 만들기</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">초대 코드로 함께 플레이</div>
              </div>
            </div>

            <div onClick={() => onShowToast("준비 중인 기능입니다")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[16px] font-bold text-[var(--ink)]">공개 대기방</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">3개 참가 가능</div>
              </div>
            </div>

            <div onClick={() => onShowToast("준비 중인 기능입니다")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[16px] font-bold text-[var(--ink)]">친구 초대</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">함께할 친구를 불러요</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Accordion */}
        <div>
          <div 
            onClick={() => setIsRulesOpen(!isRulesOpen)} 
            className="flex w-full cursor-pointer items-center justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="text-[16px] font-bold text-[var(--ink)]">게임 방법</span>
            <svg 
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-[var(--ink-mute)] transition-transform duration-300"
              style={{ transform: isRulesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isRulesOpen ? "mt-[12px] max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="rounded-[20px] border border-[var(--mist)] bg-[var(--paper)]/50 p-[20px]">
              <ol className="m-0 flex flex-col gap-[12px] pl-[20px]">
                {game.rules.map((step, i) => (
                  <li key={i} className="text-[15px] leading-[1.6] text-[var(--ink-soft)] font-medium">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
