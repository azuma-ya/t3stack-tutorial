import Stripe from "stripe";

import prisma from "@/lib/prisma";

const DAY_IN_MS = 86_400_00;

export const getSubscription = async ({
  userId,
}: {
  userId: string | undefined;
}) => {
  try {
    if (!userId) {
      return { subscription: null, isSubscribed: false };
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      return { subscription: null, isSubscribed: false };
    }

    const isSubscribed =
      subscription.status == "active" &&
      subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return { subscription, isSubscribed };
  } catch (error) {
    console.error(error);
    return { subscription: null, isSubscribed: false };
  }
};

export const updateSubscription = async ({
  subscription,
}: {
  subscription: Stripe.Subscription;
}) => {
  try {
    await prisma.subscription.update({
      where: { customerId: subscription.customer as string },
      data: {
        status: subscription.status,
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
