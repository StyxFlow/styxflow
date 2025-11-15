import { and, eq } from "drizzle-orm";
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
  const isInterviewActive = await db.query.interview.findFirst({
    where: and(
      eq(interview.candidateId, isCandidate.id),
      eq(interview.isActive, true)
    ),
  });

  if (isInterviewActive) {
    throw new ApiError(400, "An active interview already exists");
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

const getMyInterviews = async (userId: string) => {
  const isCandidate = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandidate) {
    throw new ApiError(404, "Candidate profile not found");
  }

  const myInterviews = await db.query.interview.findMany({
    where: eq(interview.candidateId, isCandidate.id),
  });
  return myInterviews;
};

const conductInterview = async () => {};

export const InterviewService = {
  startInterview,
  conductInterview,
  getMyInterviews,
};
