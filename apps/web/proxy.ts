import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const privateRoutes = ["/dashboard", "/create-job", "/uploaded-jobs"];
const authRoutes = ["/login", "/signup"];
// const candidateOnlyRoutes = [];
const recruiterOnlyRoutes = ["/create-job", "/uploaded-jobs"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const pathname = request.nextUrl.pathname;

  // If user is authenticated but doesn't have a role, redirect to choose-role
  if (
    session?.user &&
    !session.user.role &&
    pathname !== "/choose-role" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/choose-role", request.url));
  } else if (
    session?.user &&
    session.user.role &&
    pathname === "/choose-role"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (privateRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (recruiterOnlyRoutes.includes(pathname)) {
    if (session?.user?.role !== "RECRUITER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/login",
    "/signup",
    "/",
    "/about",
    "/choose-role",
    "/create-job",
    "/uploaded-jobs",
  ],
};
