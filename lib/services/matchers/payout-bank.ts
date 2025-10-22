import { query } from '../../db-utils'
import { NormalizationService } from '../normalization'

export interface MatchResult {
  success: boolean
  match?: {
    payoutId: string
    bankTransactionId: string
    confidence: number
    strategy: string
    evidence: any
  }
  exception?: {
    type: string
    payoutId: string
    candidates?: any[]
    evidence: any
  }
}

export interface BankCandidate {
  transaction: any
  confidence: number
  reasons: string[]
  validationChecks: string[]
}

export class PayoutBankMatcher {
  private normalizationService: NormalizationService
  private readonly MATCH_THRESHOLD = 0.95
  private readonly AMBIGUOUS_THRESHOLD = 0.80
  private readonly DATE_TOLERANCE_DAYS = 2

  constructor() {
    this.normalizationService = new NormalizationService()
  }

  // Find candidates for a payout
  async findCandidates(payout: any): Promise<BankCandidate[]> {
    try {
      const companyId = payout.company_id
      const payoutAmount = payout.amount_net
      const payoutDate = new Date(payout.arrival_date)
      const payoutCurrency = payout.currency

      // Get bank transactions within date range and amount tolerance
      const startDate = new Date(payoutDate)
      startDate.setDate(startDate.getDate() - this.DATE_TOLERANCE_DAYS)
      
      const endDate = new Date(payoutDate)
      endDate.setDate(endDate.getDate() + this.DATE_TOLERANCE_DAYS)

      const bankTransactions = await query(`
        SELECT bt.*, ba.name as account_name
        FROM bank_transactions bt
        JOIN bank_accounts ba ON bt.account_id = ba.id
        WHERE bt.company_id = $1 
          AND bt.posted_date BETWEEN $2 AND $3
          AND bt.amount > 0
          AND bt.currency = $4
          AND ABS(bt.amount - $5) <= $6
        ORDER BY ABS(bt.amount - $5) ASC, bt.posted_date ASC
      `, [
        companyId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        payoutCurrency,
        payoutAmount,
        Math.max(payoutAmount * 0.01, 1) // 1% tolerance, minimum 1 cent
      ])

      const candidates: BankCandidate[] = []

      for (const bankTx of bankTransactions.rows) {
        const candidate = await this.scoreCandidate(payout, bankTx)
        if (candidate.confidence >= this.AMBIGUOUS_THRESHOLD) {
          candidates.push(candidate)
        }
      }

      // Sort by confidence descending
      return candidates.sort((a, b) => b.confidence - a.confidence)

    } catch (error) {
      console.error('Error finding bank candidates:', error)
      return []
    }
  }

  // Score a candidate match
  async scoreCandidate(payout: any, bankTx: any): Promise<BankCandidate> {
    const validationChecks: string[] = []
    const reasons: string[] = []
    let confidence = 0

    // Amount matching (60% weight) - exact formula from spec
    const amountScore = this.calculateAmountScore(payout.amount_net, bankTx.amount)
    confidence += amountScore * 0.60
    if (amountScore > 0.9) {
      validationChecks.push('high_amount_match')
      reasons.push('amount within tolerance')
    }

    // Date matching (25% weight)
    const dateScore = this.calculateDateScore(payout.arrival_date, bankTx.posted_date)
    confidence += dateScore * 0.25
    if (dateScore > 0.8) {
      validationChecks.push('good_date_match')
      reasons.push('date within tolerance')
    }

    // Description matching (15% weight)
    const descriptionScore = this.calculateDescriptionScore(payout, bankTx)
    confidence += descriptionScore * 0.15
    if (descriptionScore > 0.5) {
      validationChecks.push('description_match')
      reasons.push('similar descriptions')
    }

    return {
      transaction: bankTx,
      confidence: Math.min(confidence, 1.0),
      reasons,
      validationChecks
    }
  }

