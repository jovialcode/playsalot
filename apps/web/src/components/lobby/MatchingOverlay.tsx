import { MatchState } from "@/types/lobby";

interface MatchingOverlayProps {
  state: MatchState;
  opponent: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MatchingOverlay({ state, opponent, onCancel, onConfirm }: MatchingOverlayProps) {
  if (state === "idle") return null;

  return (
    <div className="absolute inset-0 z-30 flex animate-[fadeIn_200ms_ease-out] items-center justify-center bg-[rgba(27,31,28,0.5)] p-[24px]">
      <div className="w-full max-w-[320px] rounded-[20px] bg-[var(--paper)] p-[32px_28px] text-center shadow-[var(--shadow-3)]">
        {state === "searching" && (
          <>
            <div className="mx-auto mb-[20px] h-[48px] w-[48px] animate-[spin_900ms_linear_infinite] rounded-full border-[3px] border-[var(--mist)] border-t-[var(--sage)]"></div>
            <div className="mb-[6px] text-[19px] font-medium text-[var(--ink)] font-[var(--font-display)]">상대를 찾고 있어요…</div>
            <div className="mb-[24px] text-[13px] text-[var(--ink-mute)]">빠른 매칭 중</div>
            <button onClick={onCancel} className="btn btn-secondary w-full">취소</button>
          </>
        )}
        {state === "found" && (
          <>
            <div className="mb-[18px] flex items-center justify-center gap-[12px]">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] font-[var(--font-display)] text-[16px]">나</div>
              <span className="text-[13px] text-[var(--ink-mute)]">VS</span>
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--coral)] text-[var(--cream)] font-[var(--font-display)] text-[16px]">{opponent?.[0] || "상"}</div>
            </div>
            <div className="mb-[4px] text-[19px] font-medium text-[var(--ink)] font-[var(--font-display)]">매칭 완료</div>
            <div className="mb-[24px] text-[13px] text-[var(--ink-mute)]">{opponent}님과 대전을 시작해요</div>
            <div className="flex flex-col gap-[8px]">
              <button onClick={onConfirm} className="btn btn-primary w-full">게임 시작하기</button>
              <button onClick={onCancel} className="btn btn-ghost w-full">닫기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
