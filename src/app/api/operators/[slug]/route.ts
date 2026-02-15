import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
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
      description: 'Experience the best of Nassau with Captain Angelo! Navigate above shallow reef systems on our unique glass bottom boat, hand-feed colorful fish, swim with turtles, and visit the famous swimming pigs. Local knowledge, incredible stops, and genuine care for every guest.',
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
        id: 'mock-pricing-am',
        operator_id: 'mock-angelo-id',
        trip_type: 'half_day_am',
        display_name: 'Half Day AM',
        duration_hours: 4,
        start_time: '08:00',
        end_time: '12:00',
        base_price: 600,
        deposit_amount: 100,
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
        id: 'mock-pricing-pm',
        operator_id: 'mock-angelo-id',
        trip_type: 'half_day_pm',
        display_name: 'Half Day PM',
        duration_hours: 4,
        start_time: '13:00',
        end_time: '17:00',
        base_price: 600,
        deposit_amount: 100,
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
        display_name: 'Full Day',
        duration_hours: 8,
        start_time: '08:00',
        end_time: '17:00',
        base_price: 1000,
        deposit_amount: 100,
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
