import { IInterview } from "./interview";
import { IJob } from "./job";

export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: TUSerRole;
  createdAt: string;
  updatedAt: string;
  image: string | null;
}

export type TUSerRole = "RECRUITER" | "CANDIDATE";

// Profile data for Candidate
export interface ICandidate {
  address: string;
  interview: IInterview[];
  userId: string;
  id: string;
  user: IUser;
  createdAt: string;
  updatedAt: string;
}

// Profile data for Recruiter
export interface IRecruiter {
  id: string;
  jobs: IJob[];
  userId: string;
  user: IUser;
  organizationName: string;
  organizationRole: string;
  createdAt: string;
  updatedAt: string;
}

// Union type for profile data
export type IProfileData = ICandidate | IRecruiter;
