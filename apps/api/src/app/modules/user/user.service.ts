import { eq } from "drizzle-orm";
import { db } from "../../../db/drizzle.js";
import { candidate, recruiter } from "../../../db/schema.js";
import { ApiError } from "../../errors/apiError.js";
import { addResumeToQueue } from "../../../queues/producer.js";
import { getVectorStore } from "../../../db/qdrant.js";

const uploadResume = async (userId: string, filePath: string) => {
  const isCandateExists = await db.query.candidate.findFirst({
    where: eq(candidate.userId, userId),
  });
  if (!isCandateExists) {
    throw new ApiError(404, "Candidate profile not found");
  }
  if (filePath) {
    const queueData = { filePath, candidateId: isCandateExists.id };
    await addResumeToQueue(JSON.stringify(queueData));
  }
};

const getMyProfile = async (userId: string, role: string) => {
  if (role === "CANDIDATE") {
    const profile = await db.query.candidate.findFirst({
      where: eq(candidate.userId, userId),
      with: {
        interview: true,
        user: true,
      },
    });
    if (!profile) {
      throw new ApiError(404, "Profile not found");
    }
    return profile;
  } else if (role === "RECRUITER") {
    const recruiterProfile = await db.query.recruiter.findFirst({
      where: eq(recruiter.userId, userId),
      with: {
        user: true,
        jobs: true,
      },
    });
    if (!recruiterProfile) {
      throw new ApiError(404, "Profile not found");
    }
    return recruiterProfile;
  } else {
    throw new ApiError(400, "User role is invalid");
  }
};

const getCandidateProfile = async (candidateId: string, userId: string) => {
  const isRecruiter = await db.query.recruiter.findFirst({
    where: eq(recruiter.userId, userId),
  });
  if (!isRecruiter) {
    throw new ApiError(403, "Access denied");
  }
  const profile = await db.query.candidate.findFirst({
    where: eq(candidate.id, candidateId),
    with: {
      user: true,
      interview: true,
    },
  });
  if (!profile) {
    throw new ApiError(404, "Candidate profile not found");
  }
  return profile;
};

export const UserService = {
  uploadResume,
  getMyProfile,
  getCandidateProfile,
};
