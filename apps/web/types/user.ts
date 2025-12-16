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
export interface ICandidateProfile {
  address: string;
  interview: IInterview[];
  user: IUser;
}

// Profile data for Recruiter
export interface IRecruiterProfile {
  jobs: IJob[];
  user: IUser;
  organizationName: string;
  organizationRole: string;
}

// Union type for profile data
export type IProfileData = ICandidateProfile | IRecruiterProfile;
