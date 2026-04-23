import { interviewerConnectQueue, resumeQueue } from "./index.js";

export const addResumeToQueue = async (queueData: string) => {
  const result = await resumeQueue.add(
    "resume-upload-queue",
    {
      queueData,
    },
    { removeOnComplete: true, removeOnFail: true },
  );
  console.log(`Resume job added with ID: ${result?.id}`);
};

export const addInterviewerConnectJobToQueue = async (queueData: string) => {
  const result = await interviewerConnectQueue.add(
    "interviewer-connect-queue",
    {
      queueData,
    },
    { removeOnComplete: true, removeOnFail: true },
  );
  console.log(`Interviewer connect job added with ID: ${result?.id}`);
};
