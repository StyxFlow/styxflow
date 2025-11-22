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
