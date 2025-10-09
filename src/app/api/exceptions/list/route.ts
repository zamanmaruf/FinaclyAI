import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  const rows = await prisma.stripeException.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      kind: true,
      message: true,
      data: true,
      createdAt: true,
    },
  })

  const mapped = rows.map(r => ({
    id: r.id,
    kind: r.kind,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    amountMinor: (r.data as any)?.amountMinor,
    currency: (r.data as any)?.currency,
    data: r.data,
  }))
  return NextResponse.json({ rows: mapped })
}
