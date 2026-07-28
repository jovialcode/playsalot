import type { ComponentType } from "react";
import type { Room } from "colyseus.js";
import { OmokBoard } from "@/components/game/OmokBoard";

export interface GameScreenProps {
  room: Room;
  guestId: string;
}

type GameScreen = ComponentType<GameScreenProps>;

const gameScreens: ReadonlyMap<string, GameScreen> = new Map([
  ["omok", OmokBoard],
]);

export function getGameScreen(gameId: string): GameScreen | undefined {
  return gameScreens.get(gameId);
}

export function supportsGameScreen(gameId: string): boolean {
  return gameScreens.has(gameId);
}
