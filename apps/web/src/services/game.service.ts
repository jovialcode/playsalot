import { colyseusClient } from "@/lib/colyseus";
import { API_URL } from "@/lib/env";
import {
  clearReconnectionToken,
  getReconnectionGameId,
  getReconnectionToken,
  saveReconnectionToken,
} from "@/lib/reconnect";
import type { GameCatalogEntry, GuestSession, PublicRoomSummary } from "@playsalot/shared-types";
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
      mode: vsBot ? "bot" : "quick",
    });
    saveReconnectionToken(room.reconnectionToken, gameId);
    return room;
  }

  /**
   * Creates a fresh waiting room that waits for the host to send "start-game" —
   * see BoardGameRoom's isWaitingRoom branch. `mode` decides visibility: "private"
   * is invite-code only (hidden), "public" is listed by GET /api/rooms. The
   * reconnection token is intentionally NOT saved here (unlike joinGame/joinById);
   * it's saved once the game actually starts, since reconnecting into a still-waiting
   * room isn't something the lobby UI (page.tsx) knows how to render.
   */
  static async createPrivateRoom(gameId: string, session: GuestSession): Promise<Room> {
    return GameService.createWaitingRoom(gameId, session, "private");
  }

  static async createPublicRoom(gameId: string, session: GuestSession): Promise<Room> {
    return GameService.createWaitingRoom(gameId, session, "public");
  }

  private static async createWaitingRoom(
    gameId: string,
    session: GuestSession,
    mode: "private" | "public",
  ): Promise<Room> {
    return colyseusClient.create("board-game", {
      gameId,
      guestId: session.guestId,
      displayName: session.displayName,
      token: session.token,
      mode,
    });
  }

  /**
   * Joins an existing waiting room by its room id — either a private invite code
   * shared by the host, or a public room id picked from the /api/rooms listing.
   * gameId is left empty on purpose: the client learns which game it is from the
   * server's roster/game-started messages (see useMatch), so the same call works
   * regardless of which game detail page it was launched from.
   */
  static async joinRoomById(roomId: string, session: GuestSession): Promise<Room> {
    return colyseusClient.joinById(roomId, {
      gameId: "",
      guestId: session.guestId,
      displayName: session.displayName,
      token: session.token,
    });
  }

  /** Fetches the list of open public waiting rooms for a game (GET /api/rooms). */
  static async fetchPublicRooms(gameId: string): Promise<PublicRoomSummary[]> {
    const res = await fetch(`${API_URL}/api/rooms?gameId=${encodeURIComponent(gameId)}`);
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
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
