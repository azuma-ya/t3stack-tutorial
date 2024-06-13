import { TRPCError } from "@trpc/server";
import { compareSync, hashSync } from "bcrypt-ts";
import crypto from "crypto";
import { z } from "zod";

import { sendForgotPassword } from "@/actions/sendForgotPassword";
import { sendResetPassword } from "@/actions/sendResetPassword";
import prisma from "@/lib/prisma";
import { privateProcedure, publicProcedure, router } from "@/trpc/server/trpc";

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

//ログインユーザーの取得
export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { name, email, password } = input;

        //メールアドレスの重複をチェック
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "既に登録されているメールアドレスです",
          });
        }

        const hashedPassword = hashSync(password, 12);

        await prisma.user.create({
          data: {
            email,
            name,
            hashedPassword,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          });
        }
      }
    }),
  updatePassword: privateProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { currentPassword, password } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        if (!user.hashedPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "パスワードが設定されていません",
          });
        }

        //設定されているパスワードとパスワードが違う場合はエラー
        const isCurrentPasswordVaild = compareSync(
          currentPassword,
          user.hashedPassword,
        );

        if (!isCurrentPasswordVaild) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "現在のパスワードが間違っています",
          });
        }

        //新しいパスワードと現在のパスワードが同じ場合はエラー
        const isSamePassword = compareSync(password, user.hashedPassword);

        if (isSamePassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "現在のパスワードと新しいパスワードが同じです。別のパスワードを設定してください",
          });
        }

        const hashedNewPassword = hashSync(password, 12);

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            hashedPassword: hashedNewPassword,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          });
        }
      }
    }),
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { email } = input;

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        //トークンの検索
        const existingToken = await prisma.passwordResetToken.findFirst({
          where: {
            userId: user.id,
            expiry: {
              gt: new Date(),
            },
            createdAt: {
              gt: new Date(Date.now() - ONE_HOUR),
            },
          },
        });

        if (existingToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "既にパスワード再設定用のメールをお送りしました。1時間後に再度お試しください",
          });
        }

        const token = crypto.randomBytes(18).toString("hex");

        await prisma.passwordResetToken.create({
          data: {
            token,
            expiry: new Date(Date.now() + ONE_DAY),
            userId: user.id,
          },
        });

        await sendForgotPassword({
          userId: user.id,
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          });
        }
      }
    }),
  getResetTokenValidity: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { token } = input;

        const foundToken = await prisma.passwordResetToken.findFirst({
          where: {
            token,
          },
          select: {
            id: true,
            expiry: true,
          },
        });

        return !!foundToken && foundToken.expiry > new Date();
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          });
        }
      }
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { token, password } = input;

        const foundToken = await prisma.passwordResetToken.findFirst({
          where: {
            token,
          },
          include: {
            User: true,
          },
        });

        if (!foundToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "無効なトークンです。再度パスワード再設定を行ってください",
          });
        }

        const now = new Date();

        if (now > foundToken.expiry) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "トークンの期限が切れています。再度パスワード再設定を行ってください",
          });
        }

        //新しいパスワードと現在のパスワードが同じ場合はエラー
        const isSamePassword = compareSync(
          password,
          foundToken.User.hashedPassword || "",
        );

        if (isSamePassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "現在のパスワードと新しいパスワードが同じです。別のパスワードを設定してください",
          });
        }

        if (isSamePassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "現在のパスワードと同じパスワードは使用できません",
          });
        }

        const hashedPassword = hashSync(password, 12);

        await prisma.$transaction([
          prisma.user.update({
            where: {
              id: foundToken.userId,
            },
            data: {
              hashedPassword,
            },
          }),
          prisma.passwordResetToken.deleteMany({
            where: {
              userId: foundToken.userId,
            },
          }),
        ]);

        await sendResetPassword({ userId: foundToken.userId });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          });
        }
      }
    }),
});
