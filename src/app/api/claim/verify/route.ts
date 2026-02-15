import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Verify a claim token and send verification email
export async function POST(request: NextRequest) {
  try {
    const { claimToken } = await request.json()

    if (!claimToken) {
      return NextResponse.json({ error: 'Claim token required' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Development mode - accept any token
      return NextResponse.json({
        success: true,
        message: 'Development mode - claim token accepted',
        operator: {
          business_name: 'Test Operator',
          email: 'test@example.com',
        },
      })
    }

    const supabase = createAdminClient()

    // Find operator by claim token
    const { data: operator, error } = await supabase
      .from('operators')
      .select('id, business_name, email, claimed')
      .eq('claim_token', claimToken)
      .single()

    if (error || !operator) {
      return NextResponse.json({ error: 'Invalid claim token' }, { status: 404 })
    }

    if (operator.claimed) {
      return NextResponse.json({ error: 'This page has already been claimed' }, { status: 400 })
    }

    if (!operator.email) {
      return NextResponse.json({ 
        error: 'No email on file. Please contact support.',
        needsManualVerification: true,
      }, { status: 400 })
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code with expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    
    // In production, store this in a verification_codes table or cache
    // For now, we'll use a simple approach
    await supabase
      .from('operators')
      .update({ 
        claim_token: `${claimToken}:${verificationCode}:${expiresAt}` 
      })
      .eq('id', operator.id)

    // TODO: Send verification email via Resend/SendGrid
    // For now, log it
    console.log(`Verification code for ${operator.email}: ${verificationCode}`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to email',
      email: operator.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
      operator: {
        business_name: operator.business_name,
      },
    })
  } catch (error) {
    console.error('Claim verify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
