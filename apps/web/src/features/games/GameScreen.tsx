import { createElement } from "react";
import type { Room } from "colyseus.js";
import { getGameScreen } from "./game-ui-registry";

interface GameScreenProps {
  gameId: string;
  room: Room;
  guestId: string;
}

export function GameScreen({ gameId, room, guestId }: GameScreenProps) {
  const Screen = getGameScreen(gameId);

  if (!Screen) {
    return (
      <div className="rounded-[16px] border border-[var(--mist)] bg-[var(--paper)] p-6 text-center text-[var(--ink-soft)]">
        이 게임의 화면은 아직 준비 중입니다. 방에서 나간 뒤 다시 시도해 주세요.
      </div>
    );
  }

  return createElement(Screen, { room, guestId });
}
