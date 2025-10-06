import { NextRequest, NextResponse } from 'next/server';
import { qboGet } from '@/server/qbo/client';
import { withQboAccess } from '@/server/qbo/store';
import { db } from '@/server/db';
import { toMinorUnits } from '@/server/money';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!realmId) {
      return NextResponse.json(
        { ok: false, error: 'Missing realmId parameter' },
        { status: 400 }
      );
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateISO = fromDate.toISOString().split('T')[0];

    let totalCount = 0;
    let startPosition = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await withQboAccess(realmId, async (accessToken) => {
        return await qboGet(
          realmId, 
          `query?query=select * from Payment where TxnDate >= '${fromDateISO}' order by TxnDate desc&startposition=${startPosition}&maxresults=1000`, 
          accessToken
        );
      });

      const payments = result?.QueryResponse?.Payment || [];
      const maxResults = result?.QueryResponse?.maxResults || 1000;
      
      // Process and store payments
      for (const payment of payments) {
        await db.qboPayment.upsert({
          where: { id: payment.Id },
          update: {
            customerRef: payment.CustomerRef?.value,
            total: toMinorUnits(payment.TotalAmt || 0),
            currency: (payment.CurrencyRef?.value || 'USD').toUpperCase(),
            txnDate: new Date(payment.TxnDate),
            appliedTo: payment.Line?.[0]?.LinkedTxn?.[0]?.TxnId,
            updatedAt: new Date(),
          },
          create: {
            id: payment.Id,
            realmId,
            customerRef: payment.CustomerRef?.value,
            total: toMinorUnits(payment.TotalAmt || 0),
            currency: (payment.CurrencyRef?.value || 'USD').toUpperCase(),
            txnDate: new Date(payment.TxnDate),
            appliedTo: payment.Line?.[0]?.LinkedTxn?.[0]?.TxnId,
          },
        });
      }

      totalCount += payments.length;
      
      if (payments.length < maxResults) {
        hasMore = false;
      } else {
        startPosition += maxResults;
      }
    }

    return NextResponse.json({ ok: true, count: totalCount });
  } catch (error) {
    console.error('QBO payments error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
