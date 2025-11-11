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
