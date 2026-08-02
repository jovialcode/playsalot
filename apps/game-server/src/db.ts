import { Pool } from "pg";
import { DATABASE_URL } from "./config/env.js";

/**
 * Local `pnpm dev` remains usable without infrastructure. Persistent
 * environments always provide DATABASE_URL via deploy/prod/docker-compose.yml.
 */
export const db = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
