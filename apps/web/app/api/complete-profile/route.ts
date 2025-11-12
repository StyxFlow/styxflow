import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user, candidate, recruiter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, organizationName, organizationRole } = body;

    // Validate role
    if (!role || (role !== "CANDIDATE" && role !== "RECRUITER")) {
      return NextResponse.json(
        { error: "Invalid role. Must be CANDIDATE or RECRUITER" },
        { status: 400 }
      );
    }

    // Validate recruiter fields
    if (role === "RECRUITER") {
      if (!organizationName || !organizationRole) {
        return NextResponse.json(
          { error: "Organization name and role are required for recruiters" },
          { status: 400 }
        );
      }
    }

    // Update user role first
    await db.update(user).set({ role }).where(eq(user.id, session.user.id));

    // Create profile based on role
    if (role === "CANDIDATE") {
      await db.insert(candidate).values({
        id: randomUUID(),
        userId: session.user.id,
        address: "",
      });
    } else if (role === "RECRUITER") {
      await db.insert(recruiter).values({
        id: randomUUID(),
        userId: session.user.id,
        organizationName,
        organizationRole,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
