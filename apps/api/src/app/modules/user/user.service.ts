import { eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { candidate } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { addResumeToQueue } from "../../../queues/producer.js";

const uploadResume = async (userId: string, filePath: string) => {
  const isCandateExists = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandateExists) {
    throw new ApiError(404, "Candidate profile not found");
  }
  if (filePath) {
    const queueData = { filePath, candidateId: isCandateExists.id };
    await addResumeToQueue(JSON.stringify(queueData));
  }
};

export const UserService = {
  uploadResume,
};
