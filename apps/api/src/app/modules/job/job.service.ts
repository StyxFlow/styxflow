import { randomUUID } from "crypto";
import { db } from "../../../db/drizzle.js";
import { job, recruiter } from "../../../db/schema.js";
import type { IJob, IUser } from "../../../db/types.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../../errors/apiError.js";

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

export const JobService = {
  createJob,
};
