import { eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate, interview } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";

const startInterview = async (userId: string) => {
  const isCandidate = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandidate) {
    throw new ApiError(404, "Candidate profile not found");
  }

  const vectorStore = await getVectorStore();
  const resumeChunks = await vectorStore.similaritySearchWithScore("*", 20, {
    must: [{ key: "metadata.candidateId", match: { value: isCandidate.id } }],
  });

  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }
  // const resumeText = resumeChunks
  //   .sort((a, b) => a[0].metadata.chunkIndex - b[0].metadata.chunkIndex)
  //   .map((chunk) => chunk[0].pageContent)
  //   .join("\n");

  const newInterview = await db
    .insert(interview)
    .values({
      candidateId: isCandidate.id,
      isActive: true,
      attempt: 1,
    })
    .returning();
  return { chunks: resumeChunks, newInterview };
};

export const InterviewService = {
  startInterview,
};
