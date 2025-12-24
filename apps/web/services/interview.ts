"use server";

import { config } from "@/config";
import { IServerResponse } from "@/types";
import { IInterview } from "@/types/interview";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const createInterview = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/create-interview`,
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
    next: {
      tags: ["interview-list"],
    },
  });
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
  const result = await response.json();
  revalidatePath("/", "layout");
  return result;
};

export const getSingleInterview = async (
  interviewId: string
): Promise<IServerResponse<IInterview>> => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/${interviewId}`,
    {
      method: "GET",
      headers: {
        authorization: token!,
      },
    }
  );
  return response.json();
};

export const getResumeText = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(`${config.server_url}/interview/get-resume`, {
    method: "GET",
    headers: {
      authorization: token!,
    },
  });
  return response.json();
};

export const endInterviewCall = async (
  payload: { transcript: string },
  interviewId: string
) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/evaluate-interview/${interviewId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: token!,
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
};

export const saveRecordingUrl = async (
  payload: { recordingUrl: string },
  interviewId: string
) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/save-recording-url/${interviewId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: token!,
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
};

export const getAuthToken = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  return token;
};
