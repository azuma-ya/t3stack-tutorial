import { TRPCError } from "@trpc/server";
import { extractPublicId } from "cloudinary-build-url";
import { z } from "zod";

import { createCloudImage, deleteCloudImage } from "@/actions/cloudImage";
import prisma from "@/lib/prisma";
import { privateProcedure, publicProcedure, router } from "@/trpc/server/trpc";

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

export const userRouter = router({
  updateUser: privateProcedure
    .input(
      z.object({
        name: z.string(),
        introduction: z.string().optional(),
        base64Image: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, introduction, base64Image } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        let image_url;

        if (base64Image) {
          if (user.image) {
            const publicId = extractPublicId(user.image);
            await deleteCloudImage(publicId);
          }

          image_url = await createCloudImage(base64Image);
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name,
            introduction,
            ...(image_url && { image: image_url }),
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "プロフィール編集に失敗しました",
          });
        }
      }
    }),
  getUserByIdPost: publicProcedure
    .input(
      z.object({ userId: z.string(), limit: z.number(), offset: z.number() }),
    )
    .query(async ({ input }) => {
      try {
        const { userId, limit, offset } = input;

        if (!userId) {
          return { user: null, totalPosts: 0 };
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            posts: {
              skip: offset,
              take: limit,
              orderBy: {
                updatedAt: "desc",
              },
            },
          },
        });

        if (!user) {
          return { user: null, totalPosts: 0 };
        }

        const totalPosts = await prisma.post.count({
          where: { userId },
        });

        return { user, totalPosts };
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ユーザー投稿詳細の取得に失敗しました",
          });
        }
      }
    }),
});
