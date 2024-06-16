import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      // eslint-disable-next-line
      async authorize(request: any) {
        if (!request.email || !request.password) {
          throw new Error("メールアドレスとパスワードが存在しません");
        }

        //ユーザーの取得
        const user = await prisma.user.findUnique({
          where: { email: request.email },
        });

        //ユーザーが存在しない場合はエラー
        if (!user || !user?.hashedPassword) {
          throw new Error("ユーザーが存在しません");
        }

        //パスワードが一致しない場合はエラー
        const isCorrectPassword = compareSync(
          request.password,
          user.hashedPassword,
        );

        if (!isCorrectPassword) {
          throw new Error("パスワードが一致しません");
        }

        return user;
      },
    }),
  ],
  //セッション設定
  session: {
    strategy: "jwt",
  },
});

//認証情報取得
export const getAuthSession = async () => {
  const session = await auth();

  if (!session || !session.user?.email) {
    return null;
  }

  const user = prisma.user.findFirst({
    where: { email: session.user.email },
  });

  return user;
};
