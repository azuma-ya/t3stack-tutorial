import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { updateSubscription } from "@/actions/subscription";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    // eslint-disable-next-line
  } catch (error: any) {
    return new NextResponse(`Webhookにエラーが発生しました: ${error.message}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  let subscription: Stripe.Subscription;

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded":
      subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await updateSubscription({
        subscription,
      });
      break;

    case "customer.subscription.updated":
      subscription = await stripe.subscriptions.retrieve(session.id as string);

      await updateSubscription({
        subscription,
      });
      break;
  }
  return new NextResponse("OK", { status: 200 });
}
