import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch all operators with their pricing and reviews for directory
    const { data: operators, error } = await supabase
      .from('operators')
      .select(`
        id,
        slug,
        business_name,
        location,
        hero_image,
        description
      `)
      .order('business_name')

    if (error) {
      console.error('Failed to fetch operators:', error)
      return NextResponse.json({ error: 'Failed to fetch operators' }, { status: 500 })
    }

    // Fetch pricing and reviews for each operator to compute stats
    const operatorsWithStats = await Promise.all(
      (operators || []).map(async (op) => {
        const [{ data: pricing }, { data: reviews }] = await Promise.all([
          supabase
            .from('pricing')
            .select('base_price')
            .eq('operator_id', op.id)
            .eq('active', true)
            .order('base_price', { ascending: true })
            .limit(1),
          supabase
            .from('reviews')
            .select('rating')
            .eq('operator_id', op.id)
            .eq('visible', true),
        ])

        const reviewCount = reviews?.length || 0
        const averageRating =
          reviewCount > 0
            ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0

        return {
          slug: op.slug,
          businessName: op.business_name,
          location: op.location,
          heroImage: op.hero_image,
          description: op.description,
          startingPrice: pricing?.[0]?.base_price ?? null,
          averageRating,
          reviewCount,
        }
      })
    )

    return NextResponse.json(operatorsWithStats)
  } catch (error) {
    console.error('Operators API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
