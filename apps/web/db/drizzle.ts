import { config } from "@/config";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = config.database_url!;

export const db =
  process.env.NODE_ENV === "development"
    ? drizzlePostgres(postgres(databaseUrl))
    : drizzleNeon(databaseUrl);
