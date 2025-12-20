"use client";

import { ICandidate, IRecruiter } from "@/types/user";
import CandidateProfile from "./CandidateProfile";
import RecruiterProfile from "./RecruiterProfile";

interface ProfileWrapperProps {
  data: ICandidate | IRecruiter;
}

const ProfileWrapper = ({ data }: ProfileWrapperProps) => {
  const isCandidate = data.user.role === "CANDIDATE";

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-cream pt-28 pb-12">
      <div className="container mx-auto px-6">
        {isCandidate ? (
          <CandidateProfile data={data as ICandidate} />
        ) : (
          <RecruiterProfile data={data as IRecruiter} />
        )}
      </div>
    </div>
  );
};

export default ProfileWrapper;
