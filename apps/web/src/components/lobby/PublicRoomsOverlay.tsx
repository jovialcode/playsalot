import type { PublicRoomsBrowser } from "@/hooks/useMatch";

interface PublicRoomsOverlayProps {
  browser: PublicRoomsBrowser | null;
  gameName: string;
  onJoin: (roomId: string) => void;
  onCreate: (gameId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function PublicRoomsOverlay({ browser, gameName, onJoin, onCreate, onRefresh, onClose }: PublicRoomsOverlayProps) {
  if (!browser) return null;
  const { gameId, rooms, loading } = browser;

  return (
    <div className="absolute inset-0 z-30 flex animate-[fadeIn_200ms_ease-out] items-center justify-center bg-[rgba(27,31,28,0.5)] p-[24px]">
      <div className="flex max-h-[calc(100dvh-80px)] w-full max-w-[360px] flex-col overflow-hidden rounded-[20px] bg-[var(--paper)] shadow-[var(--shadow-3)]">
        {/* Header */}
        <div className="flex items-center justify-between p-[22px_22px_14px]">
          <div>
            <div className="text-[19px] font-medium text-[var(--ink)] font-[var(--font-display)]">공개 대기방</div>
            <div className="text-[13px] text-[var(--ink-mute)]">{gameName}</div>
          </div>
          <button
            onClick={onRefresh}
            aria-label="새로고침"
            className="inline-flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--cream)] text-[var(--ink-soft)] cursor-pointer active:scale-[0.95]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>
        </div>

        {/* Room list */}
        <div className="min-h-[120px] flex-1 overflow-y-auto p-[0_22px] no-scrollbar">
          {rooms.length === 0 ? (
            <div className="flex h-[160px] flex-col items-center justify-center gap-[8px] text-center">
              <div className="text-[14px] font-medium text-[var(--ink-soft)]">
                {loading ? "방을 찾는 중…" : "열린 방이 없어요"}
              </div>
              {!loading && <div className="text-[13px] text-[var(--ink-mute)]">새 공개방을 만들어 친구를 기다려보세요</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-[8px] pb-[4px]">
              {rooms.map((room) => {
                const full = room.playerCount >= room.maxPlayers;
                return (
                  <button
                    key={room.roomId}
                    onClick={() => !full && onJoin(room.roomId)}
                    disabled={full}
                    className="flex items-center gap-[12px] rounded-[14px] border border-[var(--mist)] bg-[var(--cream)] p-[12px_14px] text-left transition-transform active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] text-[14px] font-[var(--font-display)]">
                      {room.hostName[0] ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium text-[var(--ink)]">
                        {room.hostName}님의 방
                      </div>
                      <div className="text-[12px] text-[var(--ink-mute)]">{room.playerCount}/{room.maxPlayers}명 참가</div>
                    </div>
                    <span className="flex-shrink-0 text-[13px] font-medium text-[var(--sage)]">{full ? "가득 참" : "참가"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-[8px] p-[16px_22px_22px]">
          <button onClick={() => onCreate(gameId)} className="btn btn-primary w-full">새 공개방 만들기</button>
          <button onClick={onClose} className="btn btn-ghost w-full">닫기</button>
        </div>
      </div>
    </div>
  );
}
