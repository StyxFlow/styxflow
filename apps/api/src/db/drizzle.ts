import { drizzle } from "drizzle-orm/neon-http";
import config from "../config/index.js";

export const db = drizzle(config.database_url!);
