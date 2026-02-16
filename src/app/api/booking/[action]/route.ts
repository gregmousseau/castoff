import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const body = await request.json();
  const { paymentIntentId } = body;

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "Missing paymentIntentId" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    
    if (action === "confirm") {
      // Capture the authorized payment
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Booking confirmed! Deposit has been captured.",
      });
    } else if (action === "decline") {
      // Cancel the authorization (no charge)
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Booking declined. Authorization has been released.",
      });
    } else if (action === "release-deposit") {
      // Release a security deposit hold (cancel the auth)
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Security deposit hold has been released.",
      });
    } else if (action === "capture-deposit") {
      // Capture a security deposit (damage claim filed)
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Security deposit has been captured for damage claim.",
      });
    } else if (action === "release-hold") {
      // Release trip hold (customer paid cash)
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Trip hold has been released. Customer paid cash.",
      });
    } else if (action === "capture-hold") {
      // Capture full trip hold (no-show or didn't pay)
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: "Full trip amount has been captured.",
      });
    } else if (action === "partial-capture-hold") {
      // Capture partial amount
      const { amount } = body;
      if (!amount || typeof amount !== 'number') {
        return NextResponse.json({ error: "Missing amount for partial capture" }, { status: 400 });
      }
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: amount,
      });
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: `Partial capture of $${(amount / 100).toFixed(2)} completed.`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Booking action error:", error);
    return NextResponse.json(
      { error: "Failed to process booking action" },
      { status: 500 }
    );
  }
}
