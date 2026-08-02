"use client";

interface FriendsViewProps {
  onShowToast: (message: string) => void;
}

interface Friend {
  name: string;
  status: string;
  playing?: string; // game name if mid-match → spectate instead of challenge
}

// Mock social data — a real friends graph would come from the server later.
const ONLINE: Friend[] = [
  { name: "서연", status: "오목 대국 중", playing: "오목" },
  { name: "도윤", status: "대기 중" },
  { name: "하은", status: "우노 플레이 중", playing: "우노" },
  { name: "지호", status: "대기 중" },
];

const OFFLINE: Friend[] = [
  { name: "수아", status: "2시간 전 접속" },
  { name: "예준", status: "어제 접속" },
  { name: "민서", status: "3일 전 접속" },
];

const RECENT = [
  { name: "민수", lastGame: "우노" },
  { name: "지우", lastGame: "만칼라" },
];

function Avatar({ name, dim = false }: { name: string; dim?: boolean }) {
  return (
    <div
      className={`flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full font-[var(--font-display)] text-[15px] ${
        dim ? "bg-[var(--mist)] text-[var(--ink-mute)]" : "bg-[var(--sage)] text-[var(--cream)]"
      }`}
    >
      {name[0]}
    </div>
  );
}

export function FriendsView({ onShowToast }: FriendsViewProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="flex items-end justify-between p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div>
            <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">라운지</div>
            <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">친구</div>
          </div>
          <button
            onClick={() => onShowToast("초대 코드로 친구를 추가할 수 있어요 (준비 중)")}
            className="inline-flex items-center gap-[6px] rounded-full border border-[var(--mist)] bg-[var(--paper)] px-[14px] py-[8px] text-[13px] font-medium text-[var(--ink-soft)] shadow-sm transition-transform active:scale-[.95]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            코드로 추가
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[24px] p-[18px_20px_32px]">
        {/* Online */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[8px] text-[13px] font-bold text-[var(--ink)]">
            <span className="dot-live h-[7px] w-[7px] rounded-full bg-[var(--success)]" />
            온라인 <span className="text-[var(--ink-mute)]">({ONLINE.length})</span>
          </div>
          {ONLINE.map((f, i) => (
            <div
              key={f.name}
              style={{ animationDelay: `${i * 45}ms` }}
              className="stagger-in flex items-center gap-[12px] rounded-[14px] border border-[var(--mist)] bg-[var(--paper)] p-[10px_12px] shadow-sm"
            >
              <div className="relative">
                <Avatar name={f.name} />
                <span className="absolute -bottom-[1px] -right-[1px] h-[12px] w-[12px] rounded-full border-2 border-[var(--paper)] bg-[var(--success)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[var(--ink)]">{f.name}</div>
                <div className="truncate text-[12px] text-[var(--ink-mute)]">{f.status}</div>
              </div>
              {f.playing ? (
                <button
                  onClick={() => onShowToast(`${f.name}님의 ${f.playing} 관전은 곧 지원돼요`)}
                  className="flex-shrink-0 rounded-full border border-[var(--mist)] bg-[var(--cream)] px-[14px] py-[8px] text-[13px] font-semibold text-[var(--ink-soft)] transition-transform active:scale-[.94]"
                >
                  관전
                </button>
              ) : (
                <button
                  onClick={() => onShowToast(`${f.name}님에게 도전장을 보냈어요`)}
                  className="flex-shrink-0 rounded-full bg-[var(--sage)] px-[16px] py-[8px] text-[13px] font-semibold text-[var(--cream)] transition-transform active:scale-[.94]"
                >
                  도전
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Offline */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-[13px] font-bold text-[var(--ink-mute)]">오프라인 <span className="text-[var(--ink-faint)]">({OFFLINE.length})</span></div>
          {OFFLINE.map((f, i) => (
            <div
              key={f.name}
              style={{ animationDelay: `${i * 45}ms` }}
              className="stagger-in flex items-center gap-[12px] rounded-[14px] p-[10px_12px] opacity-70"
            >
              <Avatar name={f.name} dim />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[var(--ink-soft)]">{f.name}</div>
                <div className="truncate text-[12px] text-[var(--ink-faint)]">{f.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent opponents */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-[13px] font-bold text-[var(--ink)]">최근 상대</div>
          {RECENT.map((r, i) => (
            <div
              key={r.name}
              style={{ animationDelay: `${i * 45}ms` }}
              className="stagger-in flex items-center gap-[12px] rounded-[14px] border border-[var(--mist)] bg-[var(--paper)] p-[10px_12px] shadow-sm"
            >
              <Avatar name={r.name} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[var(--ink)]">{r.name}</div>
                <div className="truncate text-[12px] text-[var(--ink-mute)]">지난 판 · {r.lastGame}</div>
              </div>
              <button
                onClick={() => onShowToast(`${r.name}님에게 재대결을 신청했어요`)}
                className="flex-shrink-0 rounded-full border border-[var(--sage)] bg-transparent px-[14px] py-[8px] text-[13px] font-semibold text-[var(--sage)] transition-transform active:scale-[.94]"
              >
                재대결
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
