import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const recentMatches = await prisma.plaidTransaction.findMany({
      where: { matchedPayoutId: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        bankAccount: true,
      },
    })
    
    const items = recentMatches.map(tx => ({
      id: tx.id,
      description: `${tx.name || 'Bank Transaction'} - ${tx.currency} ${Number(tx.amountMinor) / 100}`,
      date: tx.date.toISOString(),
    }))
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Recent matches error:', error)
    return NextResponse.json({ items: [] })
  } finally {
    await prisma.$disconnect()
  }
}

