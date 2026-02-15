import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

    // Get booking counts
    const { data: pendingBookings } = await adminClient
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('operator_id', operator.id)
      .eq('status', 'pending')

    const { data: confirmedBookings } = await adminClient
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('operator_id', operator.id)
      .eq('status', 'confirmed')

    // Get earnings (from captured deposits)
    const { data: allConfirmedBookings } = await adminClient
      .from('bookings')
      .select('deposit_amount')
      .eq('operator_id', operator.id)
      .eq('deposit_status', 'captured')

    const totalEarnings = allConfirmedBookings?.reduce(
      (sum, b) => sum + (Number(b.deposit_amount) || 0),
      0
    ) || 0

    // Get this month's earnings
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyBookings } = await adminClient
      .from('bookings')
      .select('deposit_amount')
      .eq('operator_id', operator.id)
      .eq('deposit_status', 'captured')
      .gte('updated_at', startOfMonth.toISOString())

    const monthlyEarnings = monthlyBookings?.reduce(
      (sum, b) => sum + (Number(b.deposit_amount) || 0),
      0
    ) || 0

    // Get recent bookings (last 10)
    const { data: recentBookings } = await adminClient
      .from('bookings')
      .select('id, customer_name, trip_date, trip_type, status, deposit_amount')
      .eq('operator_id', operator.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        pendingBookings: pendingBookings?.length || 0,
        confirmedBookings: confirmedBookings?.length || 0,
        totalEarnings,
        monthlyEarnings,
      },
      recentBookings: recentBookings || [],
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
