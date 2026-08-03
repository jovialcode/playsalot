export const PORT = Number(process.env.PORT ?? 2567);
export const REDIS_URL = process.env.REDIS_URL; // unset => in-memory presence/driver (single-instance local dev)
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-do-not-use-in-production";

// Public base URL of THIS game-server, used to build each provider's OAuth
// redirect_uri (e.g. `${OAUTH_CALLBACK_BASE}/api/auth/google/callback`). Must
// match exactly what is registered in each provider's developer console.
export const OAUTH_CALLBACK_BASE = process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:2567";
// Where the browser is sent back after a successful login (the web app origin).
export const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000";

/** OAuth client credentials, per provider. A provider with a blank id/secret is treated as disabled. */
export const OAUTH_PROVIDERS = {
  google: { clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" },
  kakao: { clientId: process.env.KAKAO_CLIENT_ID ?? "", clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "" },
  naver: { clientId: process.env.NAVER_CLIENT_ID ?? "", clientSecret: process.env.NAVER_CLIENT_SECRET ?? "" },
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;

// Admin account bootstrapped on startup (see http/admin.ts ensureAdminAccount).
// Leave either blank to skip provisioning an admin. ADMIN_PASSWORD is only ever
// read at boot to compute a scrypt hash; the plaintext is never stored.
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
