import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    
    return NextResponse.json({ ok: true, db: 'up', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { ok: false, db: 'down', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    )
  }
}