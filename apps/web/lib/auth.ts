import { db } from "@/db/drizzle";
import { user, session, account, verification, candidate } from "@/db/schema";
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
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser, ctx) => {
          if (ctx?.context.adapter) {
            try {
              console.log(ctx.body);
              if (ctx?.body?.role == "CANDIDATE") {
                await db.insert(candidate).values({
                  userId: createdUser.id,
                  address: ctx?.body?.address,
                  profilePhoto: ctx?.body?.profilePhoto,
                  id: crypto.randomUUID(),
                });
              } else if (ctx?.body?.role == "RECRUITER") {
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
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["CANDIDATE", "RECRUITER"],
        defaultValue: "CANDIDATE",
        input: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      candidate,
      user,
      session,
      account,
      verification,
    },
  }),
  plugins: [nextCookies()],
});
