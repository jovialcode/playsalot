import { useState } from "react";
import type { WaitingRoom } from "@/hooks/useMatch";

interface WaitingRoomOverlayProps {
  waitingRoom: WaitingRoom | null;
  guestId: string;
  onStart: () => void;
  onLeave: () => void;
}

export function WaitingRoomOverlay({ waitingRoom, guestId, onStart, onLeave }: WaitingRoomOverlayProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!waitingRoom) return null;
  const { room, roster } = waitingRoom;

  const isHost = roster?.hostId === guestId;
  const players = roster?.players ?? [];
  const minPlayers = roster?.minPlayers ?? 2;
  const maxPlayers = roster?.maxPlayers ?? 2;
  const canStart = isHost && players.length >= minPlayers;

  const handleCopy = () => {
    void navigator.clipboard.writeText(room.roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleInvite = async () => {
    const inviteText = `플레이살롯에서 함께 게임해요! 초대 코드: ${room.roomId}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "플레이살롯 게임 초대", text: inviteText, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(`${inviteText}\n${window.location.origin}`);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // Closing the system share sheet is not an error the player needs to see.
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex animate-[fadeIn_200ms_ease-out] items-center justify-center bg-[rgba(27,31,28,0.5)] p-[24px]">
      <div className="w-full max-w-[320px] rounded-[20px] bg-[var(--paper)] p-[28px_24px] text-center shadow-[var(--shadow-3)]">
        <div className="mb-[4px] text-[19px] font-medium text-[var(--ink)] font-[var(--font-display)]">
          {isHost ? "친구를 기다리는 중" : "방장을 기다리는 중"}
        </div>
        <div className="mb-[20px] text-[13px] text-[var(--ink-mute)]">
          {players.length}/{maxPlayers}명 참가 · 최소 {minPlayers}명
        </div>

        <button
          onClick={handleCopy}
          className="mb-[20px] flex w-full items-center justify-between rounded-[14px] border border-dashed border-[var(--mist)] bg-[var(--cream)] p-[14px_16px] cursor-pointer"
        >
          <span className="font-mono text-[18px] font-bold tracking-[0.08em] text-[var(--ink)]">{room.roomId}</span>
          <span className="text-[12px] font-medium text-[var(--sage)]">{copied ? "복사됨" : "코드 복사"}</span>
        </button>

        {isHost && (
          <button onClick={handleInvite} className="btn btn-primary mb-[20px] w-full">
            {shared ? "초대 내용 준비됨" : "친구 초대하기"}
          </button>
        )}

        <div className="mb-[24px] flex flex-col gap-[8px]">
          {Array.from({ length: maxPlayers }).map((_, i) => {
            const player = players[i];
            return (
              <div
                key={i}
                className={`flex items-center gap-[10px] rounded-[12px] p-[10px_14px] text-left ${player ? "bg-[var(--sage-tint)]/40" : "bg-[var(--cream-deep)]"}`}
              >
                <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] text-[13px] font-[var(--font-display)]">
                  {player ? player.displayName[0] : "?"}
                </div>
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium text-[var(--ink)]">
                  {player ? player.displayName : "대기 중…"}
                </div>
                {player && player.id === roster?.hostId && (
                  <span className="flex-shrink-0 rounded-full bg-[var(--sage)] p-[2px_8px] text-[11px] font-medium text-[var(--cream)]">방장</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-[8px]">
          {isHost ? (
            <button onClick={onStart} disabled={!canStart} className="btn btn-primary w-full">
              {canStart ? "게임 시작" : `최소 ${minPlayers}명 필요`}
            </button>
          ) : (
            <div className="p-[10px] text-[13px] text-[var(--ink-mute)]">방장이 시작하면 자동으로 게임이 시작돼요</div>
          )}
          <button onClick={onLeave} className="btn btn-ghost w-full">나가기</button>
        </div>
      </div>
    </div>
  );
}
