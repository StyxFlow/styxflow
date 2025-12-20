"use server";

import { config } from "@/config";
import { IServerResponse } from "@/types";
import { IInterview } from "@/types/interview";
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
  return response.json();
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

export const endInterviewCall = async (payload: {
  videoFile: FormData;
  interviewId: string;
}) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  // const formData = new FormData();
  // formData.append("recording", payload.videoFile);
  const response = await fetch(
    `${config.server_url}/interview/evaluate-interview/${payload.interviewId}`,
    {
      method: "PATCH",
      headers: {
        authorization: token!,
      },
      body: payload.videoFile,
    }
  );
  return response.json();
};
