"use server";

import { config } from "@/config";
import { IJob } from "@/types/job";
import { cookies } from "next/headers";

export const createJob = async (payload: Partial<IJob>) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
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

export const getMyUploadedJobs = async () => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(`${config.server_url}/job/my-uploaded-jobs`, {
    method: "GET",
    headers: {
      authorization: token!,
    },
  });
  return response.json();
};

export const getASingleJob = async (jobId: string) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(`${config.server_url}/job/single-job/${jobId}`, {
    method: "GET",
    headers: {
      authorization: token!,
    },
  });
  return response.json();
};

export const getCandidateSuggestions = async (jobId: string) => {
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/job/find-employees-for-job/${jobId}`,
    {
      method: "GET",
      headers: {
        authorization: token!,
      },
    },
  );
  return response.json();
};
