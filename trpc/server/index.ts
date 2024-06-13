import { authRouter } from "@/trpc/server/routers/auth";
import { commentRouter } from "@/trpc/server/routers/comment";
import { postRouter } from "@/trpc/server/routers/post";
import { userRouter } from "@/trpc/server/routers/user";
import { createCallerFactory, router } from "@/trpc/server/trpc";

//ルーターの作成
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
});

//ルーターの型定義
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
