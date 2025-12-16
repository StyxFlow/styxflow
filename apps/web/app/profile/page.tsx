import { getProfile } from "@/services/users";

const ProfilePage = async () => {
  const profile = await getProfile();
  console.log(profile);
  return <div></div>;
};

export default ProfilePage;
