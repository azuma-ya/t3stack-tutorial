import { redirect } from "next/navigation";

import Password from "@/components/settings/Password";
import { getAuthSession } from "@/lib/auth";

const PasswordPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/");
  }
  return <Password />;
};

export default PasswordPage;
