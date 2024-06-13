import { TRPCError } from "@trpc/server";

import { sendEmail } from "@/actions/sendEmail";
import prisma from "@/lib/prisma";

interface sendResetPasswordOptions {
  userId: string;
}

export const sendResetPassword = async ({
  userId,
}: sendResetPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ユーザーが見つかりません",
    });
  }

  const subject = "パスワード再設定完了のご案内";

  const body = `
    <div>
      <p>
        ご利用ありがとうございます。<br />
        あなたのアカウントでパスワード再設定が完了しました。
      </p>
    </div>
  `;

  await sendEmail(subject, body, user.email);
};
