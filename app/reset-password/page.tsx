import { redirect } from "next/navigation";

import ForgotPassword from "@/components/auth/ForgotPassword";
import { getAuthSession } from "@/lib/auth";

const ForgotPasswordPage = async () => {
  const user = await getAuthSession();

  if (user) {
    redirect("/");
  }
  return <ForgotPassword />;
};

export default ForgotPasswordPage;
