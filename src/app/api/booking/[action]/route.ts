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
