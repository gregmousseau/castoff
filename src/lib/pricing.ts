// Dynamic Pricing Engine for Charter Direct

import type { Pricing, PriceAdjustment, PriceBreakdown } from './types'

interface PricingConfig {
  basePrice: number
  depositAmount: number
  dynamicPricingEnabled: boolean
  seasonalRules: { name: string; start_month: number; end_month: number; multiplier: number }[]
  lastMinuteDiscountPercent: number
  advancePremiumPercent: number
  highDemandThreshold: number
  highDemandPremiumPercent: number
  lowAvailabilityPremiumPercent: number
}

interface DemandData {
  weekBookingCount: number
  availableSlotsForDate: number
}

// Default seasonal rules for Caribbean destinations
export const DEFAULT_SEASONAL_RULES = [
  { name: 'High Season', start_month: 12, end_month: 4, multiplier: 1.2 },
  { name: 'Shoulder Season', start_month: 11, end_month: 11, multiplier: 1.0 },
  { name: 'Low Season (Hurricane)', start_month: 7, end_month: 10, multiplier: 0.85 },
  { name: 'Shoulder Season', start_month: 5, end_month: 6, multiplier: 1.0 },
]

export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((date2.getTime() - date1.getTime()) / oneDay)
}

export function isInSeasonRange(month: number, startMonth: number, endMonth: number): boolean {
  // Handle wrap-around (e.g., Dec-Apr: 12-4)
  if (startMonth <= endMonth) {
    return month >= startMonth && month <= endMonth
  } else {
    return month >= startMonth || month <= endMonth
  }
}

export function calculateDynamicPrice(
  config: PricingConfig,
  tripDate: Date,
  demandData: DemandData,
  today: Date = new Date()
): PriceBreakdown {
  if (!config.dynamicPricingEnabled) {
    return {
      basePrice: config.basePrice,
      adjustments: [],
      finalPrice: config.basePrice,
      depositAmount: config.depositAmount,
    }
  }

  const adjustments: PriceAdjustment[] = []
  let runningPrice = config.basePrice

  // 1. Seasonal adjustment
  const month = tripDate.getMonth() + 1 // 1-12
  for (const rule of config.seasonalRules) {
    if (isInSeasonRange(month, rule.start_month, rule.end_month) && rule.multiplier !== 1.0) {
      const adjustmentAmount = config.basePrice * (rule.multiplier - 1)
      adjustments.push({
        reason: rule.name,
        type: 'percentage',
        value: Math.round((rule.multiplier - 1) * 100),
        amount: adjustmentAmount,
      })
      runningPrice += adjustmentAmount
      break // Only apply first matching rule
    }
  }

  // 2. Time-to-trip adjustment
  const daysUntilTrip = daysBetween(today, tripDate)
  
  if (daysUntilTrip <= 2 && config.lastMinuteDiscountPercent > 0) {
    // Last-minute discount (incentivize filling empty slots)
    const discount = config.basePrice * (config.lastMinuteDiscountPercent / 100)
    adjustments.push({
      reason: 'Last-minute availability',
      type: 'percentage',
      value: -config.lastMinuteDiscountPercent,
      amount: -discount,
    })
    runningPrice -= discount
  } else if (daysUntilTrip >= 30 && config.advancePremiumPercent > 0) {
    // Advance booking premium (popular dates book early)
    const premium = config.basePrice * (config.advancePremiumPercent / 100)
    adjustments.push({
      reason: 'Advance booking',
      type: 'percentage',
      value: config.advancePremiumPercent,
      amount: premium,
    })
    runningPrice += premium
  }

  // 3. Demand-based adjustment
  if (demandData.weekBookingCount >= config.highDemandThreshold && config.highDemandPremiumPercent > 0) {
    const premium = config.basePrice * (config.highDemandPremiumPercent / 100)
    adjustments.push({
      reason: 'High demand period',
      type: 'percentage',
      value: config.highDemandPremiumPercent,
      amount: premium,
    })
    runningPrice += premium
  }

  // 4. Low availability premium (scarcity)
  if (demandData.availableSlotsForDate <= 1 && config.lowAvailabilityPremiumPercent > 0) {
    const premium = config.basePrice * (config.lowAvailabilityPremiumPercent / 100)
    adjustments.push({
      reason: 'Limited availability',
      type: 'percentage',
      value: config.lowAvailabilityPremiumPercent,
      amount: premium,
    })
    runningPrice += premium
  }

  // Round to 2 decimal places
  const finalPrice = Math.round(runningPrice * 100) / 100

  return {
    basePrice: config.basePrice,
    adjustments,
    finalPrice: Math.max(finalPrice, config.depositAmount), // Never below deposit
    depositAmount: config.depositAmount,
  }
}

// Convert Pricing database row to PricingConfig
export function pricingToConfig(pricing: Pricing): PricingConfig {
  return {
    basePrice: pricing.base_price,
    depositAmount: pricing.deposit_amount,
    dynamicPricingEnabled: pricing.dynamic_pricing_enabled,
    seasonalRules: pricing.seasonal_rules || [],
    lastMinuteDiscountPercent: pricing.last_minute_discount_percent,
    advancePremiumPercent: pricing.advance_premium_percent,
    highDemandThreshold: pricing.high_demand_threshold,
    highDemandPremiumPercent: pricing.high_demand_premium_percent,
    lowAvailabilityPremiumPercent: pricing.low_availability_premium_percent,
  }
}

// Format price for display
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format adjustment for display
export function formatAdjustment(adjustment: PriceAdjustment): string {
  const sign = adjustment.amount >= 0 ? '+' : ''
  if (adjustment.type === 'percentage') {
    return `${adjustment.reason}: ${sign}${adjustment.value}%`
  }
  return `${adjustment.reason}: ${sign}${formatPrice(adjustment.amount)}`
}
