import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Operator data (will move to database)
const operators: Record<string, { name: string; email: string; deposit: number }> = {
  angelo: {
    name: "Bahamas Water Tours",
    email: "bahamaswatertours@hotmail.com",
    deposit: 100,
  },
};

const SLOT_INFO: Record<string, { label: string; price: number }> = {
  "half-am": { label: "Half Day AM (8am-12pm)", price: 600 },
  "half-pm": { label: "Half Day PM (1pm-5pm)", price: 600 },
  full: { label: "Full Day (8am-5pm)", price: 1000 },
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { operatorSlug, date, slot, customerEmail, customerName, customerPhone } = body;

    // Validate inputs
    if (!operatorSlug || !date || !slot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const operator = operators[operatorSlug];
    if (!operator) {
      return NextResponse.json(
        { error: "Operator not found" },
        { status: 404 }
      );
    }

    const slotInfo = SLOT_INFO[slot];
    if (!slotInfo) {
      return NextResponse.json(
        { error: "Invalid slot" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session with manual capture
    // This authorizes the deposit but doesn't capture it
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${operator.name} - ${slotInfo.label}`,
              description: `Booking for ${date}. Deposit to reserve your spot. Remainder ($${slotInfo.price - operator.deposit}) paid day of trip.`,
            },
            unit_amount: operator.deposit * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: "manual", // THE KEY: authorize but don't capture
        metadata: {
          operatorSlug,
          date,
          slot,
          totalPrice: slotInfo.price.toString(),
          depositAmount: operator.deposit.toString(),
          customerName: customerName || "",
          customerPhone: customerPhone || "",
        },
      },
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/${operatorSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/${operatorSlug}?cancelled=true`,
      metadata: {
        operatorSlug,
        date,
        slot,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
