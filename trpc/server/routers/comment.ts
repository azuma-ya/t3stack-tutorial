import { TRPCError } from "@trpc/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { privateProcedure, publicProcedure, router } from "@/trpc/server/trpc";

export const commentRouter = router({
  createComment: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { postId, content } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        const comment = await prisma.comment.create({
          data: {
            userId: user.id,
            content,
            postId,
          },
        });

        return comment;
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
  getComments: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        postId: z.string(),
        limit: z.number(),
        offset: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { userId, postId, limit, offset } = input;
      try {
        const comments = await prisma.comment.findMany({
          where: {
            postId,
          },
          skip: offset,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            likes: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

        const commentsWithLikesStatus = comments.map((comment) => {
          const userLike = userId
            ? comment.likes.find((like) => like.userId === userId)
            : null;
          return {
            ...comment,
            hasLiked: !!userLike,
            commentLikeId: userLike ? userLike.id : null,
          };
        });

        const totalComments = await prisma.comment.count({
          where: { postId },
        });

        return { comments: commentsWithLikesStatus, totalComments };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "投稿一覧取得に失敗しました",
        });
      }
    }),
  getCommentById: publicProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { commentId } = input;

        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
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

        return comment;
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "コメントの取得に失敗しました",
          });
        }
      }
    }),
  updateComment: privateProcedure
    .input(z.object({ commentId: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { commentId, content } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId,
          },
        });

        if (!comment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントが見つかりませんでした",
          });
        }

        if (user.id !== comment.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントの編集権限がありません",
          });
        }

        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            content,
          },
        });

        return comment;
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "編集に失敗しました",
          });
        }
      }
    }),
  deleteComment: privateProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { commentId } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId,
          },
        });

        if (!comment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントが見つかりませんでした",
          });
        }

        if (user.id !== comment.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントの編集権限がありません",
          });
        }

        await prisma.comment.delete({
          where: {
            id: commentId,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "削除に失敗しました",
          });
        }
      }
    }),
  createCommentLike: privateProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { commentId } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        await prisma.commentLike.create({
          data: {
            userId: user.id,
            commentId,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "削除に失敗しました",
          });
        }
      }
    }),
  deleteCommentLike: privateProcedure
    .input(z.object({ commentLikeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { commentLikeId } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        await prisma.commentLike.delete({
          where: {
            id: commentLikeId,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "削除に失敗しました",
          });
        }
      }
    }),
});
