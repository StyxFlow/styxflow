import { config } from "@/config";
import { cookies } from "next/headers";

export const getResumeText = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(`${config.server_url}/interview/get-resume`, {
    method: "GET",
    headers: {
      authorization: token ?? "",
    },
  });
  return response.json();
};
