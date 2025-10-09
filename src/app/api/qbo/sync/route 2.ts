import { NextRequest, NextResponse } from 'next/server';
import { qboGet } from '@/server/qbo/client';
import { withQboAccess } from '@/server/qbo/store';
import { db } from '@/server/db';
import { toMinorUnits } from '@/server/money';

async function syncInvoices(realmId: string, days: number): Promise<number> {
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

  return totalCount;
}

async function syncPayments(realmId: string, days: number): Promise<number> {
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

  return totalCount;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { realmId, days = 30 } = body;

    if (!realmId) {
      return NextResponse.json(
        { ok: false, error: 'Missing realmId' },
        { status: 400 }
      );
    }

    const invoiceCount = await syncInvoices(realmId, days);
    const paymentCount = await syncPayments(realmId, days);

    return NextResponse.json({ 
      ok: true, 
      invoiceCount, 
      paymentCount 
    });
  } catch (error) {
    console.error('QBO sync error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
