"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type Stripe from "stripe";

interface PaymentProps {
  prices: Stripe.Price[];
}

const Payment = ({ prices }: PaymentProps) => {
  const router = useRouter();

  const { mutate: getClientSecret, isPending } =
    trpc.subscription.getClientSecret.useMutation({
      onSuccess: ({ clientSecret }) => {
        router.push(`/payment/${clientSecret}`);
      },
      onError: (error) => {
        toast.error("申し込みに失敗しました");
        console.error(error);
      },
    });

  const handlePayment = (priceId: string) => {
    getClientSecret({ priceId });
  };
  return (
    <div>
      <div className="mb-10 text-center text-2xl font-bold">有料会員に登録</div>
      <div className="m-auto max-w-[500px]">
        {prices.map((price) => (
          <div
            key={price.id}
            className="space-y-5 rounded-md border px-5 py-10"
          >
            <div className="text-center text-2xl font-bold">
              {(price.product as Stripe.Product).name}
            </div>
            <div className="flex items-end justify-center space-x-1">
              <div className="text-3xl font-bold">
                {price.unit_amount!.toLocaleString()}
              </div>
              <div>円/月(税込み)</div>
            </div>
            <Button
              className="w-full"
              variant="premium"
              onClick={() => handlePayment(price.id)}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              申し込む
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payment;
