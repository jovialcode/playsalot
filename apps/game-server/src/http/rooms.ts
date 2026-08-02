import { matchMaker } from "@colyseus/core";
import type { PublicRoomSummary } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";

export const roomsRouter: ExpressRouter = Router();

/**
 * Lists open "public" waiting rooms for a given game so the lobby can show a
 * browsable room list (there's no `client.getAvailableRooms` in colyseus.js 0.16).
 *
 * We query the matchmaker driver directly, filtering by the `mode` field that
 * `filterBy(["gameId", "mode"])` registers on every room's listing (see index.ts).
 * `mode: "public"` is what keeps these rooms out of the quick-match pool while
 * still being discoverable here. Locked (already started) or full rooms are
 * dropped — they can't be joined via joinById anyway.
 */
roomsRouter.get("/rooms", async (req, res) => {
  const gameId = typeof req.query.gameId === "string" ? req.query.gameId : "";
  if (!gameId) {
    res.json([]);
    return;
  }

  const listings = await matchMaker.query({ name: "board-game", mode: "public", gameId });
  const rooms: PublicRoomSummary[] = listings
    .filter((room) => !room.locked && room.clients < room.maxClients)
    .map((room) => ({
      roomId: room.roomId,
      gameId: (room.metadata?.gameId as string) ?? gameId,
      hostName: (room.metadata?.hostName as string) || "익명",
      playerCount: room.clients,
      maxPlayers: room.maxClients,
    }));

  res.json(rooms);
});
