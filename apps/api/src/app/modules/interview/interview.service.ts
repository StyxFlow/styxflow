import { db } from "../../../db/drizzle.js";
import { vectorStore } from "../../../db/qdrant.js";
import { interview } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";

const startInterview = async (userId: string) => {
  const isCandidate = await db.query.candidate.findFirst({
    where: (candidate, { eq }) => eq(candidate.userId, userId),
  });
  if (!isCandidate) {
    throw new ApiError(404, "Candidate profile not found");
  }
  const resumeChunks = await vectorStore.similaritySearch("*", 20, {
    must: [
      {
        key: "candidateId",
        match: {
          value: isCandidate.id,
        },
      },
    ],
  });
  const resumeText = resumeChunks
    .sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex)
    .map((chunk) => chunk.pageContent)
    .join("\n");
  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }
  const newInterview = await db.insert(interview).values({
    candidateId: isCandidate.id,
    isActive: true,
    attempt: 1,
  });
  return { resume: resumeText, chunks: resumeChunks.length };
};

export const InterviewService = {
  startInterview,
};
