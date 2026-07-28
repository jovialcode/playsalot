import { colyseusClient } from "@/lib/colyseus";
import { API_URL } from "@/lib/env";
import {
  clearReconnectionToken,
  getReconnectionGameId,
  getReconnectionToken,
  saveReconnectionToken,
} from "@/lib/reconnect";
import type { GameCatalogEntry, GuestSession } from "@playsalot/shared-types";
import type { Room } from "colyseus.js";

export interface ReconnectedGame {
  room: Room;
  gameId: string;
}

export class GameService {
  static async fetchGames(): Promise<GameCatalogEntry[]> {
    const res = await fetch(`${API_URL}/api/games`);
    if (!res.ok) throw new Error("Failed to fetch games");
    return res.json();
  }

  static async joinGame(gameId: string, session: GuestSession, vsBot: boolean): Promise<Room> {
    const room = await colyseusClient.joinOrCreate("board-game", {
      gameId,
      guestId: session.guestId,
      displayName: session.displayName,
      token: session.token,
      vsBot,
    });
    saveReconnectionToken(room.reconnectionToken, gameId);
    return room;
  }

  static async tryReconnect(): Promise<ReconnectedGame | null> {
    const reconnectToken = getReconnectionToken();
    const gameId = getReconnectionGameId();
    if (!reconnectToken || !gameId) {
      clearReconnectionToken();
      return null;
    }

    const retryDelaysMs = [0, 300, 800];
    for (const delay of retryDelaysMs) {
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const rejoinedRoom = await colyseusClient.reconnect(reconnectToken);
        saveReconnectionToken(rejoinedRoom.reconnectionToken, gameId);
        return { room: rejoinedRoom, gameId };
      } catch {
        // try next delay
      }
    }
    clearReconnectionToken();
    return null;
  }
}
