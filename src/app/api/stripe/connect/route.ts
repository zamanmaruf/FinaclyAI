import { NextRequest, NextResponse } from 'next/server'

let SECRET_KEY: string | undefined

export async function POST(request: NextRequest) {
  const { secretKey } = await request.json()
  if (!secretKey) return NextResponse.json({ ok: false, error: 'Missing secretKey' }, { status: 400 })
  SECRET_KEY = secretKey
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ connected: Boolean(SECRET_KEY) })
}
