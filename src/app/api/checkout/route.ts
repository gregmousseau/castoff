import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createConnectCheckoutSession } from '@/lib/stripe'
import { createPayPalOrder } from '@/lib/paypal'
import { calculateDynamicPrice, pricingToConfig } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      operatorSlug,
      tripDate,
      tripType,
      customerName,
      customerEmail,
      customerPhone,
      partySize = 1,
      specialRequests,
      requestedStartTime,
    } = body

    if (!operatorSlug || !tripDate || !tripType || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get operator
    const { data: operator, error: opError } = await supabase
      .from('operators')
      .select('id, stripe_account_id, payment_method, paypal_email, paypal_merchant_id')
      .eq('slug', operatorSlug)
      .single()

    if (opError || !operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    const operatorId = operator.id
    let basePrice = 600
    let depositAmount = 100
    let finalPrice = 600

    // Get pricing for this trip type
    const { data: pricing } = await supabase
      .from('pricing')
      .select('*')
      .eq('operator_id', operator.id)
      .eq('trip_type', tripType)
      .single()

    if (pricing) {
      const demandData = {
        weekBookingCount: 0,
        availableSlotsForDate: 3,
      }

      const priceBreakdown = calculateDynamicPrice(
        pricingToConfig(pricing),
        new Date(tripDate),
        demandData
      )

      basePrice = priceBreakdown.basePrice
      finalPrice = priceBreakdown.finalPrice
      depositAmount = pricing.deposit_amount

      // Calculate extra person fees
      const includedGuests = pricing.included_guests as number | null
      const extraPersonFee = Number(pricing.extra_person_fee) || 0
      if (includedGuests && partySize > includedGuests && extraPersonFee > 0) {
        const extraGuests = partySize - includedGuests
        finalPrice += extraGuests * extraPersonFee
      }
    }

    // Create booking record
    const paymentProvider = operator.payment_method === 'paypal' ? 'paypal' : 'stripe'
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        operator_id: operatorId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        party_size: partySize,
        special_requests: specialRequests,
        trip_date: tripDate,
        trip_type: tripType,
        base_price: basePrice,
        final_price: finalPrice,
        deposit_amount: depositAmount,
        deposit_status: 'pending',
        status: 'pending',
        payment_provider: paymentProvider,
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking create error:', bookingError)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Route to PayPal or Stripe based on operator preference
    if (operator.payment_method === 'paypal') {
      const order = await createPayPalOrder({
        operatorId,
        amount: finalPrice,
        depositAmount,
        customerEmail,
        customerName,
        tripDate,
        tripType,
        paypalMerchantId: operator.paypal_merchant_id || undefined,
        successUrl: `${baseUrl}/book/${operatorSlug}/confirmation`,
        cancelUrl: `${baseUrl}/book/${operatorSlug}?cancelled=true`,
        metadata: {
          party_size: partySize.toString(),
          customer_phone: customerPhone || '',
          requested_start_time: requestedStartTime || '',
        },
      })

      return NextResponse.json({
        checkoutUrl: order.approveUrl,
        orderId: order.id,
        provider: 'paypal',
      })
    }

    // Default: Stripe
    const session = await createConnectCheckoutSession({
      operatorId,
      stripeAccountId: operator.stripe_account_id,
      amount: Math.round(finalPrice * 100),
      depositAmount: Math.round(depositAmount * 100),
      customerEmail,
      customerName,
      tripDate,
      tripType,
      successUrl: `${baseUrl}/book/${operatorSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/book/${operatorSlug}?cancelled=true`,
      metadata: {
        party_size: partySize.toString(),
        customer_phone: customerPhone || '',
      },
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      provider: 'stripe',
    })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
