import { prisma } from './db';

export async function matchPayoutsToBank({ dateToleranceDays = 2 }: { dateToleranceDays?: number } = {}) {
  let matchedCount = 0;
  let noMatchCount = 0;
  let ambiguousCount = 0;

  try {
    // Load recent StripePayout rows (last 60 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    const payouts = await prisma.stripePayout.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        arrivalDate: 'desc',
      },
    });

    console.log(`Processing ${payouts.length} payouts for matching`);

    for (const payout of payouts) {
      // Use net amount (amount that actually hits the bank)
      const payoutNetMinor = payout.amount; // Stripe stores amounts in minor units

      // Build candidate bank transactions
      const candidates = await prisma.plaidTransaction.findMany({
        where: {
          currency: payout.currency,
          amountMinor: payoutNetMinor,
          matchedPayoutId: null, // Only unmatched transactions
          date: {
            gte: new Date(payout.arrivalDate.getTime() - dateToleranceDays * 24 * 60 * 60 * 1000),
            lte: new Date(payout.arrivalDate.getTime() + dateToleranceDays * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (candidates.length === 1) {
        // Exact match - link them
        const candidate = candidates[0];
        
        await prisma.plaidTransaction.update({
          where: { id: candidate.id },
          data: { matchedPayoutId: payout.id },
        });

        // Optionally update StripePayout with matched transaction ID (non-destructive)
        // We'll add this as a string field without FK constraint
        try {
          await prisma.stripePayout.update({
            where: { id: payout.id },
            data: { 
              // Add matchedBankTxId if the field exists in schema
              // For now, we'll just log the match
            },
          });
        } catch (error) {
          // Field might not exist yet, that's ok
          console.log(`Matched payout ${payout.id} to transaction ${candidate.id}`);
        }

        matchedCount++;
        console.log(`✅ Matched payout ${payout.id} (${payoutNetMinor} ${payout.currency}) to transaction ${candidate.id}`);
      } else if (candidates.length === 0) {
        // No match found
        await prisma.stripeException.create({
          data: {
            kind: 'PAYOUT_NO_BANK_MATCH',
            refId: payout.id,
            message: `No bank transaction found for payout ${payout.id}`,
            data: {
              payoutId: payout.id,
              amountMinor: payoutNetMinor.toString(),
              currency: payout.currency,
              arrivalDate: payout.arrivalDate.toISOString(),
            },
          },
        });
        noMatchCount++;
        console.log(`❌ No match for payout ${payout.id} (${payoutNetMinor} ${payout.currency})`);
      } else {
        // Multiple candidates - ambiguous match
        await prisma.stripeException.create({
          data: {
            kind: 'AMBIGUOUS_BANK_MATCH',
            refId: payout.id,
            message: `Multiple bank transactions found for payout ${payout.id}`,
            data: {
              payoutId: payout.id,
              amountMinor: payoutNetMinor.toString(),
              currency: payout.currency,
              arrivalDate: payout.arrivalDate.toISOString(),
              candidateTransactions: candidates.map(c => ({
                id: c.id,
                date: c.date.toISOString(),
                name: c.name,
              })),
            },
          },
        });
        ambiguousCount++;
        console.log(`⚠️  Ambiguous match for payout ${payout.id} (${payoutNetMinor} ${payout.currency}) - ${candidates.length} candidates`);
      }
    }

    console.log(`Matching complete: ${matchedCount} matched, ${noMatchCount} no match, ${ambiguousCount} ambiguous`);

    return {
      matchedCount,
      noMatchCount,
      ambiguousCount,
    };
  } catch (error) {
    console.error('Error in matchPayoutsToBank:', error);
    throw error;
  }
}