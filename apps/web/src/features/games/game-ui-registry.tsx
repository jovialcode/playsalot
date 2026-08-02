import type { ComponentType } from "react";
import type { Room } from "colyseus.js";
import { OmokBoard } from "@/components/game/OmokBoard";
import { BurumableBoard } from "@/components/game/BurumableBoard";
import { HalliGalliBoard } from "@/components/game/HalliGalliBoard";
import { UnoBoard } from "@/components/game/UnoBoard";
import { YutnoriBoard } from "@/components/game/YutnoriBoard";
import { BattleshipBoard } from "@/components/game/BattleshipBoard";
import { GostopBoard } from "@/components/game/GostopBoard";
import { PresidentBoard } from "@/components/game/PresidentBoard";
import { GemMerchantsBoard } from "@/components/game/GemMerchantsBoard";
import { MancalaBoard } from "@/components/game/MancalaBoard";
import { DotsBoard } from "@/components/game/DotsBoard";

export interface GameScreenProps {
  room: Room;
  guestId: string;
}

type GameScreen = ComponentType<GameScreenProps>;

const gameScreens: ReadonlyMap<string, GameScreen> = new Map([
  ["omok", OmokBoard],
  ["burumable", BurumableBoard],
  ["uno", UnoBoard],
  ["halli", HalliGalliBoard],
  ["yutnori", YutnoriBoard],
  ["battleship", BattleshipBoard],
  ["gostop", GostopBoard],
  ["president", PresidentBoard],
  ["gem-merchants", GemMerchantsBoard],
  ["mancala", MancalaBoard],
  ["dots", DotsBoard],
]);

export function getGameScreen(gameId: string): GameScreen | undefined {
  return gameScreens.get(gameId);
}

export function supportsGameScreen(gameId: string): boolean {
  return gameScreens.has(gameId);
}
