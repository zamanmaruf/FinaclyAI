import { NextRequest, NextResponse } from 'next/server';
import { qboPost } from '@/server/qbo/client';
import { withQboAccess } from '@/server/qbo/store';
import { toMajor } from '@/server/money';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { realmId, bankAccountId, lines } = body;

    if (!realmId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { ok: false, error: 'Missing realmId or lines array' },
        { status: 400 }
      );
    }

    const finalBankAccountId = bankAccountId || process.env.QBO_BANK_ACCOUNT_ID;
    
    if (!finalBankAccountId) {
      return NextResponse.json(
        { ok: false, error: 'Missing bankAccountId. Provide in request body or set QBO_BANK_ACCOUNT_ID environment variable.' },
        { status: 400 }
      );
    }

    // Validate lines
    for (const line of lines) {
      if (!line.amountMinor || !line.currency || !line.accountId) {
        return NextResponse.json(
          { ok: false, error: 'Each line must have amountMinor, currency, and accountId' },
          { status: 400 }
        );
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const firstCurrency = lines[0].currency;

    // Build Deposit payload
    const depositPayload = {
      TxnDate: today,
      CurrencyRef: {
        value: firstCurrency,
        name: firstCurrency
      },
      Line: lines.map(line => ({
        DetailType: 'DepositLineDetail',
        Amount: toMajor(BigInt(line.amountMinor)),
        DepositLineDetail: {
          AccountRef: {
            value: line.accountId
          },
          Memo: line.memo || ''
        }
      }))
    };

    const result = await withQboAccess(realmId, async (accessToken) => {
      return await qboPost(realmId, 'deposit', depositPayload, accessToken);
    });

    const depositId = result?.QueryResponse?.Deposit?.[0]?.Id;

    if (!depositId) {
      throw new Error('Failed to create deposit - no ID returned');
    }

    return NextResponse.json({ ok: true, depositId });
  } catch (error) {
    console.error('QBO deposits error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
