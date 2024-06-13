import { redirect } from "next/navigation";

import ResetPassword from "@/components/auth/ResetPassword";
import { getAuthSession } from "@/lib/auth";
import { trpc } from "@/trpc/client";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

const ResetPasswordPage = async ({ params }: ResetPasswordPageProps) => {
  const { token } = params;

  const user = await getAuthSession();

  if (user) {
    redirect("/");
  }

  const isVaild = await trpc.auth.getResetTokenValidity({ token });

  if (!isVaild) {
    redirect("/reset-password");
  }

  return <ResetPassword token={token} />;
};

export default ResetPasswordPage;
