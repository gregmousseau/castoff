// PayPal Integration Scaffold
// TODO: Wire up real PayPal API calls when Angelo's PayPal Business account is set up

interface PayPalOrderParams {
  operatorId: string
  amount: number // in dollars
  depositAmount: number
  customerEmail: string
  customerName: string
  tripDate: string
  tripType: string
  successUrl: string
  cancelUrl: string
  paypalMerchantId?: string
  metadata?: Record<string, string>
}

interface PayPalOrder {
  id: string
  status: string
  approveUrl: string | null
}

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`)
  }

  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder(params: PayPalOrderParams): Promise<PayPalOrder> {
  const accessToken = await getAccessToken()

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: params.depositAmount.toFixed(2),
        },
        description: `${params.tripType} Charter - ${params.tripDate}`,
        custom_id: JSON.stringify({
          operator_id: params.operatorId,
          trip_date: params.tripDate,
          trip_type: params.tripType,
          total_price: params.amount,
          ...params.metadata,
        }),
        ...(params.paypalMerchantId ? {
          payee: { merchant_id: params.paypalMerchantId },
        } : {}),
      },
    ],
    application_context: {
      brand_name: 'Cast Off',
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      user_action: 'PAY_NOW',
    },
  }

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayPal order creation failed: ${error}`)
  }

  const order = await res.json()
  const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')

  return {
    id: order.id,
    status: order.status,
    approveUrl: approveLink?.href || null,
  }
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string; id: string }> {
  const accessToken = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayPal capture failed: ${error}`)
  }

  const data = await res.json()
  return { status: data.status, id: data.id }
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}
