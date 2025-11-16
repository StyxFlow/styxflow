"use server";

import { config } from "@/config";
import { IServerResponse } from "@/types";
import { IInterview } from "@/types/interview";
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

export const getMyInterviews = async (): Promise<
  IServerResponse<IInterview[]>
> => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(`${config.server_url}/interview/my-interviews`, {
    method: "GET",
    headers: {
      authorization: token!,
    },
  });
  return response.json();
};

export const conductInterview = async (
  interviewId: string,
  payload?: { userResponse: string }
) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/conduct-interview/${interviewId}`,
    {
      method: "POST",
      headers: {
        authorization: token!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
};

export const finishInterviewService = async (interviewId: string) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/finish-interview/${interviewId}`,
    {
      method: "PATCH",
      headers: {
        authorization: token!,
      },
    }
  );
  return response.json();
};
