import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey || secretKey === 'sk_test_placeholder') {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// For client-side - just return the publishable key
export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}

// Create a payment intent with auth-only (manual capture)
// For platform payments using Stripe Connect
export interface CreateCheckoutParams {
  operatorId: string
  stripeAccountId: string | null
  amount: number // Total trip price in cents
  depositAmount: number // Deposit to authorize in cents
  customerEmail: string
  customerName: string
  tripDate: string
  tripType: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createConnectCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe()
  
  // If operator has Stripe Connect, use destination charges
  // Otherwise, we collect on behalf (platform holds funds)
  
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${params.tripType} Charter - ${params.tripDate}`,
            description: `Deposit to reserve your trip. Remainder due day of charter.`,
          },
          unit_amount: params.depositAmount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: 'manual', // Auth-only, capture later
      metadata: {
        operator_id: params.operatorId,
        trip_date: params.tripDate,
        trip_type: params.tripType,
        customer_name: params.customerName,
        total_price: params.amount.toString(),
        deposit_amount: params.depositAmount.toString(),
        ...params.metadata,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
  }
  
  // Add destination charge if operator has Stripe Connect
  if (params.stripeAccountId) {
    // Calculate platform fee (e.g., 5% of deposit)
    const platformFee = Math.round(params.depositAmount * 0.05)
    
    sessionParams.payment_intent_data!.application_fee_amount = platformFee
    sessionParams.payment_intent_data!.transfer_data = {
      destination: params.stripeAccountId,
    }
  }
  
  return stripe.checkout.sessions.create(sessionParams)
}

// Capture an authorized payment (when operator confirms)
export async function capturePayment(paymentIntentId: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.capture(paymentIntentId)
}

// Cancel an authorized payment (no fee charged)
export async function cancelPayment(paymentIntentId: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.cancel(paymentIntentId)
}

// Get payment intent details
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.retrieve(paymentIntentId)
}
