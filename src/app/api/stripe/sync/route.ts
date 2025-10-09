import { NextRequest, NextResponse } from 'next/server'
import { syncStripeAll } from '@/server/stripeSync'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const days = Number(url.searchParams.get('days') ?? '30')

    const result = await syncStripeAll({ days })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Stripe sync error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to sync Stripe' }, { status: 500 })
  }
}
