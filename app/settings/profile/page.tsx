import Profile from "@/components/settings/Profile";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/");
  }
  return <Profile user={user} />;
};

export default ProfilePage;
