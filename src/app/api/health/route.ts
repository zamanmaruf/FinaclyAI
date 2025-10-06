import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { ok: true, db: 'down' },
      { status: 503 }
    )
  }
}
