import { eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate } from "../../../db/schema.js";
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

  // console.log(resumeChunks.points.length);
  // const resumeText = resumeChunks.points
  //   .sort(
  //     (a, b) =>
  //       (a.payload!.metadata! as { candidateId: string; chunkIndex: number })
  //         .chunkIndex -
  //       (b.payload!.metadata! as { candidateId: string; chunkIndex: number })
  //         .chunkIndex
  //   )
  //   .map((chunk) => chunk.payload!.content)
  // .join("\n");
  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }
  const resumeText = resumeChunks
    .sort((a, b) => a[0].metadata.chunkIndex - b[0].metadata.chunkIndex)
    .map((chunk) => chunk[0].pageContent)
    .join("\n");
  // const newInterview = await db.insert(interview).values({
  //   candidateId: isCandidate.id,
  //   isActive: true,
  //   attempt: 1,
  // });
  return { chunks: resumeChunks, resumeText };
};

export const InterviewService = {
  startInterview,
};
