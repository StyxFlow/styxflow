"use server";

import { config } from "@/config";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

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
  resume?: File | null;
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

  if (payload.role === "CANDIDATE" && payload?.resume) {
    const token = (await cookies()).get(config.better_auth_key!)?.value;
    if (!token) {
      return;
    }
    const formData = new FormData();
    formData.append("resume", payload.resume);
    const res = await fetch(`${config.server_url}/user/upload-resume`, {
      method: "POST",
      headers: {
        authorization: token,
      },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      console.log(data);
      throw new Error(data.error || "Failed to upload resume");
    }
  }
  return response.json();
};
