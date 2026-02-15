import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Complete the claim process - verify code and create account
export async function POST(request: NextRequest) {
  try {
    const { claimToken, verificationCode, password } = await request.json()

    if (!claimToken || !verificationCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: true,
        message: 'Development mode - claim completed',
        redirect: '/dashboard',
      })
    }

    const supabase = createAdminClient()

    // Find operator and verify code
    const { data: operator, error } = await supabase
      .from('operators')
      .select('id, email, claim_token, claimed')
      .ilike('claim_token', `${claimToken}:%`)
      .single()

    if (error || !operator) {
      return NextResponse.json({ error: 'Invalid claim token' }, { status: 404 })
    }

    if (operator.claimed) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
    }

    // Parse stored token: originalToken:code:expiresAt
    const [, storedCode, expiresAt] = operator.claim_token.split(':')
    
    if (storedCode !== verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    if (new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: operator.email!,
      password: password,
      email_confirm: true, // Skip email confirmation since we verified via code
    })

    if (authError) {
      // User might already exist
      if (authError.message.includes('already exists')) {
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please login instead.',
          redirect: '/login',
        }, { status: 400 })
      }
      throw authError
    }

    // Link operator to user and mark as claimed
    const { error: updateError } = await supabase
      .from('operators')
      .update({
        user_id: authData.user.id,
        claimed: true,
        claimed_at: new Date().toISOString(),
        claim_token: null, // Clear the token
      })
      .eq('id', operator.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      redirect: '/dashboard',
    })
  } catch (error) {
    console.error('Claim complete error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
