import CandidateProfile from "@/components/profile/CandidateProfile";
import { FetchFailed } from "@/components/shared/FetchFailed";
import { getCandidateProfile } from "@/services/users";

const CandidateProfilePage = async ({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) => {
  const { candidateId } = await params;
  const data = await getCandidateProfile(candidateId);
  console.log(data);
  const candidate = data?.data;
  if (!candidate) {
    return <FetchFailed />;
  }

  return (
    <div className="min-h-screen lg:max-w-[75vw] md:max-w-[85vw] max-w-full mx-auto p-4 pt-28">
      <CandidateProfile data={candidate} />
    </div>
  );
};

export default CandidateProfilePage;
