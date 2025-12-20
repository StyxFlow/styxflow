import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSingleInterview } from "./services/interview";

const privateRoutes = [
  "/dashboard",
  "/create-job",
  "/uploaded-jobs",
  "/attempt-interview",
  "/attempt-interview/:interviewId",
  "/profile",
  "/attempt/:interviewId",
];
const authRoutes = ["/login", "/signup"];
const candidateOnlyRoutes = [
  /^\/attempt-interview$/,
  /^\/attempt-interview\/[^\/]+$/,
  /^\/attempt\/[^\/]+$/,
];
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

  // check if candidate is authorized to attempt the interview
  if (/^\/attempt-interview\/[^\/]+$/.test(pathname)) {
    try {
      const interviewId = pathname.split("/").pop();
      if (interviewId) {
        const result = await getSingleInterview(interviewId);
        if (!result || !result?.data) {
          return NextResponse.redirect(
            new URL("/attempt-interview", request.url)
          );
        } else if (!result.data.isActive) {
          console.log("not active");
          return NextResponse.redirect(
            new URL("/attempt-interview", request.url)
          );
        }
      }
    } catch (error) {
      console.log(error);
      return NextResponse.redirect(new URL("/attempt-interview", request.url));
    }
  }

  if (candidateOnlyRoutes.some((route) => route.test(pathname))) {
    if (session?.user?.role !== "CANDIDATE") {
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
    "/attempt-interview",
    "/attempt-interview/:interviewId",
  ],
};
