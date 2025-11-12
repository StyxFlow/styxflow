import { db } from "@/db/drizzle";
import {
  user,
  session,
  account,
  verification,
  candidate,
  recruiter,
} from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          emailVerified: profile.email_verified,
        };
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser, ctx) => {
          const isOAuthSignup = !ctx?.body?.password;

          if (isOAuthSignup) {
            console.log(
              "OAuth signup detected - user will be redirected to choose role"
            );
            return;
          }
          try {
            if (ctx?.body?.role == "CANDIDATE") {
              await db.insert(candidate).values({
                userId: createdUser.id,
                address: ctx?.body?.address,
                id: crypto.randomUUID(),
              });
            } else if (ctx?.body?.role == "RECRUITER") {
              if (!ctx?.body?.organizationName)
                throw new Error("Organization name is required for recruiters");
              await db.insert(recruiter).values({
                userId: createdUser.id,
                id: crypto.randomUUID(),
                organizationName: ctx?.body.organizationName,
                organizationRole: ctx?.body?.organizationRole,
              });
            }
          } catch (error) {
            console.error("Failed to create candidate data:", error);
            try {
              await db.delete(user).where(eq(user.id, createdUser.id));
              await db
                .delete(session)
                .where(eq(session.userId, createdUser.id));
              console.log("🔄 User and sessions rolled back");
            } catch (rollbackError) {
              console.error("❌ Rollback failed:", rollbackError);
            }
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["CANDIDATE", "RECRUITER"],
        defaultValue: null,
        input: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      candidate,
      recruiter,
      user,
      session,
      account,
      verification,
    },
  }),
  plugins: [nextCookies()],
});
