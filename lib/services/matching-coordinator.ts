import { query, trackEvent } from '../db-utils'
import { PayoutBankMatcher } from './matchers/payout-bank'
import { LedgerMatcher } from './matchers/ledger'

export interface MatchingReport {
  companyId: string
  status: 'completed' | 'failed' | 'partial'
  results: {
    payoutBankMatches: number
    payoutBankExceptions: number
    ledgerMatches: number
    ledgerExceptions: number
    totalMatches: number
    totalExceptions: number
  }
  errors: string[]
  duration: number
  startedAt: Date
  completedAt: Date
}

export class MatchingCoordinator {
  private payoutBankMatcher: PayoutBankMatcher
  private ledgerMatcher: LedgerMatcher

  constructor() {
    this.payoutBankMatcher = new PayoutBankMatcher()
    this.ledgerMatcher = new LedgerMatcher()
  }

  // Run matching for a company
  async runMatching(companyId: string): Promise<MatchingReport> {
    const startTime = Date.now()
    const startedAt = new Date()
    
    console.log(`🔄 Starting matching process for company ${companyId}`)
    await trackEvent('matching_started', companyId, { startedAt })

    const results = {
      payoutBankMatches: 0,
      payoutBankExceptions: 0,
      ledgerMatches: 0,
      ledgerExceptions: 0,
      totalMatches: 0,
      totalExceptions: 0
    }
    const errors: string[] = []

    try {
      // Step 1: Payout → Bank matching
      console.log('🔍 Step 1: Payout → Bank matching')
      const payoutBankResult = await this.runPayoutBankMatching(companyId)
      results.payoutBankMatches = payoutBankResult.matches
      results.payoutBankExceptions = payoutBankResult.exceptions
      results.totalMatches += payoutBankResult.matches
      results.totalExceptions += payoutBankResult.exceptions

      // Step 2: Bank/Payout → Ledger matching
      console.log('🔍 Step 2: Bank/Payout → Ledger matching')
      const ledgerResult = await this.runLedgerMatching(companyId)
      results.ledgerMatches = ledgerResult.matches
      results.ledgerExceptions = ledgerResult.exceptions
      results.totalMatches += ledgerResult.matches
      results.totalExceptions += ledgerResult.exceptions

      const duration = Date.now() - startTime
      const completedAt = new Date()
      const status = errors.length === 0 ? 'completed' : 'partial'

      const report: MatchingReport = {
        companyId,
        status,
        results,
        errors,
        duration,
        startedAt,
        completedAt
      }

      await trackEvent('matching_completed', companyId, { 
        duration, 
        totalMatches: results.totalMatches,
        totalExceptions: results.totalExceptions 
      })

      console.log(`✅ Matching completed for company ${companyId}: ${results.totalMatches} matches, ${results.totalExceptions} exceptions`)
      return report

    } catch (error) {
      const duration = Date.now() - startTime
      const completedAt = new Date()
      
      await trackEvent('matching_failed', companyId, { 
        duration, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })

      console.error(`❌ Matching failed for company ${companyId}:`, error)
      
      return {
        companyId,
        status: 'failed',
        results,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        duration,
        startedAt,
        completedAt
      }
    }
  }

  // Run payout → bank matching
  private async runPayoutBankMatching(companyId: string): Promise<{
    matches: number
    exceptions: number
  }> {
    try {
      // Get unmatched payouts
      const unmatchedPayouts = await this.getUnmatchedPayouts(companyId)
      console.log(`📊 Found ${unmatchedPayouts.length} unmatched payouts`)

      let matches = 0
      let exceptions = 0

      for (const payout of unmatchedPayouts) {
        try {
          const result = await this.payoutBankMatcher.match(payout)
          
          if (result.success && result.match) {
            matches++
            console.log(`✅ Matched payout ${payout.payout_id} to bank transaction ${result.match.bankTransactionId}`)
          } else if (result.exception) {
            exceptions++
            await this.createException(companyId, result.exception)
            console.log(`⚠️ Created exception for payout ${payout.payout_id}: ${result.exception.type}`)
          }
        } catch (error) {
          console.error(`Error matching payout ${payout.payout_id}:`, error)
          exceptions++
        }
      }

      return { matches, exceptions }
    } catch (error) {
      console.error('Error in payout → bank matching:', error)
      throw error
    }
  }

  // Run bank/payout → ledger matching
  private async runLedgerMatching(companyId: string): Promise<{
    matches: number
    exceptions: number
  }> {
    try {
      // Get matched payouts that don't have ledger entries
      const matchedPayouts = await this.getMatchedPayoutsWithoutLedger(companyId)
      console.log(`📊 Found ${matchedPayouts.length} matched payouts without ledger entries`)

      let matches = 0
      let exceptions = 0

      for (const payout of matchedPayouts) {
        try {
          const result = await this.processLedgerMatching(companyId, payout)
          
          if (result.success) {
            matches++
            console.log(`✅ Created ledger entry for payout ${payout.payout_id}`)
          } else {
            exceptions++
            await this.createException(companyId, result.exception)
            console.log(`⚠️ Created exception for payout ${payout.payout_id}: ${result.exception.type}`)
          }
        } catch (error) {
          console.error(`Error processing ledger for payout ${payout.payout_id}:`, error)
          exceptions++
        }
      }

      return { matches, exceptions }
    } catch (error) {
      console.error('Error in ledger matching:', error)
      throw error
    }
  }

