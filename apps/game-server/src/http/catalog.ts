import { gameRegistry } from "@playsalot/game-engine-core";
import type { GameCatalogEntry } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";

export const catalogRouter: ExpressRouter = Router();

catalogRouter.get("/games", (_req, res) => {
  const catalog: GameCatalogEntry[] = gameRegistry.list().map((definition) => ({
    id: definition.id,
    displayName: definition.displayName,
    minPlayers: definition.minPlayers,
    maxPlayers: definition.maxPlayers,
    supportsBot: !!definition.chooseBotMove && !!definition.getCurrentTurnPlayerId,
  }));
  res.json(catalog);
});
