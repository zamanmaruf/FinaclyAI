import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  const txs = await prisma.plaidTransaction.findMany({
    where: { matchedPayoutId: { not: null } },
    orderBy: { date: 'desc' },
    take: 10,
    select: { id: true, name: true, amountMinor: true, currency: true, date: true },
  })
  const items = txs.map(t => ({
    id: t.id,
    description: `Matched ${Number(t.amountMinor)/100} ${t.currency} — ${t.name}`,
    date: t.date.toISOString(),
  }))
  return NextResponse.json({ items })
}
