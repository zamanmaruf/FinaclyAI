import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const count = await db.bankItem.count();
    return NextResponse.json({
      ok: true,
      count,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
