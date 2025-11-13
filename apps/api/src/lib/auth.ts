import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/drizzle.js";
import { schema } from "../db/schema.js";
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  // Ensure cookies work in development (localhost)
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
