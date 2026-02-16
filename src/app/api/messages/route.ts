import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST: Create a message (public for customers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id, operator_id, sender_type, sender_name, sender_email, message } = body

    if (!operator_id || !message || !sender_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: booking_id || null,
        operator_id,
        sender_type,
        sender_name: sender_name || null,
        sender_email: sender_email || null,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('Message create error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET: List messages for operator (auth required)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: operator } = await adminClient
      .from('operators')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    const { data: messages, error } = await adminClient
      .from('messages')
      .select('*')
      .eq('operator_id', operator.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json(messages || [])
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