  // Process ledger matching for a payout
  private async processLedgerMatching(companyId: string, payout: any): Promise<{
    success: boolean
    exception?: any
  }> {
    try {
      // Get the matched bank transaction
      const bankMatch = await this.getBankMatchForPayout(companyId, payout.payout_id)
      if (!bankMatch) {
        return {
          success: false,
          exception: {
            type: 'PAYOUT_MISSING_BANK_MATCH',
            payoutId: payout.payout_id,
            evidence: { payout_id: payout.payout_id }
          }
        }
      }

      // Check if deposit already exists
      const existingDeposit = await this.ledgerMatcher.findExistingDeposit(
        bankMatch.bank_transaction, 
        payout
      )

      if (existingDeposit) {
        // Create match record
        await this.createLedgerMatch(companyId, payout.payout_id, existingDeposit.id)
        return { success: true }
      }

      // Propose creation
      const proposedAction = await this.ledgerMatcher.proposeCreation(
        bankMatch.bank_transaction, 
        payout
      )

      // Create exception for manual review
      return {
        success: false,
        exception: {
          type: 'PAYOUT_MISSING_IN_QBO',
          payoutId: payout.payout_id,
          evidence: {
            payout_amount: payout.amount_net,
            payout_currency: payout.currency,
            payout_date: payout.arrival_date,
            proposed_action: proposedAction
          }
        }
      }

    } catch (error) {
      console.error('Error in ledger matching process:', error)
      return {
        success: false,
        exception: {
          type: 'LEDGER_MATCH_ERROR',
          payoutId: payout.payout_id,
          evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  // Get unmatched payouts
  private async getUnmatchedPayouts(companyId: string): Promise<any[]> {
    const result = await query(`
      SELECT sp.* FROM stripe_payouts sp
      LEFT JOIN matches m ON (
        m.left_type = 'payout' AND m.left_ref = sp.payout_id
      )
      WHERE sp.company_id = $1 AND m.id IS NULL
      ORDER BY sp.arrival_date DESC
    `, [companyId])

    return result.rows
  }

  // Get matched payouts without ledger entries
  private async getMatchedPayoutsWithoutLedger(companyId: string): Promise<any[]> {
    const result = await query(`
      SELECT sp.* FROM stripe_payouts sp
      JOIN matches m ON (
        m.left_type = 'payout' AND m.left_ref = sp.payout_id
      )
      LEFT JOIN matches lm ON (
        lm.left_type = 'payout' AND lm.left_ref = sp.payout_id AND lm.right_type = 'qbo'
      )
      WHERE sp.company_id = $1 AND lm.id IS NULL
      ORDER BY sp.arrival_date DESC
    `, [companyId])

    return result.rows
  }

  // Get bank match for a payout
  private async getBankMatchForPayout(companyId: string, payoutId: string): Promise<any> {
    const result = await query(`
      SELECT m.*, bt.* FROM matches m
      JOIN bank_transactions bt ON m.right_ref = bt.id
      WHERE m.company_id = $1 
        AND m.left_type = 'payout' 
        AND m.left_ref = $2
        AND m.right_type = 'bank'
      LIMIT 1
    `, [companyId, payoutId])

    if (result.rows.length === 0) {
      return null
    }

    return {
      match: result.rows[0],
      bank_transaction: result.rows[0]
    }
  }

  // Create exception
  private async createException(companyId: string, exception: any): Promise<void> {
    await query(`
      INSERT INTO exceptions (
        company_id, type, entity_refs, evidence_jsonb, 
        proposed_action, confidence, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
      companyId,
      exception.type,
      JSON.stringify({ payout_id: exception.payoutId }),
      JSON.stringify(exception.evidence),
      exception.type === 'PAYOUT_MISSING_IN_QBO' ? 'create_qbo_deposit' : null,
      exception.evidence?.best_confidence || 0.5,
      'open'
    ])
  }

  // Create ledger match
  private async createLedgerMatch(companyId: string, payoutId: string, qboId: string): Promise<void> {
    await query(`
      INSERT INTO matches (
        company_id, left_ref, right_ref, left_type, right_type,
        strategy, confidence, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
      companyId,
      payoutId,
      qboId,
      'payout',
      'qbo',
      'payout_qbo_auto',
      0.95
    ])
  }

  // Get matching statistics
  async getMatchingStats(companyId: string): Promise<{
    totalPayouts: number
    matchedPayouts: number
    unmatchedPayouts: number
    matchRate: number
    totalExceptions: number
    exceptionBreakdown: { [key: string]: number }
  }> {
    try {
      const payoutsResult = await query(`
        SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1
      `, [companyId])

      const matchesResult = await query(`
        SELECT COUNT(*) as count FROM matches 
        WHERE company_id = $1 AND left_type = 'payout'
      `, [companyId])

      const exceptionsResult = await query(`
        SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1
      `, [companyId])

      const exceptionTypesResult = await query(`
        SELECT type, COUNT(*) as count 
        FROM exceptions 
        WHERE company_id = $1 
        GROUP BY type
      `, [companyId])

      const totalPayouts = parseInt(payoutsResult.rows[0].count)
      const matchedPayouts = parseInt(matchesResult.rows[0].count)
      const unmatchedPayouts = totalPayouts - matchedPayouts
      const matchRate = totalPayouts > 0 ? (matchedPayouts / totalPayouts) * 100 : 0
      const totalExceptions = parseInt(exceptionsResult.rows[0].count)

      const exceptionBreakdown: { [key: string]: number } = {}
      exceptionTypesResult.rows.forEach((row: any) => {
        exceptionBreakdown[row.type] = parseInt(row.count)
      })

      return {
        totalPayouts,
        matchedPayouts,
        unmatchedPayouts,
        matchRate,
        totalExceptions,
        exceptionBreakdown
      }
    } catch (error) {
      console.error('Error getting matching stats:', error)
      return {
        totalPayouts: 0,
        matchedPayouts: 0,
        unmatchedPayouts: 0,
        matchRate: 0,
        totalExceptions: 0,
        exceptionBreakdown: {}
      }
    }
  }
}
