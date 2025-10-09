import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Check if any QBO tokens exist
    const tokenCount = await db.qboToken.count();
    
    if (tokenCount === 0) {
      return NextResponse.json({ 
        connected: false,
        message: 'No QuickBooks connections found'
      });
    }

    // Get the most recent token
    const latestToken = await db.qboToken.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        company: true
      }
    });

    if (!latestToken) {
      return NextResponse.json({ 
        connected: false,
        message: 'No valid tokens found'
      });
    }

    // Calculate minutes until expiry
    const now = new Date();
    const minutesUntilExpiry = Math.max(0, Math.floor((latestToken.expiresAt.getTime() - now.getTime()) / (1000 * 60)));

    return NextResponse.json({
      connected: true,
      realmId: latestToken.realmId,
      companyName: latestToken.company?.name || 'Unknown Company',
      minutesUntilExpiry,
      hasRefreshToken: !!latestToken.refreshToken,
      lastConnectedAt: latestToken.createdAt
    });

  } catch (error) {
    console.error('QBO connection check error:', error);
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
