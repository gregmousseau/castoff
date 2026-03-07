import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Check if user is admin
    const { data: adminOperator } = await adminClient
      .from('operators')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!adminOperator?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all operators
    const { data: operators, error } = await adminClient
      .from('operators')
      .select('id, slug, business_name, location, email, claimed, stripe_onboarding_complete, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch operators' }, { status: 500 })
    }

    return NextResponse.json({ operators: operators || [] })
  } catch (error) {
    console.error('Admin operators error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
