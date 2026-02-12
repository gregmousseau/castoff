import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "payment_intent.amount_capturable_updated": {
      // Payment has been authorized, waiting for capture
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment authorized:", paymentIntent.id);
      console.log("Metadata:", paymentIntent.metadata);

      // TODO: Store booking in database
      // TODO: Send notification to operator (SMS/WhatsApp/Email)
      // For now, just log it
      const { operatorSlug, date, slot, customerName, customerPhone } = paymentIntent.metadata;
      console.log(`New booking request:
        Operator: ${operatorSlug}
        Date: ${date}
        Slot: ${slot}
        Customer: ${customerName}
        Phone: ${customerPhone}
        Amount: $${paymentIntent.amount_capturable / 100}
      `);
      break;
    }

    case "payment_intent.succeeded": {
      // Payment was captured (owner confirmed)
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment captured:", paymentIntent.id);
      // TODO: Update booking status to confirmed
      // TODO: Send confirmation to customer
      break;
    }

    case "payment_intent.canceled": {
      // Payment was canceled (owner declined or timeout)
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment canceled:", paymentIntent.id);
      // TODO: Update booking status to declined
      // TODO: Notify customer that booking was declined
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout completed:", session.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
