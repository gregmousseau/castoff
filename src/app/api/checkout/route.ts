import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createConnectCheckoutSession } from '@/lib/stripe'
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
    } = body

    if (!operatorSlug || !tripDate || !tripType || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get operator and pricing from database (or use mock data)
    let operatorId = 'mock-operator-id'
    let stripeAccountId: string | null = null
    let basePrice = 600
    let depositAmount = 100
    let finalPrice = 600

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient()

      // Get operator
      const { data: operator, error: opError } = await supabase
        .from('operators')
        .select('id, stripe_account_id')
        .eq('slug', operatorSlug)
        .single()

      if (opError || !operator) {
        return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
      }

      operatorId = operator.id
      stripeAccountId = operator.stripe_account_id

      // Get pricing for this trip type
      const { data: pricing } = await supabase
        .from('pricing')
        .select('*')
        .eq('operator_id', operator.id)
        .eq('trip_type', tripType)
        .single()

      if (pricing) {
        // Calculate dynamic price
        const demandData = {
          weekBookingCount: 0, // TODO: Query actual bookings
          availableSlotsForDate: 3, // TODO: Query actual availability
        }
        
        const priceBreakdown = calculateDynamicPrice(
          pricingToConfig(pricing),
          new Date(tripDate),
          demandData
        )

        basePrice = priceBreakdown.basePrice
        finalPrice = priceBreakdown.finalPrice
        depositAmount = pricing.deposit_amount
      }

      // Create booking record
      const { data: booking, error: bookingError } = await supabase
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
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking create error:', bookingError)
        // Continue anyway - we'll create checkout without booking reference
      }
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const session = await createConnectCheckoutSession({
      operatorId,
      stripeAccountId,
      amount: Math.round(finalPrice * 100), // Convert to cents
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
    })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
