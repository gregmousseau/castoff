import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Get operator's bookings
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

    // Get status filter from query params
    const status = request.nextUrl.searchParams.get('status')

    // Build query
    let query = adminClient
      .from('bookings')
      .select('*')
      .eq('operator_id', operator.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Bookings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
