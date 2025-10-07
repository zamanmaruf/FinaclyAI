import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  const matched = await prisma.plaidTransaction.count({ where: { matchedPayoutId: { not: null } } })
  const exceptions = await prisma.stripeException.count()
  const lastTx = await prisma.plaidTransaction.findFirst({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ matched, exceptions, lastSync: lastTx?.updatedAt?.toISOString() })
}
