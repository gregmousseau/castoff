import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Update a pricing record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { base_price, deposit_amount, active } = body

    // Validate
    if (base_price !== undefined) {
      if (typeof base_price !== 'number' || base_price <= 0) {
        return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
      }
    }
    if (deposit_amount !== undefined) {
      if (typeof deposit_amount !== 'number' || deposit_amount < 0) {
        return NextResponse.json({ error: 'Deposit must be 0 or greater' }, { status: 400 })
      }
      if (base_price !== undefined && deposit_amount > base_price) {
        return NextResponse.json({ error: 'Deposit cannot exceed price' }, { status: 400 })
      }
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

    // Check that this pricing record belongs to this operator
    const { data: existingPricing } = await adminClient
      .from('pricing')
      .select('id, operator_id, base_price')
      .eq('id', id)
      .single()

    if (!existingPricing || existingPricing.operator_id !== operator.id) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 })
    }

    // Check deposit against existing or new price
    const effectivePrice = base_price ?? existingPricing.base_price
    if (deposit_amount !== undefined && deposit_amount > effectivePrice) {
      return NextResponse.json({ error: 'Deposit cannot exceed price' }, { status: 400 })
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (base_price !== undefined) updates.base_price = base_price
    if (deposit_amount !== undefined) updates.deposit_amount = deposit_amount
    if (active !== undefined) updates.active = active

    // Update pricing
    const { data: updated, error } = await adminClient
      .from('pricing')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Pricing update error:', error)
      return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Pricing PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
