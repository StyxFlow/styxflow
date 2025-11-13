"use server";

import { config } from "@/config";
import { cookies } from "next/headers";

export const createJob = async (payload) => {
  const token = (await cookies()).get("better-auth.session_token")?.value;
  console.log(token);
  console.log(process.env.NEXT_PUBLIC_SERVER_URL);
  const response = await fetch(`${config.server_url}/job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token!,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};
