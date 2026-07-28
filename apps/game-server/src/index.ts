import { createServer } from "node:http";
import { Server } from "@colyseus/core";
import { RedisDriver } from "@colyseus/redis-driver";
import { RedisPresence } from "@colyseus/redis-presence";
import { WebSocketTransport } from "@colyseus/ws-transport";
import cors from "cors";
import express from "express";
import { PORT, REDIS_URL } from "./config/env.js";
import { registerGames } from "./config/register-games.js";
import { catalogRouter } from "./http/catalog.js";
import { sessionRouter } from "./http/session.js";
import { BoardGameRoom } from "./rooms/board-game-room.js";

registerGames();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", catalogRouter);
app.use("/api", sessionRouter);
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);

// REDIS_URL unset => in-memory presence/driver, fine for a single local
// instance. Set it (docker-compose / production) to make multiple
// game-server instances share room state and matchmaking, see ARCHITECTURE.md.
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
  presence: REDIS_URL ? new RedisPresence(REDIS_URL) : undefined,
  driver: REDIS_URL ? new RedisDriver(REDIS_URL) : undefined,
});

gameServer.define("board-game", BoardGameRoom);

httpServer.listen(PORT, () => {
  console.log(`playsalot game-server listening on :${PORT} (redis: ${REDIS_URL ? "on" : "off"})`);
});
