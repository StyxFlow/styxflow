import { randomUUID } from "crypto";
import { db } from "../../../db/drizzle.js";
import { job, recruiter } from "../../../db/schema.js";
import type { IJob, IUser } from "../../../db/types.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../../errors/apiError.js";
import { getVectorStore } from "../../../db/qdrant.js";

const createJob = async (user: IUser, payload: IJob) => {
  const isRecruiterExists = await db
    .selectDistinct()
    .from(recruiter)
    .where(eq(recruiter.userId, user.id));
  if (isRecruiterExists.length === 0 || !isRecruiterExists[0]?.id) {
    throw new ApiError(400, "Only recruiters can create job postings.");
  }
  const result = await db
    .insert(job)
    .values({
      jobRole: payload.jobRole,
      jobDescription: payload.jobDescription,
      location: payload.location,
      salaryRange: payload?.salaryRange || null,
      jobType: payload.jobType,
      technologies: payload.technologies,
      additionalSkills: payload?.additionalSkills || [],
      education: payload?.education || null,
      experience: Number(payload?.experience) || null,
      recruiterId: isRecruiterExists[0].id,
    })
    .returning();

  return result;
};

export const getMyUploadedJobs = async (userId: string) => {
  const isRecruiterExists = await db.query.recruiter.findFirst({
    where: eq(recruiter.userId, userId),
  });
  if (!isRecruiterExists) {
    throw new ApiError(404, "Recruiter profile not found");
  }
  const jobs = await db.query.job.findMany({
    where: eq(job.recruiterId, isRecruiterExists.id),
  });
  return jobs;
};

const findEmployeesForJob = async (userId: string, jobId: string) => {
  const isJobExists = await db.query.job.findFirst({
    where: eq(job.id, jobId),
    with: {
      recruiter: true,
    },
  });
  if (!isJobExists) {
    throw new ApiError(404, "Job posting not found");
  }
  if (isJobExists.recruiter.userId !== userId) {
    throw new ApiError(
      403,
      "You are not authorized to view candidates for this job."
    );
  }

  const queryTextParts: string[] = [];
  if (isJobExists.jobRole) queryTextParts.push(`Role: ${isJobExists.jobRole}`);
  if (isJobExists.jobDescription)
    queryTextParts.push(`Description: ${isJobExists.jobDescription}`);
  if (isJobExists.technologies?.length) {
    queryTextParts.push(`Technologies: ${isJobExists.technologies.join(", ")}`);
  }
  if (isJobExists.additionalSkills?.length) {
    queryTextParts.push(
      `Additional skills: ${isJobExists.additionalSkills.join(", ")}`
    );
  }

  const queryText = queryTextParts.join("\n");

  const k = 50;

  const vectorStor = await getVectorStore();
  const matchedChunks = await vectorStor.similaritySearchWithScore(
    queryText,
    k
  );

  type Aggregate = {
    candidateId: string;
    bestScore: number; // highest similarity (if higher is better)
    avgScore: number;
    sumScore: number;
    count: number;
    topChunks: { text: string; score: number }[];
  };

  const perCandidate = new Map<string, Aggregate>();

  for (const [doc, score] of matchedChunks) {
    const candidateId = doc.metadata?.candidateId as string | undefined;
    if (!candidateId) continue;

    const existing = perCandidate.get(candidateId);
    const chunk = { text: doc.pageContent, score };

    if (!existing) {
      perCandidate.set(candidateId, {
        candidateId,
        bestScore: score,
        avgScore: score,
        sumScore: score,
        count: 1,
        topChunks: [chunk],
      });
    } else {
      const newSum = existing.sumScore + score;
      const newCount = existing.count + 1;
      const newBest = Math.max(existing.bestScore, score);

      // Keep top 3 chunks per candidate
      const updatedChunks = [...existing.topChunks, chunk]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      perCandidate.set(candidateId, {
        candidateId,
        bestScore: newBest,
        sumScore: newSum,
        count: newCount,
        avgScore: newSum / newCount,
        topChunks: updatedChunks,
      });
    }
  }
  const ranked = Array.from(perCandidate.values()).sort(
    (a, b) => b.bestScore - a.bestScore
  );

  return ranked;
};

const getSingleJob = async (userId: string, jobId: string) => {
  const isJobExists = await db.query.job.findFirst({
    where: eq(job.id, jobId),
    with: {
      recruiter: true,
    },
  });
  if (!isJobExists) {
    throw new ApiError(404, "Job posting not found");
  }
  if (isJobExists.recruiter.userId !== userId) {
    throw new ApiError(403, "You are not authorized to view this job posting.");
  }

  const { recruiter: _, ...jobWithoutRecruiter } = isJobExists;
  return jobWithoutRecruiter;
};

export const JobService = {
  createJob,
  getMyUploadedJobs,
  findEmployeesForJob,
  getSingleJob,
};
