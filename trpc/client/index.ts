import { httpBatchLink } from "@trpc/client";

import { createCaller } from "@/trpc/server";

//バックエンドtRPCクライアント
export const trpc = createCaller({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    }),
  ],
});
