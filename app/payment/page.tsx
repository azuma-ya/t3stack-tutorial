import { redirect } from "next/navigation";

import { getSubscription } from "@/actions/subscription";
import Payment from "@/components/subscription/Payment";
import { getAuthSession } from "@/lib/auth";
import { trpc } from "@/trpc/client";

const PaymentPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const { isSubscribed } = await getSubscription({ userId: user?.id });

  if (isSubscribed) {
    redirect("/setting/billing");
  }

  const prices = await trpc.subscription.getPrices();

  return <Payment prices={prices} />;
};

export default PaymentPage;
