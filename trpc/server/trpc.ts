import { getAuthSession } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";

//tRPCの初期化
const t = initTRPC.create();

//middlewareでログインユーザーの取得
export const authMIddleware = t.middleware(async ({ next }) => {
  const user = getAuthSession();

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: { user },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(authMIddleware);
export const createCallerFactory = t.createCallerFactory;
