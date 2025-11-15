import { and, eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate, interview } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { ChatGroq } from "@langchain/groq";
import config from "../../../config/index.js";

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
  console.log(resumeChunks.length);

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

const conductInterview = async (userId: string, interviewId: string) => {
  const isInterviewExists = await db.query.interview.findFirst({
    where: eq(interview.id, interviewId),
    with: {
      candidate: true,
    },
  });
  if (!isInterviewExists) {
    throw new ApiError(404, "Interview not found");
  }
  if (isInterviewExists?.candidate.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to this interview");
  }

  // ask questions logic goes here
  const vectorStore = await getVectorStore();
  const resumeChunks = await vectorStore.similaritySearchWithScore("*", 20, {
    must: [
      {
        key: "metadata.candidateId",
        match: { value: isInterviewExists.candidate.id },
      },
    ],
  });

  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }
  console.log(resumeChunks.length);
  const resumeText = resumeChunks
    .sort((a, b) => a[0].metadata.chunkIndex - b[0].metadata.chunkIndex)
    .map((chunk) => chunk[0].pageContent)
    .join("\n");

  const llm = new ChatGroq({
    apiKey: config.groq_api_key!,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  const response = await llm.invoke([
    {
      role: "system",
      content: `The candidate's resume is as follows:\n\n${resumeText}`,
    },
    {
      role: "system",
      content:
        "You are an interview assistant. Ask the candidate one question at a time based on their resume and previous answers. You are going to send only the text candidate is going to see. Do not include any other text. Keep the interview professional and relevant to the candidate's background. Make it engaging and thought-provoking. Keep conversation flowing naturally. Start with a brief introduction and then proceed to ask the first question. If the interview has already started, ask the next question based on previous answers. Start with greeting the candidate. ",
    },
  ]);
  return { question: response.content };
};

export const InterviewService = {
  startInterview,
  conductInterview,
  getMyInterviews,
};
