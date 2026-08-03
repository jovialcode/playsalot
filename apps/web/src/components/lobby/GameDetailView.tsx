import { DesignGame } from "@/types/game";
import { useState } from "react";

const DETAIL_FONT_FAMILY = "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

interface GameDetailViewProps {
  game: DesignGame;
  onClose: () => void;
  onQuickMatch: (gameId: string) => void;
  onPlayWithBot: (gameId: string) => void;
  onCreateRoom: (gameId: string, visibility: "public" | "private") => void;
  onJoinRoomByCode: (code: string) => void;
  onOpenPublicRooms: (gameId: string) => void;
  onShowToast: (msg: string) => void;
}

export function GameDetailView({
  game,
  onClose,
  onQuickMatch,
  onPlayWithBot,
  onCreateRoom,
  onJoinRoomByCode,
  onOpenPublicRooms,
  onShowToast
}: GameDetailViewProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const submitJoinCode = () => {
    if (!joinCode.trim()) return;
    onJoinRoomByCode(joinCode.trim());
    setJoinCode("");
    setIsJoinOpen(false);
  };

  return (
    <div
      className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[var(--cream)] animate-[viewFadeIn_260ms_var(--ease)]"
      style={{ fontFamily: DETAIL_FONT_FAMILY }}
    >
      <div className="sticky top-0 z-20 flex items-center gap-[12px] bg-[var(--cream)]/80 p-[16px_22px_14px] pt-[calc(16px+env(safe-area-inset-top,0px))] backdrop-blur-md">
        <button onClick={onClose} className="inline-flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] cursor-pointer shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-[18px] font-semibold tracking-[-0.03em] text-[var(--ink)]">{game.name}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[28px] overflow-y-auto p-[0_20px_calc(28px+env(safe-area-inset-bottom,0px))] no-scrollbar">
        {/* Hero Section */}
        <div className="relative -mx-[20px] flex h-[260px] min-h-[260px] shrink-0 flex-col items-start justify-center p-[0_32px]" style={{ background: game.tint }}>
          {game.image && <img src={game.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          {game.image && <div className="absolute inset-0 bg-black/20" />}
          
          <div className="relative z-10 flex flex-col items-start gap-[6px]">
            <div className="text-[13px] font-medium tracking-[-0.01em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]" style={{ color: "rgba(255,255,255,0.9)" }}>
              {game.category} · {game.playersLabel}
            </div>
            <div className="mt-[10px] inline-flex items-center gap-[7px] rounded-full bg-black/40 px-[12px] py-[6px] text-[13px] font-medium text-white backdrop-blur-sm">
              <span className="h-[8px] w-[8px] rounded-full bg-[var(--coral)]" />
              {game.activeNow.toLocaleString()} 명 플레이 중
            </div>
          </div>

          {!game.image && (
            <div className="absolute right-[40px] top-1/2 -translate-y-1/2 text-white opacity-60">
              <div className="flex flex-col items-center gap-[10px] text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <div className="text-[13px] font-medium leading-tight">{game.name} 대표 이미지</div>
              </div>
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Description */}
        <p className="m-0 text-[17px] font-medium leading-[1.65] tracking-[-0.025em] text-[var(--ink-soft)]">
          {game.desc}
        </p>

        {/* Matching Options */}
        <div>
          <div className="mb-[12px] text-[12px] font-semibold tracking-[-0.01em] text-[var(--ink-mute)]">매칭 방법</div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div onClick={() => game.isPlayable ? onQuickMatch(game.id) : onShowToast("이 게임은 아직 준비 중이에요!")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[15px] font-bold tracking-[-0.02em] text-[var(--ink)]">빠른 매칭</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">랜덤 상대와 즉시 시작</div>
              </div>
            </div>

            {game.supportsBot && (
              <div onClick={() => game.isPlayable ? onPlayWithBot(game.id) : onShowToast("이 게임은 아직 준비 중이에요!")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <div className="text-[15px] font-bold tracking-[-0.02em] text-[var(--ink)]">AI와 플레이</div>
                  <div className="text-[12px] font-medium text-[var(--ink-mute)]">컴퓨터를 상대로 바로 시작</div>
                </div>
              </div>
            )}

            <div onClick={() => game.isPlayable ? setIsCreateRoomOpen(true) : onShowToast("이 게임은 아직 준비 중이에요!")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[15px] font-bold tracking-[-0.02em] text-[var(--ink)]">방 만들기</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">공개 또는 비공개로 만들기</div>
              </div>
            </div>

            <div onClick={() => game.isPlayable ? onOpenPublicRooms(game.id) : onShowToast("이 게임은 아직 준비 중이에요!")} className="flex min-h-[110px] cursor-pointer flex-col justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--sage-tint)]/50 text-[var(--sage)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[15px] font-bold tracking-[-0.02em] text-[var(--ink)]">공개 대기방</div>
                <div className="text-[12px] font-medium text-[var(--ink-mute)]">열린 방에 바로 참가</div>
              </div>
            </div>

          </div>

          {game.isPlayable && (
            <div className="mt-[12px]">
              {isJoinOpen ? (
                <div className="flex items-center gap-[8px] rounded-[16px] border border-[var(--mist)] bg-[var(--paper)] p-[8px]">
                  <input
                    autoFocus
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitJoinCode()}
                    placeholder="초대 코드 입력"
                    className="min-w-0 flex-1 bg-transparent p-[8px_10px] text-[15px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
                  />
                  <button onClick={submitJoinCode} className="btn btn-primary btn-sm flex-shrink-0">참가</button>
                  <button onClick={() => { setIsJoinOpen(false); setJoinCode(""); }} className="btn btn-ghost btn-sm flex-shrink-0">취소</button>
                </div>
              ) : (
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="w-full cursor-pointer p-[8px] text-center text-[13px] font-medium text-[var(--ink-mute)] underline"
                >
                  초대 코드로 참가하기
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rules Accordion */}
        <div>
          <div 
            onClick={() => setIsRulesOpen(!isRulesOpen)} 
            className="flex w-full cursor-pointer items-center justify-between rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] p-[20px] shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="text-[17px] font-bold tracking-[-0.025em] text-[var(--ink)]">게임 방법</span>
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
                  <li key={i} className="text-[14px] leading-[1.7] tracking-[-0.015em] text-[var(--ink-soft)] font-medium">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {isCreateRoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-visibility-title"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(27,31,28,0.5)] p-[24px] animate-[fadeIn_200ms_ease-out]"
          onClick={() => setIsCreateRoomOpen(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-[20px] bg-[var(--paper)] p-[24px] shadow-[var(--shadow-3)] animate-[toastIn_200ms_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div id="room-visibility-title" className="text-center text-[18px] font-bold tracking-[-0.03em] text-[var(--ink)]">방 공개 설정</div>
            <p className="mb-[20px] mt-[6px] text-center text-[13px] text-[var(--ink-mute)]">함께할 사람을 어떻게 받을지 선택하세요</p>
            <div className="flex flex-col gap-[8px]">
              <button
                type="button"
                onClick={() => onCreateRoom(game.id, "public")}
                className="rounded-[14px] border border-[var(--sage)] bg-[var(--sage-tint)]/40 p-[14px] text-left cursor-pointer transition-transform active:scale-[0.98]"
              >
                <div className="text-[15px] font-bold text-[var(--ink)]">공개방</div>
                <div className="mt-[3px] text-[12px] leading-[1.4] text-[var(--ink-mute)]">대기방 목록에서 누구나 참가할 수 있어요</div>
              </button>
              <button
                type="button"
                onClick={() => onCreateRoom(game.id, "private")}
                className="rounded-[14px] border border-[var(--mist)] bg-[var(--cream)] p-[14px] text-left cursor-pointer transition-transform active:scale-[0.98]"
              >
                <div className="text-[15px] font-bold text-[var(--ink)]">비공개방</div>
                <div className="mt-[3px] text-[12px] leading-[1.4] text-[var(--ink-mute)]">초대 코드를 아는 사람만 참가할 수 있어요</div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(false)}
              className="btn btn-ghost mt-[12px] w-full"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
