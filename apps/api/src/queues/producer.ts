import { resumeQueue } from "./index.js";

export const addResumeToQueue = async (queueData: string) => {
  console.log(queueData);
  const result = await resumeQueue.add(
    "resume-upload-queue",
    {
      queueData,
    },
    { removeOnComplete: true, removeOnFail: true }
  );
  console.log(`Resume job added with ID: ${result?.id}`);
};
