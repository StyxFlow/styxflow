import { drizzle } from "drizzle-orm/neon-http";
import config from "../config/index.js";
import * as schema from "./schema.js";

export const db = drizzle(config.database_url!, { schema, logger: true });
