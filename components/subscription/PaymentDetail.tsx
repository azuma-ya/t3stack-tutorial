"use client";

import PaymentForm from "@/components/subscription/PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentDetailProps {
  clientSecret: string;
  name: string;
  email: string;
}

const PaymentDetail = ({ clientSecret, name, email }: PaymentDetailProps) => {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        borderRadius: "8px",
      },
    },
  };
  return (
    <div className="mx-auto max-w-[400px]">
      <div className="mb-5 text-center text-xl font-bold">
        クレジットカードでのお支払い
      </div>
      <Elements options={options} stripe={stripePromise}>
        <PaymentForm name={name} email={email} />
      </Elements>
    </div>
  );
};

export default PaymentDetail;
