import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { OperatorPageData } from '@/lib/types'

// Mock data for development (when Supabase isn't connected)
const MOCK_DATA: Record<string, OperatorPageData> = {
  angelo: {
    operator: {
      id: 'mock-angelo-id',
      slug: 'angelo',
      business_name: 'Bahamas Water Tours',
      email: 'bahamaswatertours@hotmail.com',
      phone: null,
      whatsapp: null,
      location: 'Nassau, The Bahamas',
      description: 'Experience the Bahamas like never before with a private, fully curated boat tour. Every trip is tailored to your group — whether you want to explore hidden cays, snorkel pristine reefs, or simply cruise the turquoise waters. All tours are private and can be customized to your liking.',
      hero_image: '/operators/angelo/hero.jpg',
      stripe_account_id: null,
      stripe_onboarding_complete: false,
      google_calendar_id: null,
      google_refresh_token: null,
      claimed: false,
      claimed_at: null,
      claim_token: 'mock-claim-token',
      user_id: null,
      source_platform: 'getmyboat',
      source_listing_id: 'VKVQod4Y',
      security_deposit_enabled: false,
      security_deposit_amount: 0,
      waiver_enabled: false,
      waiver_text: null,
      instant_booking: false,
      verified: false,
      verification_docs: [],
      trip_hold_enabled: false,
      payment_method: 'stripe',
      paypal_email: null,
      paypal_merchant_id: null,
      is_admin: false,
      max_trips_per_day: 1,
      cancellation_policy: 'moderate',
      what_to_bring: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    boats: [{
      id: 'mock-boat-id',
      operator_id: 'mock-angelo-id',
      name: "32' Eduardono Glass Bottom Boat",
      type: 'glass_bottom',
      capacity: 22,
      features: ['glass_bottom', 'shaded_roof', 'boarding_steps', 'snorkel_gear'],
      photos: [
        { url: '/operators/angelo/boat-aerial.jpg', caption: 'Aerial view', order: 0 },
        { url: '/operators/angelo/snorkeling.jpg', caption: 'Snorkeling', order: 1 },
        { url: '/operators/angelo/beach.jpg', caption: 'Beach visit', order: 2 },
        { url: '/operators/angelo/guests.jpg', caption: 'Happy guests', order: 3 },
        { url: '/operators/angelo/turtle.jpg', caption: 'Turtles', order: 4 },
      ],
      primary_photo_index: 0,
      is_primary: true,
      created_at: new Date().toISOString(),
    }],
    pricing: [
      {
        id: 'mock-pricing-starter',
        operator_id: 'mock-angelo-id',
        trip_type: 'starter',
        display_name: 'Starter Tour',
        duration_hours: 3,
        start_time: '09:00',
        end_time: '12:00',
        base_price: 900,
        deposit_amount: 100,
        included_guests: 8,
        extra_person_fee: 125,
        custom_start_time: true,
        default_start_time: '09:00',
        dynamic_pricing_enabled: false,
        seasonal_rules: [],
        last_minute_discount_percent: 0,
        advance_premium_percent: 0,
        high_demand_threshold: 3,
        high_demand_premium_percent: 10,
        low_availability_premium_percent: 15,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-pricing-half',
        operator_id: 'mock-angelo-id',
        trip_type: 'half_day',
        display_name: 'Half Day Tour',
        duration_hours: 4,
        start_time: '09:00',
        end_time: '13:00',
        base_price: 1200,
        deposit_amount: 100,
        included_guests: 8,
        extra_person_fee: 125,
        custom_start_time: true,
        default_start_time: '09:00',
        dynamic_pricing_enabled: false,
        seasonal_rules: [],
        last_minute_discount_percent: 0,
        advance_premium_percent: 0,
        high_demand_threshold: 3,
        high_demand_premium_percent: 10,
        low_availability_premium_percent: 15,
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-pricing-full',
        operator_id: 'mock-angelo-id',
        trip_type: 'full_day',
        display_name: 'Full Day Tour',
        duration_hours: 8,
        start_time: '09:00',
        end_time: '17:00',
        base_price: 2500,
        deposit_amount: 100,
        included_guests: 8,
        extra_person_fee: 125,
        custom_start_time: true,
        default_start_time: '09:00',
        dynamic_pricing_enabled: false,
        seasonal_rules: [],
        last_minute_discount_percent: 0,
        advance_premium_percent: 0,
        high_demand_threshold: 3,
        high_demand_premium_percent: 10,
        low_availability_premium_percent: 15,
        active: true,
        created_at: new Date().toISOString(),
      },
    ],
    reviews: [
      {
        id: 'mock-review-1',
        operator_id: 'mock-angelo-id',
        booking_id: null,
        reviewer_name: 'Jill S.',
        rating: 5,
        review_text: 'Angelo is a sincerely incredible man and made our excursion so memorable. He took us to incredible places, shared a lot of info about the country and island, and made us feel so safe. There was a group of 17 of us. We travel a lot and this was by far the best excursion we ever had.',
        review_date: '2026-01-15',
        source: 'getmyboat',
        external_id: null,
        visible: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-review-2',
        operator_id: 'mock-angelo-id',
        booking_id: null,
        reviewer_name: 'Jody G.',
        rating: 5,
        review_text: 'Angelo was great!! Very welcoming and provided a great experience for our entire group!',
        review_date: '2026-01-10',
        source: 'getmyboat',
        external_id: null,
        visible: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-review-3',
        operator_id: 'mock-angelo-id',
        booking_id: null,
        reviewer_name: 'Mandi P.',
        rating: 5,
        review_text: 'Great adventure for our family!',
        review_date: '2025-12-20',
        source: 'getmyboat',
        external_id: null,
        visible: true,
        created_at: new Date().toISOString(),
      },
    ],
    inclusions: [
      { id: '1', operator_id: 'mock-angelo-id', name: 'Glass bottom boat experience', included: true, created_at: '' },
      { id: '2', operator_id: 'mock-angelo-id', name: 'Hand-feed colorful fish', included: true, created_at: '' },
      { id: '3', operator_id: 'mock-angelo-id', name: 'Remote beach visit', included: true, created_at: '' },
      { id: '4', operator_id: 'mock-angelo-id', name: 'Snorkel equipment', included: true, created_at: '' },
      { id: '5', operator_id: 'mock-angelo-id', name: 'Swim with turtles', included: true, created_at: '' },
      { id: '6', operator_id: 'mock-angelo-id', name: 'Tropical drinks', included: true, created_at: '' },
    ],
    addons: [
      { id: '1', operator_id: 'mock-angelo-id', name: 'Swimming Pigs Visit', price: 20, price_type: 'per_person', description: 'Visit the famous swimming pigs', active: true, created_at: '' },
      { id: '2', operator_id: 'mock-angelo-id', name: 'Drone Kayak Photos', price: 100, price_type: 'per_person', description: 'Professional aerial photos', active: true, created_at: '' },
    ],
    stats: {
      totalTrips: 12,
      averageRating: 5.0,
      reviewCount: 3,
    },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Try Supabase first
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient()

      // Fetch operator
      const { data: operator, error: opError } = await supabase
        .from('operators')
        .select('*')
        .eq('slug', slug)
        .single()

      if (opError || !operator) {
        // Fall back to mock data
        const mockData = MOCK_DATA[slug]
        if (!mockData) {
          return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
        }
        return NextResponse.json(mockData)
      }

      // Fetch related data
      const [
        { data: boats },
        { data: pricing },
        { data: reviews },
        { data: inclusions },
        { data: addons },
      ] = await Promise.all([
        supabase.from('boats').select('*').eq('operator_id', operator.id),
        supabase.from('pricing').select('*').eq('operator_id', operator.id).eq('active', true),
        supabase.from('reviews').select('*').eq('operator_id', operator.id).eq('visible', true).order('review_date', { ascending: false }),
        supabase.from('inclusions').select('*').eq('operator_id', operator.id),
        supabase.from('addons').select('*').eq('operator_id', operator.id).eq('active', true),
      ])

      // Calculate stats
      const totalTrips = 12 // TODO: Count from bookings
      const reviewCount = reviews?.length || 0
      const averageRating = reviewCount > 0
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0

      const data: OperatorPageData = {
        operator,
        boats: boats || [],
        pricing: pricing || [],
        reviews: reviews || [],
        inclusions: inclusions || [],
        addons: addons || [],
        stats: {
          totalTrips,
          averageRating,
          reviewCount,
        },
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Supabase error:', error)
  }

  // Fall back to mock data
  const mockData = MOCK_DATA[slug]
  if (!mockData) {
    return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
  }
  return NextResponse.json(mockData)
}

// PATCH - update operator settings (security deposit, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Verify operator belongs to user
    const { data: operator, error: opError } = await adminClient
      .from('operators')
      .select('id, user_id')
      .eq('slug', slug)
      .single()

    if (opError || !operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    if (operator.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    const booleanFields = [
      'security_deposit_enabled', 'waiver_enabled', 'instant_booking',
      'trip_hold_enabled',
    ]
    const numberFields = ['security_deposit_amount', 'max_trips_per_day']
    const stringFields = [
      'business_name', 'description', 'location', 'email', 'phone',
      'whatsapp', 'waiver_text', 'cancellation_policy', 'what_to_bring',
      'payment_method', 'paypal_email', 'paypal_merchant_id',
    ]

    for (const field of booleanFields) {
      if (typeof body[field] === 'boolean') updates[field] = body[field]
    }
    for (const field of numberFields) {
      if (typeof body[field] === 'number') updates[field] = body[field]
    }
    for (const field of stringFields) {
      if (typeof body[field] === 'string') updates[field] = body[field]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('operators')
      .update(updates)
      .eq('id', operator.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('PATCH operator error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
