import { redirect } from "next/navigation";

import Signup from "@/components/auth/Signup";
import { getAuthSession } from "@/lib/auth";

const SignupPage = async () => {
  const user = await getAuthSession();

  if (user) {
    redirect("/");
  }
  return <Signup />;
};

export default SignupPage;
