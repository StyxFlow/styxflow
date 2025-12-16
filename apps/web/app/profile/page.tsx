import { getProfile } from "@/services/users";
import ProfileWrapper from "@/components/profile/ProfileWrapper";
import { ICandidateProfile, IRecruiterProfile } from "@/types/user";

const ProfilePage = async () => {
  const profile = await getProfile();
  const data = profile?.data as ICandidateProfile | IRecruiterProfile;

  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-cream pt-28 flex items-center justify-center">
        <p className="text-gray-500">Unable to load profile</p>
      </div>
    );
  }

  return <ProfileWrapper data={data} />;
};

export default ProfilePage;
