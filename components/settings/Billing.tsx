"use client";

import type { Subscription } from "@prisma/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/react";

interface BillingProps {
  subscription: Subscription | null;
  isSubscribed: boolean;
}

const Billing = ({ subscription, isSubscribed }: BillingProps) => {
  const { mutate: getBillingPortalUrl, isPending } =
    trpc.subscription.getBillingPortalUrl.useMutation({
      onSuccess: ({ url }) => {
        window.location.href = url;
      },
      onError: (error) => {
        toast.error("定期購入の管理取得に失敗しました");
        console.error(error);
      },
    });

  const handleBillingPortal = () => {
    getBillingPortalUrl();
  };
  return (
    <div className="space-y-5">
      <div className="text-center text-xl font-bold">現在のプラン</div>
      <div>
        あなたは現在<strong>{isSubscribed ? "月額" : "無料"}</strong>
        プランを利用しています
      </div>
      {isSubscribed && subscription && (
        <div>
          {subscription?.cancelAtPeriodEnd
            ? `プランは${format(new Date(subscription.currentPeriodEnd!), "yyyy年MM月dd日 HH:mm")}にキャンセルされます。`
            : `プランは${format(new Date(subscription.currentPeriodEnd!), "yyyy年MM月dd日 HH:mm")}に更新されます。`}
        </div>
      )}
      <Button
        className="w-full"
        onClick={handleBillingPortal}
        disabled={isPending || !isSubscribed}
      >
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        定期購入の管理
      </Button>
    </div>
  );
};

export default Billing;
