import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })

  // For MVP, mark exception as resolved by deleting it
  await prisma.stripeException.deleteMany({ where: { id } })
  return NextResponse.json({ ok: true })
}
