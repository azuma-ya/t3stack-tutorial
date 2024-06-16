import { TRPCError } from "@trpc/server";
import { extractPublicId } from "cloudinary-build-url";
import { z } from "zod";

import { createCloudImage, deleteCloudImage } from "@/actions/cloudImage";
import prisma from "@/lib/prisma";
import { privateProcedure, publicProcedure, router } from "@/trpc/server/trpc";

export const postRouter = router({
  createPost: privateProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        base64Image: z.string().optional(),
        premium: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { title, content, base64Image, premium } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        if (!user.isAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "投稿権限がありません",
          });
        }

        let image_url;

        if (base64Image) {
          image_url = await createCloudImage(base64Image);
        }

        const post = await prisma.post.create({
          data: {
            userId: user.id,
            title,
            content,
            image: image_url,
            premium: premium,
          },
        });

        return post;
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "投稿に失敗しました",
          });
        }
      }
    }),
  getPosts: publicProcedure
    .input(z.object({ limit: z.number(), offset: z.number() }))
    .query(async ({ input }) => {
      try {
        const { limit, offset } = input;

        const posts = await prisma.post.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        const totalPosts = await prisma.post.count();

        return { posts, totalPosts };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "投稿一覧取得に失敗しました",
        });
      }
    }),
  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { postId } = input;
      try {
        const post = await prisma.post.findUnique({
          where: {
            id: postId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        return post;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "投稿一覧取得に失敗しました",
        });
      }
    }),
  updatePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        title: z.string(),
        content: z.string(),
        base64Image: z.string().optional(),
        premium: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { postId, title, content, base64Image, premium } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        if (!user.isAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "管理者権限がありません",
          });
        }

        let image_url;

        if (base64Image) {
          const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          });

          if (!post) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "投稿が見つかりません",
            });
          }

          if (user.id !== post.user.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "投稿の編集権限がありません",
            });
          }

          if (post.image) {
            const publicId = extractPublicId(post.image);
            await deleteCloudImage(publicId);
          }

          image_url = await createCloudImage(base64Image);
        }

        const post = await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            title,
            content,
            premium,
            ...(image_url && { image: image_url }),
          },
        });

        return post;
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "投稿に失敗しました",
          });
        }
      }
    }),
  deletePost: privateProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { postId } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        const post = await prisma.post.findUnique({
          where: { id: postId },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!post) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "記事が見つかりません",
          });
        }

        if (user.id !== post.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "記事の削除権限がありません",
          });
        }

        if (post.image) {
          const publicId = extractPublicId(post.image);
          await deleteCloudImage(publicId);
        }

        await prisma.post.delete({
          where: {
            id: postId,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "投稿に失敗しました",
          });
        }
      }
    }),
});
