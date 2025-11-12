"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const signUp = async (payload: {
  email: string;
  password: string;
  name: string;
  role: "CANDIDATE" | "RECRUITER";
  organizationName?: string;
  organizationRole?: string;
}) => {
  const result = await auth.api.signUpEmail({
    body: { ...payload, rememberMe: true, callbackURL: "/" },
    headers: await headers(),
  });
  return result;
};

export const login = async (payload: { email: string; password: string }) => {
  const result = await auth.api.signInEmail({
    body: { ...payload, rememberMe: true, callbackURL: "/" },
  });
  return result;
};

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const completeProfile = async (payload: {
  role: "CANDIDATE" | "RECRUITER";
  organizationName?: string;
  organizationRole?: string;
}) => {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  const response = await fetch("http://localhost:3000/api/complete-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { Cookie: cookie }),
    },
    body: JSON.stringify({
      role: payload.role,
      organizationName:
        payload.role === "RECRUITER" ? payload?.organizationName : undefined,
      organizationRole:
        payload.role === "RECRUITER" ? payload?.organizationRole : undefined,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    console.log(data);
    throw new Error(data.error || "Failed to complete profile");
  }
};
