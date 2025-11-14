import { Job, Worker } from "bullmq";
import { bullmqConnection } from "./index.js";
import path from "path";
import fs from "fs";

const worker = new Worker(
  "resume-upload-queue",
  async (job: Job<{ queueData: string }>) => {
    const { filePath } = JSON.parse(job.data.queueData);

    console.log("Processing resume upload job", filePath);
    const absolutePath = path.resolve(filePath);
    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.error("Error deleting file:", absolutePath, err);
        return;
      }
    });
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  }
);
