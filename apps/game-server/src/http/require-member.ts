import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

/** The verified identity behind a member (logged-in) request. */
export interface MemberIdentity {
  guestId: string;
  displayName: string;
}

interface TokenPayload {
  guestId: string;
  displayName: string;
  accountType?: "guest" | "member";
}

/**
 * Gate for login-required HTTP endpoints (friends, ranking, ...). Verifies the
 * bearer token and requires a member account — guests get a distinguishable
 * `LOGIN_REQUIRED` response so the client can prompt a login instead of a generic
 * error. Returns the identity on success, or undefined after writing the response.
 */
export function requireMember(req: Request, res: Response): MemberIdentity | undefined {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ message: "로그인이 필요해요.", code: "LOGIN_REQUIRED" });
    return undefined;
  }
  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    res.status(401).json({ message: "세션이 유효하지 않습니다." });
    return undefined;
  }
  if (payload.accountType !== "member") {
    res.status(403).json({ message: "로그인이 필요해요.", code: "LOGIN_REQUIRED" });
    return undefined;
  }
  return { guestId: payload.guestId, displayName: payload.displayName };
}
