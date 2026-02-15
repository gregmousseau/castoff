import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Received webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'payment_intent.amount_capturable_updated': {
        // Payment has been authorized (auth-only hold placed)
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentAuthorized(paymentIntent)
        break
      }

      case 'payment_intent.succeeded': {
        // Payment captured (after operator confirms)
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentCaptured(paymentIntent)
        break
      }

      case 'payment_intent.canceled': {
        // Auth was cancelled (released without capture)
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentCancelled(paymentIntent)
        break
      }

      case 'account.updated': {
        // Stripe Connect account status changed
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(account)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const metadata = session.metadata || {}
  const operatorId = metadata.operator_id
  
  if (!operatorId) {
    console.error('No operator_id in session metadata')
    return
  }

  // Update booking with checkout session ID
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient()
    
    // Find booking by matching operator_id and trip details
    // In production, store booking_id in session metadata
    const { error } = await supabase
      .from('bookings')
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        deposit_status: 'authorized',
        updated_at: new Date().toISOString(),
      })
      .eq('operator_id', operatorId)
      .eq('trip_date', metadata.trip_date)
      .eq('deposit_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Failed to update booking:', error)
    }
  }

  // TODO: Send notification to operator (email/SMS/WhatsApp)
  console.log(`New booking for operator ${operatorId} - ${metadata.trip_type} on ${metadata.trip_date}`)
}

async function handlePaymentAuthorized(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment authorized:', paymentIntent.id)
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient()
    
    await supabase
      .from('bookings')
      .update({ 
        deposit_status: 'authorized',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }
}

async function handlePaymentCaptured(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment captured:', paymentIntent.id)
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient()
    
    await supabase
      .from('bookings')
      .update({ 
        deposit_status: 'captured',
        status: 'confirmed',
        customer_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }

  // TODO: Send confirmation to customer
}

async function handlePaymentCancelled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment cancelled:', paymentIntent.id)
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient()
    
    await supabase
      .from('bookings')
      .update({ 
        deposit_status: 'cancelled',
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }

  // TODO: Send cancellation notice to customer
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log('Account updated:', account.id)
  
  const onboardingComplete = account.charges_enabled && account.payouts_enabled
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient()
    
    await supabase
      .from('operators')
      .update({ 
        stripe_onboarding_complete: onboardingComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', account.id)
  }
}
