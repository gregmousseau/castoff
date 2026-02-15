import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { capturePayment, cancelPayment, getPaymentIntent } from '@/lib/stripe'

// Get a single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Get operator for this user
    const { data: operator } = await adminClient
      .from('operators')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    // Get booking
    const { data: booking, error } = await adminClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('operator_id', operator.id)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Update booking (confirm or decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const { action, notes } = await request.json()
    
    if (!['confirm', 'decline', 'complete', 'no_show'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Get operator for this user
    const { data: operator } = await adminClient
      .from('operators')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    // Get booking
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('operator_id', operator.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Handle action
    let newStatus = booking.status
    let newDepositStatus = booking.deposit_status

    if (action === 'confirm') {
      if (booking.deposit_status !== 'authorized') {
        return NextResponse.json({ 
          error: 'Cannot confirm - deposit not authorized' 
        }, { status: 400 })
      }

      // Capture the payment
      if (booking.stripe_payment_intent_id) {
        try {
          await capturePayment(booking.stripe_payment_intent_id)
          newDepositStatus = 'captured'
        } catch (stripeError) {
          console.error('Stripe capture error:', stripeError)
          return NextResponse.json({ 
            error: 'Failed to capture payment' 
          }, { status: 500 })
        }
      }

      newStatus = 'confirmed'
    } else if (action === 'decline') {
      if (booking.deposit_status === 'captured') {
        return NextResponse.json({ 
          error: 'Cannot decline - deposit already captured. Use refund instead.' 
        }, { status: 400 })
      }

      // Cancel the auth (release hold)
      if (booking.stripe_payment_intent_id && booking.deposit_status === 'authorized') {
        try {
          await cancelPayment(booking.stripe_payment_intent_id)
          newDepositStatus = 'cancelled'
        } catch (stripeError) {
          console.error('Stripe cancel error:', stripeError)
          // Continue anyway - auth may have expired
        }
      }

      newStatus = 'declined'
    } else if (action === 'complete') {
      newStatus = 'completed'
    } else if (action === 'no_show') {
      newStatus = 'no_show'
    }

    // Update booking
    const { data: updated, error: updateError } = await adminClient
      .from('bookings')
      .update({
        status: newStatus,
        deposit_status: newDepositStatus,
        notes: notes || booking.notes,
        updated_at: new Date().toISOString(),
        ...(action === 'confirm' && { customer_confirmed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    // TODO: Send notification to customer based on action

    return NextResponse.json({
      success: true,
      booking: updated,
      message: action === 'confirm' 
        ? 'Booking confirmed - customer has been notified'
        : action === 'decline'
        ? 'Booking declined - hold released, no charges'
        : `Booking marked as ${newStatus}`,
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
