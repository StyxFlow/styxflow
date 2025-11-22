import { and, asc, eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate, interview, question } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { ChatGroq } from "@langchain/groq";
import config from "../../../config/index.js";
import { geminiTTS } from "../../../agents/gemini.js";
import { convertTextToSpeech } from "../../../agents/awsPolly.js";

const startInterview = async (userId: string) => {
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
  return { chunks: resumeChunks, newInterview: newInterview[0] };
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

const conductInterview = async (
  userId: string,
  interviewId: string,
  payload: { userResponse: string; voiceId: string; LanguageCode: string }
) => {
  const isInterviewExists = await db.query.interview.findFirst({
    where: and(eq(interview.id, interviewId), eq(interview.isActive, true)),
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
  const resumeText = resumeChunks
    .sort((a, b) => a[0].metadata.chunkIndex - b[0].metadata.chunkIndex)
    .map((chunk) => chunk[0].pageContent)
    .join("\n");

  // const checkpointer = new MemorySaver();

  const interviewQuestions = await db.query.question.findMany({
    where: eq(question.interviewId, interviewId),
    orderBy: [asc(question.createdAt)],
  });
  if (interviewQuestions.length > 0) {
    const id = interviewQuestions[interviewQuestions.length - 1]?.id;
    await db
      .update(question)
      .set({
        answerText: payload.userResponse,
      })
      .where(eq(question.id, id as string));
  }
  const previousQuestionsAndAnswers = interviewQuestions.map((q) => ({
    question: q.questionText,
    answer: q.answerText,
  }));
  if (previousQuestionsAndAnswers.length > 0) {
    previousQuestionsAndAnswers[
      previousQuestionsAndAnswers.length - 1
    ]!.answer = payload.userResponse;
  }

  const llm = new ChatGroq({
    apiKey: config.groq_api_key!,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });
  const numberOfQuestions = 2;

  const response = await llm.invoke([
    {
      role: "system",
      content: `The candidate's resume is as follows:\n\n${resumeText}`,
    },
    {
      role: "system",
      content:
        "You are an interview assistant. Ask the candidate based on their resume and previous answers. You are going to send only the text candidate is going to listen. Do not include any other text. Keep the interview professional and relevant to the candidate's background. Make it engaging and thought-provoking. Keep conversation flowing naturally. Start with a brief introduction and then proceed to ask the first question. If the interview has already started, ask the next question based on previous answers. Start with greeting the candidate. Also ask questions that allow the candidate to showcase their skills and experiences effectively. Ask questions that are open-ended and encourage detailed responses. Avoid simple yes/no questions. Ensure that each question builds upon the candidate's previous answers to create a coherent and engaging interview experience. Continue the interview accordingly if it has already started. ",
    },
    {
      role: "system",
      content: `Interview already started: ${previousQuestionsAndAnswers.length > 0}`,
    },
    {
      role: "system",
      content: `questions asked so far:${previousQuestionsAndAnswers.length}. End the interview after asking  ${numberOfQuestions} questions. At the end of the interview, thank the candidate for their time and provide a brief overview of the next steps in the hiring process. Also Give candidate a score out of 100 based on their responses and provide constructive feedback at the end of the interview. `,
    },
    {
      role: "system",
      content: `dont ask more than ${numberOfQuestions} questions in total. If you have already asked ${numberOfQuestions} questions, end the interview with a thank you message, next steps, score out of 100 and constructive feedback.`,
    },
    {
      role: "system",
      content: `Ask only one question at a time. Wait for the candidate's response before asking the next question.`,
    },
    {
      role: "system",
      content: `to end an interview, send the response in the following json format: {"endInterview": true, "response": "your closing message here which the candidate going to see", "score": number between 0 and 100, "feedback": "constructive feedback here"}`,
    },
    {
      role: "user",
      content: `Previous questions and answers:\n\n${JSON.stringify(previousQuestionsAndAnswers)}`,
    },
  ]);
  if (
    !response.content ||
    (response.content as string).includes('"endInterview": true')
  ) {
    try {
      const content = response.content as string;
      const startIndex = content.indexOf("{");
      const endIndex = content.lastIndexOf("}");
      const jsonString = content.slice(startIndex, endIndex + 1);
      const evaluation = JSON.parse(`${jsonString}`);
      if (evaluation?.endInterview) {
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

        return { interview: result[0], question: evaluation.response };
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  }
  const wavBase64 = await convertTextToSpeech(response.content as string, {
    voiceId: payload.voiceId,
    LanguageCode: payload.LanguageCode,
  });

  await db.insert(question).values({
    interviewId,
    questionText: response.content as string,
  });
  const mimeType = "audio/mp3";
  return {
    question: response.content,
    wavFile: wavBase64,
    mimeType,
  };
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

export const InterviewService = {
  startInterview,
  conductInterview,
  getMyInterviews,
  finishInterview,
  getSingleInterview,
};
