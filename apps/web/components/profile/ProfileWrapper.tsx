"use client";

import { ICandidateProfile, IRecruiterProfile } from "@/types/user";
import CandidateProfile from "./CandidateProfile";
import RecruiterProfile from "./RecruiterProfile";

interface ProfileWrapperProps {
  data: ICandidateProfile | IRecruiterProfile;
}

const ProfileWrapper = ({ data }: ProfileWrapperProps) => {
  const isCandidate = data.user.role === "CANDIDATE";

  return (
    <div className="min-h-screen bg-cream pt-28 pb-12">
      <div className="container mx-auto px-6">
        {isCandidate ? (
          <CandidateProfile data={data as ICandidateProfile} />
        ) : (
          <RecruiterProfile data={data as IRecruiterProfile} />
        )}
      </div>
    </div>
  );
};

export default ProfileWrapper;
