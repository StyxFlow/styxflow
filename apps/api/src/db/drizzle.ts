import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "../config/index.js";
import * as schema from "./schema.js";

const databaseUrl = config.database_url!;

export const db =
  config.env === "production"
    ? drizzleNeon(databaseUrl, { schema, logger: false })
    : drizzlePostgres(postgres(databaseUrl), { schema, logger: false });
