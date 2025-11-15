"use server";

import { config } from "@/config";
import { cookies } from "next/headers";

export const startInterview = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/start-interview`,
    {
      method: "POST",
      headers: {
        authorization: token!,
      },
    }
  );
  return response.json();
};
