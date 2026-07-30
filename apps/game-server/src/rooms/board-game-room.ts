import { gameRegistry, type GameDefinition, type PlayerId } from "@playsalot/game-engine-core";
import type { JoinRoomOptions } from "@playsalot/shared-types";
import { Client, Room, ServerError } from "@colyseus/core";
import type { Schema } from "@colyseus/schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

interface AuthPayload {
  guestId: string;
  displayName: string;
}

const BOT_MOVE_DELAY_MS = 500;

/**
 * The one and only Room class in the whole server. It doesn't know
 * anything about chess/omok/checkers rules — it just loads whichever
 * GameDefinition was requested (`options.gameId`) from the registry and
 * delegates all game logic to it. Adding a new game never touches this file.
 *
 * "vs computer" mode works the same way: when the joining client passes
 * `vsBot: true`, this room fills whatever seats are left with synthetic bot
 * player ids and, after every real move, asks the GameDefinition's optional
 * `getCurrentTurnPlayerId`/`chooseBotMove` hooks whether a bot should move
 * next. Games that don't implement those hooks simply can't be played vs
 * bot — nothing else in this file needs to know which games do.
 */
export class BoardGameRoom extends Room<Schema> {
  private definition!: GameDefinition<Schema, unknown>;
  private readonly playerIdByClient = new Map<string, PlayerId>();
  private readonly joinedPlayerIds: PlayerId[] = [];
  private readonly botPlayerIds: PlayerId[] = [];
  private isVsBot = false;

  onCreate(options: { gameId: string; vsBot?: boolean }): void {
    this.definition = gameRegistry.require(options.gameId);
    this.isVsBot = !!options.vsBot;

    // In vs-bot mode we only need enough real clients to fill the
    // non-bot seats; the rest get filled with bot player ids in onJoin.
    const requiredHumans = this.isVsBot ? this.definition.maxPlayers - 1 : this.definition.maxPlayers;
    this.maxClients = Math.max(requiredHumans, 1);

    // Assigned once, here, before any client joins — see the note on
    // GameDefinition.createInitialState for why setting `this.state` later
    // (e.g. only once the room fills up) would leave already-connected
    // clients without a full state sync.
    this.state = this.definition.createInitialState();

    this.onMessage("move", (client, move: unknown) => {
      const playerId = this.playerIdByClient.get(client.sessionId);
      if (!playerId) return;
      this.applyMoveAndAdvance(playerId, move, client);
    });
  }

  /** Verifies the client's claimed guestId against its signed session token before allowing a join. */
  onAuth(_client: Client, options: JoinRoomOptions): AuthPayload {
    try {
      const payload = jwt.verify(options.token, JWT_SECRET) as AuthPayload;
      if (payload.guestId !== options.guestId) {
        throw new Error("guestId mismatch");
      }
      return payload;
    } catch {
      throw new ServerError(401, "Invalid or expired session token");
    }
  }

  onJoin(client: Client, _options: JoinRoomOptions, auth: AuthPayload): void {
    this.playerIdByClient.set(client.sessionId, auth.guestId);
    this.joinedPlayerIds.push(auth.guestId);
    this.definition.addPlayer(this.state, { id: auth.guestId, displayName: auth.displayName });

    if (this.joinedPlayerIds.length !== this.maxClients) return;

    if (this.isVsBot) {
      const botsNeeded = this.definition.maxPlayers - this.joinedPlayerIds.length;
      for (let i = 0; i < botsNeeded; i += 1) {
        const botId = `bot-${i}`;
        this.botPlayerIds.push(botId);
        this.definition.addPlayer(this.state, { id: botId, displayName: "컴퓨터" });
      }
    }

    this.lock();
    this.maybeTriggerBotMove();
  }

  /**
   * A dropped connection (network blip, page refresh) shouldn't end the
   * game — hold the seat open for 30s via Colyseus' reconnection token so
   * the same client can rejoin with `client.reconnect(token)` and keep
   * `sessionId` (and therefore its playerIdByClient mapping) intact.
   * A deliberate leave (`consented`) skips straight to freeing the seat.
   */
  async onLeave(client: Client, consented: boolean): Promise<void> {
    if (consented) {
      this.playerIdByClient.delete(client.sessionId);
      return;
    }

    try {
      await this.allowReconnection(client, 30);
    } catch {
      this.playerIdByClient.delete(client.sessionId);
    }
  }

  /** `rejectingClient` is only present for human-submitted moves — bot moves are always legal by construction. */
  private applyMoveAndAdvance(playerId: PlayerId, move: unknown, rejectingClient?: Client): void {
    const result = this.definition.applyMove(this.state, playerId, move);
    if (!result.ok) {
      rejectingClient?.send("move-rejected", { error: result.error });
      return;
    }

    const gameOver = this.definition.checkGameOver(this.state);
    if (gameOver) {
      this.broadcast("game-over", gameOver);
      this.lock();
      return;
    }

    this.maybeTriggerBotMove();
  }

  /** Checks whether it's a bot's turn and, if so, schedules its move after a short "thinking" delay. */
  private maybeTriggerBotMove(): void {
    if (!this.isVsBot || this.botPlayerIds.length === 0) return;

    const getCurrentTurnPlayerId = this.definition.getCurrentTurnPlayerId;
    const chooseBotMove = this.definition.chooseBotMove;
    if (!getCurrentTurnPlayerId || !chooseBotMove) return;

    const currentPlayerId = getCurrentTurnPlayerId(this.state);
    if (!currentPlayerId || !this.botPlayerIds.includes(currentPlayerId)) return;

    this.clock.setTimeout(() => {
      const move = chooseBotMove(this.state, currentPlayerId);
      this.applyMoveAndAdvance(currentPlayerId, move);
    }, BOT_MOVE_DELAY_MS);
  }
}
