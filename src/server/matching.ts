import { db } from './db';

export interface MatchingResult {
  matchedCount: number;
  noMatchCount: number;
  ambiguousCount: number;
}

export async function matchPayoutsToBank({ dateToleranceDays = 2 }: { dateToleranceDays?: number }): Promise<MatchingResult> {
  console.log(`Starting payout↔bank matching with ${dateToleranceDays} day tolerance...`);

  const result: MatchingResult = {
    matchedCount: 0,
    noMatchCount: 0,
    ambiguousCount: 0,
  };

  // Load recent Stripe payouts (last 60 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);

  const payouts = await db.stripePayout.findMany({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
      status: 'paid', // Only match paid payouts
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${payouts.length} payouts to match`);

  for (const payout of payouts) {
    try {
      // Use payout amount as net amount (in minor units)
      const payoutNetMinor = payout.amount;
      const payoutCurrency = payout.currency;

      // Calculate date range
      const payoutDate = payout.arrivalDate;
      const startDate = new Date(payoutDate);
      startDate.setDate(startDate.getDate() - dateToleranceDays);
      
      const endDate = new Date(payoutDate);
      endDate.setDate(endDate.getDate() + dateToleranceDays);

      // Find candidate bank transactions
      const candidates = await db.plaidTransaction.findMany({
        where: {
          currency: payoutCurrency,
          amountMinor: payoutNetMinor,
          date: {
            gte: startDate,
            lte: endDate,
          },
          matchedPayoutId: null, // Not already matched
        },
        orderBy: {
          date: 'asc',
        },
      });

      console.log(`Payout ${payout.id} (${payoutCurrency} ${payoutNetMinor}): found ${candidates.length} candidates`);

      if (candidates.length === 0) {
        // No match found - create exception
        await db.stripeException.create({
          data: {
            kind: 'PAYOUT_NO_BANK_MATCH',
            refId: payout.id,
            message: `No bank transaction found for payout ${payout.id}`,
            data: {
              payoutId: payout.id,
              amountMinor: payoutNetMinor,
              currency: payoutCurrency,
              arrivalDate: payout.arrivalDate.toISOString(),
              searchDateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              },
            },
          },
        });
        result.noMatchCount++;
      } else if (candidates.length === 1) {
        // Exact match - link them
        const bankTx = candidates[0];
        
        // Update bank transaction with matched payout ID
        await db.plaidTransaction.update({
          where: { id: bankTx.id },
          data: { matchedPayoutId: payout.id },
        });

        console.log(`✅ Matched payout ${payout.id} to bank transaction ${bankTx.id}`);
        result.matchedCount++;
      } else {
        // Multiple candidates - ambiguous match
        await db.stripeException.create({
          data: {
            kind: 'AMBIGUOUS_BANK_MATCH',
            refId: payout.id,
            message: `Multiple bank transactions found for payout ${payout.id}`,
            data: {
              payoutId: payout.id,
              amountMinor: payoutNetMinor,
              currency: payoutCurrency,
              arrivalDate: payout.arrivalDate.toISOString(),
              candidates: candidates.map(c => ({
                id: c.id,
                date: c.date.toISOString(),
                name: c.name,
                amountMinor: c.amountMinor,
              })),
            },
          },
        });
        result.ambiguousCount++;
      }
    } catch (error) {
      console.error(`Error matching payout ${payout.id}:`, error);
      
      // Create exception for matching error
      await db.stripeException.create({
        data: {
          kind: 'PAYOUT_MATCH_ERROR',
          refId: payout.id,
          message: `Error during payout matching: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: {
            payoutId: payout.id,
            error: String(error),
          },
        },
      });
    }
  }

  console.log(`Matching complete: ${result.matchedCount} matched, ${result.noMatchCount} no match, ${result.ambiguousCount} ambiguous`);
  return result;
}
