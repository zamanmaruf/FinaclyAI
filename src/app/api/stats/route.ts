import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const matched = await prisma.plaidTransaction.count({ where: { matchedPayoutId: { not: null } } })
    const exceptions = await prisma.stripeException.count()
    const lastTx = await prisma.plaidTransaction.findFirst({ orderBy: { updatedAt: 'desc' } })
    
    return NextResponse.json({ 
      matched, 
      exceptions, 
      lastSync: lastTx?.updatedAt?.toISOString() || null 
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ matched: 0, exceptions: 0, lastSync: null })
  } finally {
    await prisma.$disconnect()
  }
}
