import type { GuestSession } from "@playsalot/shared-types";
import { Router, type Router as ExpressRouter } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_SECRET } from "../config/env.js";
import { registerGuest } from "./friends.js";

const ADJECTIVES = [
  "무서운",
  "누워있는",
  "무시무시한",
  "졸린",
  "배고픈",
  "수줍은",
  "화난",
  "물렁한",
  "어색한",
  "용감한",
  "게으른",
  "냉정한",
  "촉촉한",
  "당당한",
  "엉뚱한",
  "새침한",
  "느긋한",
  "수상한",
  "귀찮은",
  "발랄한",
];

const NOUNS = [
  "고양이",
  "강아지",
  "슬리퍼",
  "감자",
  "문어",
  "코끼리",
  "붕어빵",
  "만두",
  "도토리",
  "곰돌이",
  "펭귄",
  "라면",
  "두부",
  "김밥",
  "호랑이",
  "다람쥐",
  "오징어",
  "떡볶이",
  "고구마",
  "메기",
];

const SESSION_TTL_SECONDS = 12 * 60 * 60;

/** Display names currently held by an active guest session, so two guests never collide. */
const usedDisplayNames = new Set<string>();

/**
 * Picks a random adjective+noun+number combo (e.g. "무서운고양이1") and reserves it
 * until the guest's session expires, retrying on collision so it stays unique among
 * currently active guests.
 */
function randomDisplayName(): string {
  let name: string;
  do {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const suffix = Math.floor(Math.random() * 99) + 1;
    name = `${adjective}${noun}${suffix}`;
  } while (usedDisplayNames.has(name));

  usedDisplayNames.add(name);
  setTimeout(() => usedDisplayNames.delete(name), SESSION_TTL_SECONDS * 1000).unref();
  return name;
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
sessionRouter.post("/session", async (_req, res, next) => {
  const guestId = `guest_${uuidv4()}`;
  const displayName = randomDisplayName();
  const token = jwt.sign({ guestId, displayName }, JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });

  try {
    await registerGuest({ guestId, displayName });
    // accountType is explicit so the client can tell guests from members and gate
    // login-required features (friends, ranking, room creation) accordingly.
    const session: GuestSession = { guestId, displayName, token, accountType: "guest" };
    res.json(session);
  } catch (error) {
    next(error);
  }
});
