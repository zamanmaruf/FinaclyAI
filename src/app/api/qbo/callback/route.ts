import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())

  return NextResponse.json({
    message: 'QBO callback reached the server',
    redirectUri: env.QBO_REDIRECT_URI,
    queryParams,
  })
}
