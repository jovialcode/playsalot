import { Client } from "colyseus.js";
import { WS_URL } from "./env";

export const colyseusClient = new Client(WS_URL);
