import { prisma } from './db';
import { ExceptionType, ExceptionMessages } from './errors';

export async function matchPayoutsToBank({ dateToleranceDays = 2 }: { dateToleranceDays?: number } = {}) {
  let matchedCount = 0;
  let noMatchCount = 0;
  let ambiguousCount = 0;
  let exceptionsCreated = 0;
  let multiCurrencyCount = 0;
  let partialPaymentCount = 0;
  const unmatchedPayouts: Array<{ id: string; amountMinor: bigint; currency: string }> = [];

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

    // Detect multi-currency payouts (non-base currency)
    const baseAccountCurrency = await prisma.stripeAccount.findFirst({
      select: { defaultCurrency: true },
    });
    const baseCurrency = baseAccountCurrency?.defaultCurrency || 'usd';

    for (const payout of payouts) {
      // Check for multi-currency payout
      if (payout.currency.toLowerCase() !== baseCurrency.toLowerCase()) {
        await prisma.stripeException.create({
          data: {
            kind: ExceptionType.MULTI_CURRENCY_PAYOUT,
            refId: payout.id,
            message: ExceptionMessages.MULTI_CURRENCY_PAYOUT,
            data: {
              payoutId: payout.id,
              payoutCurrency: payout.currency,
              baseCurrency: baseCurrency,
              amountMinor: payout.amount.toString(),
              arrivalDate: payout.arrivalDate.toISOString(),
            },
          },
        });
        multiCurrencyCount++;
        exceptionsCreated++;
        console.log(`💱 Multi-currency payout detected: ${payout.id} (${payout.currency} vs ${baseCurrency})`);
        continue; // Skip matching for multi-currency payouts
      }

      // Use net amount (amount that actually hits the bank)
      const payoutNetMinor = payout.amount; // Stripe stores amounts in minor units

      // Build candidate bank transactions (exact match)
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

      // If no exact match, check for potential partial payments
      if (candidates.length === 0) {
        const partialCandidates = await prisma.plaidTransaction.findMany({
          where: {
            currency: payout.currency,
            matchedPayoutId: null,
            date: {
              gte: new Date(payout.arrivalDate.getTime() - dateToleranceDays * 24 * 60 * 60 * 1000),
              lte: new Date(payout.arrivalDate.getTime() + dateToleranceDays * 24 * 60 * 60 * 1000),
            },
            // Look for transactions with amounts that could be partials
            OR: [
              { amountMinor: { lt: payoutNetMinor, gt: payoutNetMinor / BigInt(2) } },
              { amountMinor: { gt: payoutNetMinor, lt: payoutNetMinor * BigInt(2) } },
            ],
          },
          take: 5,
        });

        if (partialCandidates.length > 0) {
          // Check if sum of candidates equals payout
          const totalPartial = partialCandidates.reduce((sum, c) => sum + c.amountMinor, BigInt(0));
          const variance = totalPartial > payoutNetMinor 
            ? totalPartial - payoutNetMinor 
            : payoutNetMinor - totalPartial;
          
          if (variance < payoutNetMinor / BigInt(10)) { // Within 10%
            await prisma.stripeException.create({
              data: {
                kind: ExceptionType.PARTIAL_PAYMENT_DETECTED,
                refId: payout.id,
                message: ExceptionMessages.PARTIAL_PAYMENT_DETECTED,
                data: {
                  payoutId: payout.id,
                  payoutAmount: payoutNetMinor.toString(),
                  currency: payout.currency,
                  arrivalDate: payout.arrivalDate.toISOString(),
                  partialCandidates: partialCandidates.map(c => ({
                    id: c.id,
                    amount: c.amountMinor.toString(),
                    date: c.date.toISOString(),
                    name: c.name,
                  })),
                },
              },
            });
            partialPaymentCount++;
            exceptionsCreated++;
            console.log(`🔀 Partial payment detected for payout ${payout.id}`);
            continue;
          }
        }
      }

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
            kind: ExceptionType.PAYOUT_NO_BANK_MATCH,
            refId: payout.id,
            message: ExceptionMessages.PAYOUT_NO_BANK_MATCH,
            data: {
              payoutId: payout.id,
              amountMinor: payoutNetMinor.toString(),
              currency: payout.currency,
              arrivalDate: payout.arrivalDate.toISOString(),
            },
          },
        });
        noMatchCount++;
        exceptionsCreated++;
        unmatchedPayouts.push({
          id: payout.id,
          amountMinor: payoutNetMinor,
          currency: payout.currency,
        });
        console.log(`❌ No match for payout ${payout.id} (${payoutNetMinor} ${payout.currency})`);
      } else {
        // Multiple candidates - ambiguous match
        await prisma.stripeException.create({
          data: {
            kind: ExceptionType.AMBIGUOUS_MATCH,
            refId: payout.id,
            message: ExceptionMessages.AMBIGUOUS_MATCH,
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
        exceptionsCreated++;
        console.log(`⚠️  Ambiguous match for payout ${payout.id} (${payoutNetMinor} ${payout.currency}) - ${candidates.length} candidates`);
      }
    }

    console.log(`Matching complete: ${matchedCount} matched, ${noMatchCount} no match, ${ambiguousCount} ambiguous, ${multiCurrencyCount} multi-currency, ${partialPaymentCount} partial, ${exceptionsCreated} exceptions`);

    return {
      scanned: payouts.length,
      matchedCount,
      noMatchCount,
      ambiguousCount,
      multiCurrencyCount,
      partialPaymentCount,
      exceptionsCreated,
      unmatchedPayouts: unmatchedPayouts.slice(0, 10), // Limit to first 10 for response size
    };
  } catch (error) {
    console.error('Error in matchPayoutsToBank:', error);
    throw error;
  }
}