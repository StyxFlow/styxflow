import { and, asc, eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate, interview, question } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { ChatGroq } from "@langchain/groq";
import config from "../../../config/index.js";

const createInterview = async (userId: string) => {
  const isCandidate = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandidate) {
    throw new ApiError(404, "Candidate profile not found");
  }
  const allInterviews = await db.query.interview.findMany({
    where: eq(interview.candidateId, isCandidate.id),
  });

  const isActiveInterview = allInterviews.find(
    (i) => i.candidateId === isCandidate.id && i.isActive
  );

  if (isActiveInterview) {
    throw new ApiError(400, "An active interview already exists");
  }
  const vectorStore = await getVectorStore();
  const resumeChunks = await vectorStore.similaritySearchWithScore("*", 20, {
    must: [{ key: "metadata.candidateId", match: { value: isCandidate.id } }],
  });

  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }

  const newInterview = await db
    .insert(interview)
    .values({
      candidateId: isCandidate.id,
      isActive: true,
      attempt: allInterviews.length + 1,
    })
    .returning();
  return { newInterview: newInterview[0] };
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

const finishInterview = async (userId: string, interviewId: string) => {
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

  const interviewQuestions = await db.query.question.findMany({
    where: eq(question.interviewId, interviewId),
    orderBy: [asc(question.createdAt)],
  });
  const previousQuestionsAndAnswers = interviewQuestions.map((q) => ({
    question: q.questionText,
    answer: q.answerText,
  }));
  const llm = new ChatGroq({
    apiKey: config.groq_api_key!,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });
  const response = await llm.invoke([
    {
      role: "system",
      content:
        "You are an interview evaluator. Based on the candidate's responses, provide a score out of 100 and constructive feedback to help them improve. Keep the feedback professional and encouraging.",
    },
    {
      role: "system",
      content: `send response in the following format: {"score": number between 0 and 100, "feedback": string with constructive feedback}`,
    },
    {
      role: "user",
      content: `Here are the candidate's responses:\n\n${JSON.stringify(previousQuestionsAndAnswers)}`,
    },
  ]);
  const content = response.content as string;
  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");
  const jsonString = content.slice(startIndex, endIndex + 1);
  const evaluation = JSON.parse(`${jsonString}`);
  const result = await db
    .update(interview)
    .set({
      isActive: false,
      score: evaluation?.score,
      feedback: evaluation?.feedback,
      isCompleted: true,
    })
    .where(eq(interview.id, interviewId))
    .returning();
  return result[0];
};

const getSingleInterview = async (userId: string, interviewId: string) => {
  const result = await db.query.interview.findFirst({
    where: eq(interview.id, interviewId),
    with: {
      candidate: true,
      question: true,
    },
  });
  if (!result) {
    throw new ApiError(404, "Interview not found");
  }
  if (result?.candidate.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to this interview");
  }
  return result;
};

const getCandidateResume = async (userId: string) => {
  const isCandidateExists = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandidateExists) {
    throw new ApiError(404, "Interview not found");
  }
  const vectorStore = await getVectorStore();
  const resumeChunks = await vectorStore.similaritySearchWithScore("*", 20, {
    must: [
      {
        key: "metadata.candidateId",
        match: { value: isCandidateExists.id },
      },
    ],
  });

  if (resumeChunks.length === 0) {
    throw new ApiError(404, "No resume found for the candidate");
  }
  const resumeText = resumeChunks
    .sort((a, b) => a[0].metadata.chunkIndex - b[0].metadata.chunkIndex)
    .map((chunk) => chunk[0].pageContent)
    .join("\n");
  return { resume: resumeText };
};

const saveQuestion = async (
  payload: {
    questionText: string;
    answerText: string;
    interviewId: string;
  },
  userId: string
) => {
  const isInterviewExists = await db.query.interview.findFirst({
    where: eq(interview.id, payload.interviewId),
    with: {
      candidate: true,
    },
  });
  if (!isInterviewExists) {
    throw new ApiError(404, "Interview not found");
  }
  if (!isInterviewExists.isActive) {
    throw new ApiError(400, "Cannot save question to an inactive interview");
  }
  if (isInterviewExists.candidate.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to this interview");
  }
  const result = await db.insert(question).values({
    interviewId: payload.interviewId,
    questionText: payload.questionText,
    answerText: payload.answerText,
  });
  return result;
};

const evaluateInterview = async (
  payload: {
    transcript: string;
    interviewId: string;
  },
  userId: string
) => {
  const isInterviewExists = await db.query.interview.findFirst({
    where: eq(interview.id, payload.interviewId),
    with: {
      candidate: true,
    },
  });
  if (!isInterviewExists) {
    throw new ApiError(404, "Interview not found");
  }
  if (!isInterviewExists.isActive) {
    throw new ApiError(400, "Cannot save question to an inactive interview");
  }
  if (isInterviewExists.candidate.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to this interview");
  }

  const llm = new ChatGroq({
    apiKey: config.groq_api_key!,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  const response = await llm.invoke([
    {
      role: "system",
      content:
        "You are an interview evaluator. Based on the candidate's responses, provide a score out of 100 and constructive feedback to help them improve. Keep the feedback professional and encouraging. If there is no user response in the transcript, give a score of 0 and feedback indicating that candidate have not provided any response.",
    },
    {
      role: "system",
      content: `send response in the following format: {"score": number between 0 and 100, "feedback": string with constructive feedback}`,
    },
    {
      role: "user",
      content: `Here is the transcript for the interview:\n\n${payload.transcript}`,
    },
  ]);
  const content = response.content as string;
  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");
  const jsonString = content.slice(startIndex, endIndex + 1);
  const evaluation = JSON.parse(`${jsonString}`);
  const result = await db
    .update(interview)
    .set({
      isActive: false,
      score: evaluation?.score,
      feedback: evaluation?.feedback,
      isCompleted: true,
    })
    .where(eq(interview.id, payload.interviewId))
    .returning();
  return result[0];
};

const saveRecordingUrl = async (
  interviewId: string,
  recordingUrl: string,
  userId: string
) => {
  const isInterviewExists = await db.query.interview.findFirst({
    where: eq(interview.id, interviewId),
    with: {
      candidate: true,
    },
  });
  if (!isInterviewExists) {
    throw new ApiError(404, "Interview not found");
  }
  if (isInterviewExists.candidate.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to this interview");
  }
  const result = await db
    .update(interview)
    .set({
      recordingUrl,
    })
    .where(eq(interview.id, interviewId))
    .returning();
  if (!result[0]) {
    throw new ApiError(500, "Failed to save recording URL");
  }
};

export const InterviewService = {
  createInterview,
  getMyInterviews,
  finishInterview,
  getSingleInterview,
  getCandidateResume,
  saveQuestion,
  evaluateInterview,
  saveRecordingUrl,
};
