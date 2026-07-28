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
    <div className="z-10 flex flex-1 flex-col overflow-hidden bg-[var(--cream)]">
      <div className="sticky top-0 z-20 flex items-center gap-[10px] border-b border-[var(--mist)] bg-[rgba(247,242,232,0.9)] p-[16px_16px_14px] backdrop-blur-[12px]">
        <button onClick={onClose} className="inline-flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{game.name}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-[20px_20px_32px] flex flex-col gap-[26px]">
        <div className="flex gap-[16px] items-start">
          <div className="w-[56px] h-[56px] rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: game.tint, color: game.tintDeep }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="m-0 mb-[4px] text-[23px] font-bold">{game.name}</h2>
            <div className="text-[13px] text-[var(--ink-mute)] mb-[9px]">{game.category} · {game.playersLabel}</div>
            <div className="inline-flex items-center gap-[6px] bg-[var(--cream-deep)] p-[4px_10px] rounded-full text-[12px] text-[var(--ink-soft)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[var(--coral)] inline-block"></span>
              {game.activeNow.toLocaleString()}명 플레이 중
            </div>
          </div>
        </div>

        <p className="font-[var(--font-accent)] italic text-[18px] leading-[1.4] text-[var(--ink-soft)] m-0">{game.desc}</p>

        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--sage-soft)] mb-[10px]">매칭 방법</div>
          <div className="grid grid-cols-2 gap-[10px]">
            <div onClick={() => game.isPlayable ? onQuickMatch(game.id) : onShowToast("이 게임은 아직 준비 중이에요!")} className="card-paper p-[16px] cursor-pointer flex flex-col gap-[8px] shadow-none">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--sage-tint)] text-[var(--sage-deep)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
              </div>
              <div className="text-[14px] font-semibold text-[var(--ink)]">빠른 매칭</div>
              <div className="text-[11px] text-[var(--ink-mute)] leading-[1.4]">랜덤 상대와 즉시 시작</div>
            </div>
            <div onClick={() => game.isPlayable && game.supportsBot ? onPlayWithBot(game.id) : onShowToast(game.isPlayable ? "AI 대전은 아직 지원하지 않아요" : "이 게임은 아직 준비 중이에요!")} className="card-paper p-[16px] cursor-pointer flex flex-col gap-[8px] shadow-none">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--sage-tint)] text-[var(--sage-deep)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/></svg>
              </div>
              <div className="text-[14px] font-semibold text-[var(--ink)]">AI 대전</div>
              <div className="text-[11px] text-[var(--ink-mute)] leading-[1.4]">컴퓨터와 연습하기</div>
            </div>
            <div onClick={() => onShowToast("준비 중인 기능입니다")} className="card-paper p-[16px] cursor-pointer flex flex-col gap-[8px] shadow-none">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--sage-tint)] text-[var(--sage-deep)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>
              </div>
              <div className="text-[14px] font-semibold text-[var(--ink)]">방 만들기</div>
              <div className="text-[11px] text-[var(--ink-mute)] leading-[1.4]">초대 코드로 함께 플레이</div>
            </div>
            <div onClick={() => onShowToast("준비 중인 기능입니다")} className="card-paper p-[16px] cursor-pointer flex flex-col gap-[8px] shadow-none">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--sage-tint)] text-[var(--sage-deep)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M2 20a6 6 0 0 1 14 0"/><circle cx="17" cy="8" r="2.3"/><path d="M15.5 13a5 5 0 0 1 5.5 5"/></svg>
              </div>
              <div className="text-[14px] font-semibold text-[var(--ink)]">친구 초대</div>
              <div className="text-[11px] text-[var(--ink-mute)] leading-[1.4]">함께할 친구를 불러요</div>
            </div>
          </div>
        </div>

        <div>
          <button onClick={() => setIsRulesOpen(!isRulesOpen)} className="w-full flex items-center justify-between bg-[var(--paper)] border border-[var(--mist)] rounded-[14px] p-[14px_16px] cursor-pointer font-[var(--font-body)]">
            <span className="text-[14px] font-medium text-[var(--ink)]">게임 방법</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRulesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 220ms cubic-bezier(0.2,0.6,0.2,1)" }}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {isRulesOpen && (
            <ol className="m-0 mt-[10px] p-0 pl-[20px] flex flex-col gap-[8px]">
              {game.rules.map((step, i) => (
                <li key={i} className="text-[14px] leading-[1.5] text-[var(--ink-soft)]">{step}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
