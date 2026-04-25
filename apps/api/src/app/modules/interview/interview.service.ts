import { and, asc, eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { getVectorStore } from "../../../db/qdrant.js";
import { candidate, interview, question } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { ChatGroq } from "@langchain/groq";
import config from "../../../config/index.js";
import type { TUserRole } from "../../middlewares/validateUser.js";
import { UserRole } from "../user/user.constant.js";
import { AccessToken, WebhookReceiver } from "livekit-server-sdk";
import { GoogleGenAI, Modality } from "@google/genai";

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
    (i) => i.candidateId === isCandidate.id && i.isActive,
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

const getSingleInterview = async (
  userId: string,
  interviewId: string,
  userRole: TUserRole,
) => {
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
  if (userRole === UserRole.candidate && result?.candidate.userId !== userId) {
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
  userId: string,
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
  userId: string,
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
  userId: string,
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

const getGenAiAccessToken = async (
  payload: { resume: string; voice: string },
  userId: string,
  interviewId: string,
) => {
  // validate user and interview
  const isCandidateExists = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
    with: {
      user: true,
    },
  });
  if (!isCandidateExists) {
    throw new ApiError(404, "Candidate not found");
  }

  const isInterviewExists = await db.query.interview.findFirst({
    where: and(
      eq(interview.candidateId, isCandidateExists.id),
      eq(interview.isActive, true),
      eq(interview.id, interviewId),
    ),
  });
  if (!isInterviewExists) {
    throw new ApiError(404, "Active interview not found");
  }

  const ai = new GoogleGenAI({
    apiKey: config.google_genai_api_key!,
  });
  const expireTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute interview max
  const newSessionExpireTime = new Date(
    Date.now() + 1 * 60 * 1000,
  ).toISOString(); // Token burns if not used in 1 min
  const candidateName = isCandidateExists?.user?.name || "Candidate";
  const attemptNumber = isInterviewExists.attempt;
  const systemInstruction = `You are an experienced, empathetic, and highly realistic Hiring Manager at Styxflow. You are conducting a technical interview according to the candidate's resume skills. 

CANDIDATE CONTEXT:
- Name: ${candidateName}
- Resume/Background: ${payload.resume}
- This is attempt number ${attemptNumber} for the candidate, so they might be a bit nervous and under pressure to perform well. 
- Primary Focus of this Interview: Based on the candidate's resume, focus on assessing their skills and experience in the areas mentioned in their resume. If the resume mentions specific technologies, projects, or roles, tailor your questions to dive deeper into those areas. 

CRITICAL SPEECH & BEHAVIOR RULES:
1. **Sound Like a Real Human:** You are speaking aloud on a voice call, not writing an email. Use natural conversational fillers (e.g., "ummm", "uh", "hmm", "let's see", "right", "okay") to simulate human thought processes. 
2. **Use Their Name:** Naturally weave the candidate's name (${candidateName}) into the conversation occasionally, just like a real person would.
3. **Be Dynamic and Reactive:** DO NOT just read down a rigid list of questions. Actively listen. Acknowledge their previous answer before asking the next question (e.g., "Oh, that makes a lot of sense," or "Right, I've run into that issue before too. So how did you..."). 
4. **Ask Follow-ups Based on the Focus:** Base your questions heavily on the details the candidate just provided, while gently steering the conversation to cover the 'Primary Focus' areas mentioned above.
5. **Keep it Conversational and Brief:** Never monologue. Ask one clear, focused question at a time. Keep your turns concise so the candidate does most of the talking.
6. **Pause and Wait:** After asking each question, pause and wait for the candidate to respond. Do not rush into the next question. This simulates a real interview where the candidate needs time to think and answer. Ask the candidate if he/she is there after a long pause (e.g., more than 20 seconds) to keep them engaged.
6. **Dont rush and dont be robotic:** Remember, the goal is to create a realistic interview experience that helps the candidate perform their best while giving them a taste of what a real interview at Styxflow would be like. Pause in between lines to simulate natural conversation flow.

CRITICAL INTERVIEW PACING & WRAP UP:
1. You must ask exactly 4 technical questions based on the candidate's resume.
2. After the candidate answers the 4th question, you must say a polite goodbye (e.g., "Thank you for your time, we will be in touch!").
3. IMMEDIATELY after saying goodbye, you MUST use the \`end_interview\` tool to hang up the call. Do not ask any more questions.`;

  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: expireTime,
      newSessionExpireTime: newSessionExpireTime,
      // SECURITY: Lock the token so hackers cannot change the prompt or model!
      liveConnectConstraints: {
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: payload.voice,
              },
            },
          },
          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: "end_interview",
                  description:
                    "Triggers the system to disconnect the call. Use this ONLY when the interview is completely finished and you have said your goodbyes.",
                },
              ],
            },
          ],
        },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  });
  return { token };
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
  getGenAiAccessToken,
};
