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
          `query?query=select * from Invoice where TxnDate >= '${fromDateISO}' order by TxnDate desc&startposition=${startPosition}&maxresults=1000`, 
          accessToken
        );
      });

      const invoices = result?.QueryResponse?.Invoice || [];
      const maxResults = result?.QueryResponse?.maxResults || 1000;
      
      // Process and store invoices
      for (const invoice of invoices) {
        await db.qboInvoice.upsert({
          where: { id: invoice.Id },
          update: {
            docNumber: invoice.DocNumber,
            customerRef: invoice.CustomerRef?.value,
            total: toMinorUnits(invoice.TotalAmt || 0),
            balance: toMinorUnits(invoice.Balance || 0),
            currency: (invoice.CurrencyRef?.value || 'USD').toUpperCase(),
            txnDate: new Date(invoice.TxnDate),
            updatedAt: new Date(),
          },
          create: {
            id: invoice.Id,
            realmId,
            docNumber: invoice.DocNumber,
            customerRef: invoice.CustomerRef?.value,
            total: toMinorUnits(invoice.TotalAmt || 0),
            balance: toMinorUnits(invoice.Balance || 0),
            currency: (invoice.CurrencyRef?.value || 'USD').toUpperCase(),
            txnDate: new Date(invoice.TxnDate),
          },
        });
      }

      totalCount += invoices.length;
      
      if (invoices.length < maxResults) {
        hasMore = false;
      } else {
        startPosition += maxResults;
      }
    }

    return NextResponse.json({ ok: true, count: totalCount });
  } catch (error) {
    console.error('QBO invoices error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
