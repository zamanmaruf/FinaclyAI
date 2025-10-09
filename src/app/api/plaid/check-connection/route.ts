import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    // Check if any Plaid items exist
    const itemCount = await prisma.bankItem.count();
    
    if (itemCount === 0) {
      return NextResponse.json({ 
        connected: false,
        message: 'No bank connections found'
      });
    }

    // Get the most recent bank item
    const latestItem = await prisma.bankItem.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: {
          select: {
            name: true,
            officialName: true,
            currency: true
          }
        }
      }
    });

    if (!latestItem) {
      return NextResponse.json({ 
        connected: false,
        message: 'No valid bank items found'
      });
    }

    return NextResponse.json({
      connected: true,
      institutionName: latestItem.institutionName,
      itemId: latestItem.itemId,
      accountsCount: latestItem.accounts.length,
      accounts: latestItem.accounts,
      connectedAt: latestItem.createdAt
    });

  } catch (error) {
    console.error('Plaid connection check error:', error);
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
