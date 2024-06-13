import { TRPCError } from "@trpc/server";

import { sendEmail } from "@/actions/sendEmail";
import prisma from "@/lib/prisma";

interface sendForgotPasswordOptions {
  userId: string;
}

export const sendForgotPassword = async ({
  userId,
}: sendForgotPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      PasswordResetToken: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user || !user.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ユーザーが見つかりません",
    });
  }

  const token = user.PasswordResetToken[0].token;

  const resetPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  const subject = "パスワード再設定のご案内";

  const body = `
    <div>
      <p>
        ご利用ありがとうございます。<br />
        あなたのアカウントでパスワード再設定のリクエストがありました。
      </p>

      <p><a href=${resetPasswordLink}>パスワードの再設定を行う</a></p>

      <p>このリンクの有効期限は24時間です。</p>
      <p>このメールに覚えのない場合は、このメールを無視するか削除して頂けますようお願いします。</p>
    </div>
  `;

  await sendEmail(subject, body, user.email);
};
