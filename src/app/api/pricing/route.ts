import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Get operator's pricing
export async function GET(request: NextRequest) {
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

    // Get pricing records
    const { data: pricing, error } = await adminClient
      .from('pricing')
      .select('*')
      .eq('operator_id', operator.id)
      .order('trip_type')

    if (error) {
      console.error('Pricing fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
    }

    return NextResponse.json(pricing || [])
  } catch (error) {
    console.error('Pricing GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
