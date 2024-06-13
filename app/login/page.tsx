import { redirect } from "next/navigation";

import Login from "@/components/auth/Login";
import { getAuthSession } from "@/lib/auth";

const LoginPage = async () => {
  const user = await getAuthSession();

  if (user) {
    redirect("/");
  }

  return <Login />;
};

export default LoginPage;