  // Match a payout to bank transaction
  async match(payout: any): Promise<MatchResult> {
    try {
      console.log(`🔍 Matching payout ${payout.payout_id} to bank transactions`)

      const candidates = await this.findCandidates(payout)

      if (candidates.length === 0) {
        // No candidates found - create exception
        return {
          success: false,
          exception: {
            type: 'PAYOUT_MISSING_IN_BANK',
            payoutId: payout.payout_id,
            evidence: {
              payout_amount: payout.amount_net,
              payout_currency: payout.currency,
              payout_date: payout.arrival_date,
              search_window_days: this.DATE_TOLERANCE_DAYS
            }
          }
        }
      }

      const bestCandidate = candidates[0]

      if (bestCandidate.confidence >= this.MATCH_THRESHOLD) {
        // High confidence match - auto-match
        const matchId = await this.createMatch(payout, bestCandidate.transaction, bestCandidate.confidence)
        
        return {
          success: true,
          match: {
            payoutId: payout.payout_id,
            bankTransactionId: bestCandidate.transaction.id,
            confidence: bestCandidate.confidence,
            strategy: 'auto_match',
            evidence: {
              amount_match: this.calculateAmountScore(payout.amount_net, bestCandidate.transaction.amount),
              date_match: this.calculateDateScore(payout.arrival_date, bestCandidate.transaction.posted_date),
              description_match: this.calculateDescriptionScore(payout, bestCandidate.transaction),
              validation_checks: bestCandidate.validationChecks
            }
          }
        }
      } else if (bestCandidate.confidence >= this.AMBIGUOUS_THRESHOLD) {
        // Ambiguous match - create exception for manual review
        return {
          success: false,
          exception: {
            type: 'AMBIGUOUS_BANK_CANDIDATES',
            payoutId: payout.payout_id,
            candidates: candidates.slice(0, 3).map(c => ({
              id: c.transaction.id,
              amount: c.transaction.amount,
              date: c.transaction.posted_date,
              description: c.transaction.description,
              confidence: c.confidence
            })),
            evidence: {
              payout_amount: payout.amount_net,
              payout_currency: payout.currency,
              payout_date: payout.arrival_date,
              best_confidence: bestCandidate.confidence,
              candidate_count: candidates.length
            }
          }
        }
      } else {
        // Low confidence - no match
        return {
          success: false,
          exception: {
            type: 'PAYOUT_MISSING_IN_BANK',
            payoutId: payout.payout_id,
            evidence: {
              payout_amount: payout.amount_net,
              payout_currency: payout.currency,
              payout_date: payout.arrival_date,
              best_confidence: bestCandidate.confidence,
              search_window_days: this.DATE_TOLERANCE_DAYS
            }
          }
        }
      }

    } catch (error) {
      console.error('Error matching payout to bank:', error)
      return {
        success: false,
        exception: {
          type: 'MATCH_ERROR',
          payoutId: payout.payout_id,
          evidence: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }
  }

  // Create match record in database
  private async createMatch(payout: any, bankTx: any, confidence: number): Promise<string> {
    const result = await query(`
      INSERT INTO matches (
        company_id, left_ref, right_ref, left_type, right_type,
        strategy, confidence, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      payout.company_id,
      payout.payout_id,
      bankTx.id,
      'payout',
      'bank',
      'payout_bank_auto',
      confidence
    ])

    return result.rows[0].id
  }

  // Calculate amount match score
  private calculateAmountScore(amount1: number, amount2: number): number {
    if (amount1 === amount2) return 1.0
    
    const diff = Math.abs(amount1 - amount2)
    const tolerance = Math.max(amount1 * 0.005, 1) // 0.5% tolerance, minimum 1 cent
    
    if (diff <= tolerance) return 0.95
    if (diff <= tolerance * 2) return 0.8
    if (diff <= tolerance * 3) return 0.6
    return 0.0
  }

  // Calculate date match score
  private calculateDateScore(date1: string, date2: string): number {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)
    
    if (diffDays === 0) return 1.0
    if (diffDays <= 1) return 0.95
    if (diffDays <= 2) return 0.85
    if (diffDays <= 3) return 0.7
    if (diffDays <= 7) return 0.5
    return 0.0
  }

  // Calculate description match score
  private calculateDescriptionScore(payout: any, bankTx: any): number {
    const payoutDesc = (payout.description || '').toLowerCase()
    const bankDesc = (bankTx.description || bankTx.name || '').toLowerCase()
    
    if (!payoutDesc && !bankDesc) return 0.5
    
    // Look for Stripe-related keywords in bank description
    const stripeKeywords = ['stripe', 'strp', 'payment processor', 'stripe payout']
    const hasStripeKeyword = stripeKeywords.some(keyword => 
      bankDesc.includes(keyword.toLowerCase())
    )
    
    if (hasStripeKeyword) return 0.9
    
    // Simple word overlap
    const words1 = payoutDesc.split(/\s+/)
    const words2 = bankDesc.split(/\s+/)
    const commonWords = words1.filter((word: string) => words2.includes(word))
    
    if (words1.length === 0 && words2.length === 0) return 0.5
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  // Get match statistics
  async getMatchStats(companyId: string): Promise<{
    totalPayouts: number
    matchedPayouts: number
    unmatchedPayouts: number
    matchRate: number
    averageConfidence: number
  }> {
    try {
      const payoutsResult = await query(`
        SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1
      `, [companyId])

      const matchesResult = await query(`
        SELECT COUNT(*) as count, AVG(confidence) as avg_confidence
        FROM matches 
        WHERE company_id = $1 AND left_type = 'payout' AND right_type = 'bank'
      `, [companyId])

      const totalPayouts = parseInt(payoutsResult.rows[0].count)
      const matchedPayouts = parseInt(matchesResult.rows[0].count)
      const unmatchedPayouts = totalPayouts - matchedPayouts
      const matchRate = totalPayouts > 0 ? (matchedPayouts / totalPayouts) * 100 : 0
      const averageConfidence = parseFloat(matchesResult.rows[0].avg_confidence) || 0

      return {
        totalPayouts,
        matchedPayouts,
        unmatchedPayouts,
        matchRate,
        averageConfidence
      }
    } catch (error) {
      console.error('Error getting match stats:', error)
      return {
        totalPayouts: 0,
        matchedPayouts: 0,
        unmatchedPayouts: 0,
        matchRate: 0,
        averageConfidence: 0
      }
    }
  }
}
