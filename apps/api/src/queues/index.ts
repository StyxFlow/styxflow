import { Queue } from "bullmq";
import config from "../config/index.js";

export const bullmqConnection = {
  host: config.redis.host,
  port: Number(config.redis.port),
  password: config.redis.password!,
  username: config.redis.username!,
};

export const resumeQueue = new Queue("resume-upload-queue", {
  connection: bullmqConnection,
});
