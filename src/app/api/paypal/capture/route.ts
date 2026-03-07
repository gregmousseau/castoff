import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const result = await capturePayPalOrder(orderId)

    if (result.status === 'COMPLETED') {
      // Update booking status if we can find it by the PayPal order ID
      // For now, return success — the confirmation page handles the UX
      return NextResponse.json({ success: true, status: result.status })
    }

    return NextResponse.json({ success: false, status: result.status })
  } catch (error: unknown) {
    console.error('PayPal capture error:', error)
    const message = error instanceof Error ? error.message : 'Capture failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
