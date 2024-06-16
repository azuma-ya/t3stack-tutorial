import Success from "@/components/subscription/Success";
import { getAuthSession } from "@/lib/auth";
import { trpc } from "@/trpc/client";
import { redirect } from "next/navigation";

const SuccessPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const subscriptions = await trpc.subscription.getSubscriptionInfo();

  return <Success subscriptions={subscriptions.data} />;
};

export default SuccessPage;
