import type { GuestSession } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_SECRET } from "../config/env.js";

const ADJECTIVES = ["Swift", "Clever", "Brave", "Calm", "Lucky", "Silent", "Jolly"];
const ANIMALS = ["Fox", "Otter", "Falcon", "Panda", "Wolf", "Heron", "Tiger"];

function randomDisplayName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 1000);
  return `${adjective}${animal}${suffix}`;
}

export const sessionRouter: ExpressRouter = Router();

/**
 * Issues a throwaway guest identity. No password, no DB row — just a signed
 * token so the game-server can later verify a client's claimed guestId
 * during Room#onAuth without trusting the client outright.
 *
 * Swapping in real accounts later only means replacing this endpoint's
 * implementation; Room/game code only ever deals with an opaque playerId.
 */
sessionRouter.post("/session", (_req, res) => {
  const guestId = `guest_${uuidv4()}`;
  const displayName = randomDisplayName();
  const token = jwt.sign({ guestId, displayName }, JWT_SECRET, { expiresIn: "12h" });

  const session: GuestSession = { guestId, displayName, token };
  res.json(session);
});
