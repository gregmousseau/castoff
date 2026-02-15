import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

// Start Stripe Connect onboarding
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get operator for this user
    const adminClient = createAdminClient()
    const { data: operator, error: opError } = await adminClient
      .from('operators')
      .select('id, stripe_account_id, business_name, email')
      .eq('user_id', user.id)
      .single()
    
    if (opError || !operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }
    
    const stripe = getStripe()
    let accountId = operator.stripe_account_id
    
    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BS', // Bahamas - adjust based on operator location
        email: operator.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: operator.business_name,
          mcc: '4722', // Travel agencies and tour operators
          url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${operator.id}`,
        },
      })
      
      accountId = account.id
      
      // Save account ID
      await adminClient
        .from('operators')
        .update({ stripe_account_id: accountId })
        .eq('id', operator.id)
    }
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?success=true`,
      type: 'account_onboarding',
    })
    
    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 })
  }
}

// Check onboarding status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', user.id)
      .single()
    
    if (!operator?.stripe_account_id) {
      return NextResponse.json({ 
        connected: false,
        onboarding_complete: false,
      })
    }
    
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(operator.stripe_account_id)
    
    const onboardingComplete = account.charges_enabled && account.payouts_enabled
    
    // Update database if status changed
    if (onboardingComplete !== operator.stripe_onboarding_complete) {
      await adminClient
        .from('operators')
        .update({ stripe_onboarding_complete: onboardingComplete })
        .eq('user_id', user.id)
    }
    
    return NextResponse.json({
      connected: true,
      onboarding_complete: onboardingComplete,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
  } catch (error) {
    console.error('Stripe status error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
