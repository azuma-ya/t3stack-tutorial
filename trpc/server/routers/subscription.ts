import Stripe from "stripe";
import { z } from "zod";

import { getSubscription, updateSubscription } from "@/actions/subscription";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { privateProcedure, router } from "@/trpc/server/trpc";
import { TRPCError } from "@trpc/server";

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

interface CustomInvoice extends Stripe.Invoice {
  payment_intent: Stripe.PaymentIntent;
}

interface CustomSubscription extends Stripe.Subscription {
  latest_invoice: CustomInvoice;
}

export const subscriptionRouter = router({
  getPrices: privateProcedure.query(async () => {
    try {
      const prices = await stripe.prices.list({
        lookup_keys: ["monthly"],
        expand: ["data.product"],
      });

      return prices.data;
    } catch (error) {
      console.log(error);

      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "エラーが発生しました。",
        });
      }
    }
  }),
  getClientSecret: privateProcedure
    .input(
      z.object({
        priceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { priceId } = input;
        const user = await ctx.user;

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        if (user.name === null || user.email === null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが見つかりません",
          });
        }

        const { subscription } = await getSubscription({ userId: user.id });

        let customerId;

        if (subscription) {
          customerId = subscription.customerId;
        } else {
          const customer = await stripe.customers.create({
            name: user.name,
            email: user.email,
            metadata: { userId: user.id },
          });

          await prisma.subscription.create({
            data: {
              userId: user.id,
              customerId: customer.id,
            },
          });
        }

        let clientSecret;

        if (subscription?.status === "incomplete") {
          //未完了のサブスクリプションが存在する場合、そのサブスクリプションを取得
          const subscriptions = await stripe.subscriptions.retrieve(
            subscription.subscriptionId!,
          );

          //サブスクリプションの最新の請求書を取得
          const invoice = await stripe.invoices.retrieve(
            subscriptions.latest_invoice as string,
          );

          //PaymentIntentオブジェクトを取得
          const paymentIntent = await stripe.paymentIntents.retrieve(
            invoice.payment_intent as string,
          );

          //PaymentIntentオブジェクトからclient_secretを取得
          clientSecret = paymentIntent.client_secret;
        } else {
          //新規サブスクリプションを作成
          const subscriptions = (await stripe.subscriptions.create({
            customer: customerId as string,
            items: [
              {
                price: priceId,
              },
            ],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
            metadata: {
              userId: user.id,
            },
          })) as CustomSubscription;

          //サブスクリプション情報を更新
          await updateSubscription({
            subscription: subscriptions,
          });

          clientSecret =
            subscriptions.latest_invoice.payment_intent.client_secret;
        }

        if (!clientSecret) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "クライアントシークレットが取得できませんでした",
          });
        }

        return { clientSecret };
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました。",
          });
        }
      }
    }),
  getSubscriptionInfo: privateProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.user;

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ユーザーが見つかりません",
        });
      }

      const { subscription } = await getSubscription({ userId: user.id });

      if (!subscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "サブスクリプションが取得できませんでした",
        });
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.customerId,
        status: "active",
        expand: ["data.default_payment_method"],
      });

      return subscriptions;
    } catch (error) {
      console.log(error);

      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "エラーが発生しました。",
        });
      }
    }
  }),
  getBillingPortalUrl: privateProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await ctx.user;

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ユーザーが見つかりません",
        });
      }

      const { subscription } = await getSubscription({ userId: user.id });

      if (!subscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "サブスクリプションが取得できませんでした",
        });
      }

      const billingPortal = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      });

      return { url: billingPortal.url };
    } catch (error) {
      console.log(error);

      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "エラーが発生しました。",
        });
      }
    }
  }),
});
