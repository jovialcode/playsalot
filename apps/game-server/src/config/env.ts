export const PORT = Number(process.env.PORT ?? 2567);
export const REDIS_URL = process.env.REDIS_URL; // unset => in-memory presence/driver (single-instance local dev)
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-do-not-use-in-production";
