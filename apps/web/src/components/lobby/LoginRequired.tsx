interface LoginRequiredProps {
  /** Feature name shown in the heading, e.g. "친구" or "랭킹". */
  feature: string;
  /** Section title shown in the sticky header, matching the tab it replaces. */
  title: string;
  eyebrow: string;
  /** Sends the user to the my-page tab where the login buttons live. */
  onGoLogin: () => void;
}

/** Shown in place of a login-required tab's content when the current session is a guest. */
export function LoginRequired({ feature, title, eyebrow, onGoLogin }: LoginRequiredProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">{eyebrow}</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{title}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[16px] p-[48px_28px] text-center">
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[var(--sage-tint)] text-[var(--sage)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <div className="text-[17px] font-medium text-[var(--ink)] font-[var(--font-display)]">로그인이 필요해요</div>
          <div className="mt-[6px] text-[14px] leading-[1.5] text-[var(--ink-mute)]">{feature} 기능은 로그인한 회원만 이용할 수 있어요.</div>
        </div>
        <button
          onClick={onGoLogin}
          className="mt-[4px] flex h-[46px] items-center justify-center rounded-[12px] bg-[var(--sage)] px-[24px] text-[15px] font-medium text-[var(--cream)] cursor-pointer"
        >
          로그인하러 가기
        </button>
      </div>
    </div>
  );
}
