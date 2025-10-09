import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { syncTransactionsForItem } from '@/server/plaid';
import { logger } from '@/server/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { webhook_type, webhook_code, item_id } = body;

    logger.info('Plaid webhook received', {
      webhook_type,
      webhook_code,
      item_id: item_id ? 'present' : 'missing',
    });

    // Handle TRANSACTIONS webhooks
    if (webhook_type === 'TRANSACTIONS') {
      if (webhook_code === 'DEFAULT_UPDATE' || webhook_code === 'INITIAL_UPDATE') {
        logger.info('Plaid transactions update webhook', { webhook_code, item_id });

        // If item_id provided, sync just that item
        if (item_id) {
          const bankItem = await db.bankItem.findUnique({
            where: { itemId: item_id },
          });

          if (bankItem) {
            try {
              await syncTransactionsForItem(bankItem.id);
              logger.info('Plaid transaction sync completed for item', { bankItemId: bankItem.id });
            } catch (syncError) {
              logger.error('Plaid transaction sync failed for item', {
                error: syncError,
                bankItemId: bankItem.id,
              });
            }
          } else {
            logger.warn('Plaid webhook for unknown item', { item_id });
          }
        } else {
          // Sync all items
          const allItems = await db.bankItem.findMany({
            select: { id: true },
          });

          for (const item of allItems) {
            try {
              await syncTransactionsForItem(item.id);
            } catch (syncError) {
              logger.error('Plaid transaction sync failed for item', {
                error: syncError,
                bankItemId: item.id,
              });
            }
          }

          logger.info('Plaid transaction sync completed for all items', {
            itemCount: allItems.length,
          });
        }
      }
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logger.error('Plaid webhook processing error', { error });
    
    // Still return 200 to prevent Plaid from retrying
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

