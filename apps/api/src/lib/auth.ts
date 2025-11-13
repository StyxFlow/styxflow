import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/drizzle.js";
import * as schema from "../db/schema.js";
import config from "../config/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: ["CANDIDATE", "RECRUITER"],
        defaultValue: null,
        input: true,
      },
    },
  },
  trustedOrigins: [config.client_url!],
  baseURL: config.server_url!,
});
