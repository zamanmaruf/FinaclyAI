import { query } from '../db-utils'

export interface Exception {
  id?: string
  companyId: string
  type: string
  subtype?: string
  entityRefs: any
  evidence: any
  proposedAction?: 'create_qbo_deposit' | 'mark_invoice_paid' | 'create_transfer' | 'create_expense' | 'ignore'
  confidence: number
  status: 'open' | 'resolved' | 'ignored'
  createdAt?: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export class ExceptionsEngine {
  private readonly EXCEPTION_TYPES = [
    'PAYOUT_MISSING_IN_BANK',
    'AMBIGUOUS_BANK_CANDIDATES', 
    'PAYOUT_MISSING_IN_QBO',
    'CASH_DEPOSIT_DETECTED',
    'BANK_CREDIT_UNCLASSIFIED',
    'BANK_DEBIT_UNCLASSIFIED',
    'INTERNAL_TRANSFER_UNLINKED',
    'MULTI_CURRENCY_REVIEW'
  ]

  // Generate exceptions for a company
  async generateExceptions(companyId: string, matches: any[]): Promise<Exception[]> {
    try {
      console.log(`🔍 Generating exceptions for company ${companyId}`)
      
      const exceptions: Exception[] = []
      
      // Clear existing exceptions for this company
      await query('DELETE FROM exceptions WHERE company_id = $1', [companyId])
      
      // Track matched transaction IDs
      const matchedIds = new Set<string>()
      matches.forEach(match => {
        if (match.stripeChargeId) matchedIds.add(`charge_${match.stripeChargeId}`)
        if (match.stripePayoutId) matchedIds.add(`payout_${match.stripePayoutId}`)
        if (match.bankTransactionId) matchedIds.add(`bank_${match.bankTransactionId}`)
        if (match.qboTransactionId) matchedIds.add(`qbo_${match.qboTransactionId}`)
      })

      // Check for unmatched Stripe payouts (CRITICAL)
      const unmatchedPayouts = await this.getUnmatchedPayouts(companyId, matchedIds)
      for (const payout of unmatchedPayouts) {
        const exception = await this.createPayoutMissingInBankException(companyId, payout)
        exceptions.push(exception)
      }

      // Check for unmatched Stripe charges (HIGH)
      const unmatchedCharges = await this.getUnmatchedCharges(companyId, matchedIds)
      for (const charge of unmatchedCharges) {
        const exception = await this.createChargeMissingException(companyId, charge)
        exceptions.push(exception)
      }

      // Check for unmatched bank transactions (MEDIUM)
      const unmatchedBankTxns = await this.getUnmatchedBankTransactions(companyId, matchedIds)
      for (const bankTx of unmatchedBankTxns) {
        const exception = await this.createBankTransactionException(companyId, bankTx)
        exceptions.push(exception)
      }

      // Check for unmatched QBO transactions (LOW)
      const unmatchedQBO = await this.getUnmatchedQBOTransactions(companyId, matchedIds)
      for (const qboTx of unmatchedQBO) {
        const exception = await this.createQBOTransactionException(companyId, qboTx)
        exceptions.push(exception)
      }

      // Check for cash deposits
      const cashDeposits = await this.getCashDeposits(companyId)
      for (const deposit of cashDeposits) {
        const exception = await this.createCashDepositException(companyId, deposit)
        exceptions.push(exception)
      }

      // Check for multi-currency transactions
      const multiCurrencyTxns = await this.getMultiCurrencyTransactions(companyId)
      for (const txn of multiCurrencyTxns) {
        const exception = await this.createMultiCurrencyException(companyId, txn)
        exceptions.push(exception)
      }

      // Store all exceptions
      for (const exception of exceptions) {
        await this.storeException(exception)
      }

      console.log(`✅ Generated ${exceptions.length} exceptions for company ${companyId}`)
      return exceptions

    } catch (error) {
      console.error('Error generating exceptions:', error)
      throw error
    }
  }

  // Create payout missing in bank exception
  private async createPayoutMissingInBankException(companyId: string, payout: any): Promise<Exception> {
    return {
      companyId,
      type: 'PAYOUT_MISSING_IN_BANK',
      entityRefs: { payout_id: payout.payout_id },
      evidence: {
        payout_amount: payout.amount_net,
        payout_currency: payout.currency,
        payout_date: payout.arrival_date,
        payout_status: payout.status,
        search_window_days: 2,
        description: `Unmatched Stripe payout: $${(payout.amount_net / 100).toFixed(2)} ${payout.currency} on ${payout.arrival_date}`
      },
      proposedAction: 'create_qbo_deposit',
      confidence: 0.9,
      status: 'open'
    }
  }

  // Create charge missing exception
  private async createChargeMissingException(companyId: string, charge: any): Promise<Exception> {
    return {
      companyId,
      type: 'STRIPE_CHARGE_UNMATCHED',
      entityRefs: { charge_id: charge.id },
      evidence: {
        charge_amount: charge.amount,
        charge_currency: charge.currency,
        charge_date: charge.created_at,
        charge_status: charge.status,
        description: `Unmatched Stripe charge: $${(charge.amount / 100).toFixed(2)} ${charge.currency} on ${charge.created_at}`
      },
      proposedAction: 'mark_invoice_paid',
      confidence: 0.8,
      status: 'open'
    }
  }

  // Create bank transaction exception
  private async createBankTransactionException(companyId: string, bankTx: any): Promise<Exception> {
    const transactionType = bankTx.amount > 0 ? 'deposit' : 'withdrawal'
    const severity = transactionType === 'deposit' ? 'medium' : 'low'
    
    return {
      companyId,
      type: 'BANK_TRANSACTION_UNMATCHED',
      entityRefs: { bank_transaction_id: bankTx.id },
      evidence: {
        transaction_amount: bankTx.amount,
        transaction_currency: bankTx.currency,
        transaction_date: bankTx.posted_date,
        transaction_type: transactionType,
        original_description: bankTx.description,
        severity,
        description: `Unmatched bank ${transactionType}: $${(Math.abs(bankTx.amount) / 100).toFixed(2)} ${bankTx.currency} on ${bankTx.posted_date}`
      },
      proposedAction: transactionType === 'deposit' ? 'create_qbo_deposit' : 'create_expense',
      confidence: 0.7,
      status: 'open'
    }
  }

  // Create QBO transaction exception
  private async createQBOTransactionException(companyId: string, qboTx: any): Promise<Exception> {
    return {
      companyId,
      type: 'QBO_TRANSACTION_UNMATCHED',
      entityRefs: { qbo_id: qboTx.qbo_id },
      evidence: {
        qbo_type: qboTx.obj_type,
        qbo_amount: qboTx.amount,
        qbo_currency: qboTx.currency,
        qbo_date: qboTx.txn_date,
        qbo_memo: qboTx.memo,
        description: `Unmatched QuickBooks ${qboTx.obj_type}: $${(qboTx.amount / 100).toFixed(2)} ${qboTx.currency} on ${qboTx.txn_date}`
      },
      proposedAction: 'ignore',
      confidence: 0.6,
      status: 'open'
    }
  }

  // Create cash deposit exception
  private async createCashDepositException(companyId: string, deposit: any): Promise<Exception> {
    return {
      companyId,
      type: 'CASH_DEPOSIT_DETECTED',
      entityRefs: { bank_transaction_id: deposit.id },
      evidence: {
        deposit_amount: deposit.amount,
        deposit_currency: deposit.currency,
        deposit_date: deposit.posted_date,
        deposit_description: deposit.description,
        desc_hits: this.extractKeywords(deposit.description),
        description: `Cash deposit detected: $${(deposit.amount / 100).toFixed(2)} ${deposit.currency} on ${deposit.posted_date}`
      },
      proposedAction: 'create_qbo_deposit',
      confidence: 0.85,
      status: 'open'
    }
  }

  // Create multi-currency exception
  private async createMultiCurrencyException(companyId: string, txn: any): Promise<Exception> {
    return {
      companyId,
      type: 'MULTI_CURRENCY_REVIEW',
      entityRefs: { transaction_id: txn.id },
      evidence: {
        original_currency: txn.original_currency,
        home_currency: txn.home_currency,
        exchange_rate: txn.exchange_rate,
        original_amount: txn.original_amount,
        home_amount: txn.home_amount,
        description: `Multi-currency transaction requires review: ${txn.original_amount} ${txn.original_currency} = ${txn.home_amount} ${txn.home_currency}`
      },
      proposedAction: 'ignore',
      confidence: 0.9,
      status: 'open'
    }
  }

  // Get unmatched payouts
  private async getUnmatchedPayouts(companyId: string, matchedIds: Set<string>): Promise<any[]> {
    const result = await query(`
      SELECT * FROM stripe_payouts 
      WHERE company_id = $1 
      ORDER BY arrival_date DESC
    `, [companyId])

    return result.rows.filter((payout: any) => !matchedIds.has(`payout_${payout.payout_id}`))
  }

  // Get unmatched charges
  private async getUnmatchedCharges(companyId: string, matchedIds: Set<string>): Promise<any[]> {
    const result = await query(`
      SELECT * FROM stripe_balance_txns 
      WHERE company_id = $1 AND type = 'charge'
      ORDER BY created DESC
    `, [companyId])

    return result.rows.filter((charge: any) => !matchedIds.has(`charge_${charge.balance_id}`))
  }

  // Get unmatched bank transactions
  private async getUnmatchedBankTransactions(companyId: string, matchedIds: Set<string>): Promise<any[]> {
    const result = await query(`
      SELECT bt.* FROM bank_transactions bt
      WHERE bt.company_id = $1
      ORDER BY bt.posted_date DESC
    `, [companyId])

    return result.rows.filter((tx: any) => !matchedIds.has(`bank_${tx.id}`))
  }

  // Get unmatched QBO transactions
  private async getUnmatchedQBOTransactions(companyId: string, matchedIds: Set<string>): Promise<any[]> {
    const result = await query(`
      SELECT * FROM qbo_objects 
      WHERE company_id = $1
      ORDER BY txn_date DESC
    `, [companyId])

    return result.rows.filter((tx: any) => !matchedIds.has(`qbo_${tx.qbo_id}`))
  }

  // Get cash deposits
  private async getCashDeposits(companyId: string): Promise<any[]> {
    const result = await query(`
      SELECT * FROM bank_transactions 
      WHERE company_id = $1 
        AND amount > 0 
        AND (
          LOWER(description) LIKE '%cash%' OR 
          LOWER(description) LIKE '%branch%' OR
          LOWER(description) LIKE '%deposit%'
        )
      ORDER BY posted_date DESC
    `, [companyId])

    return result.rows
  }

  // Get multi-currency transactions
  private async getMultiCurrencyTransactions(companyId: string): Promise<any[]> {
    // This would require FX data - for now return empty array
    return []
  }

  // Extract keywords from description
  private extractKeywords(description: string): string[] {
    if (!description) return []
    
    const keywords: string[] = []
    const desc = description.toLowerCase()
    
    if (desc.includes('cash')) keywords.push('CASH')
    if (desc.includes('branch')) keywords.push('BRANCH')
    if (desc.includes('deposit')) keywords.push('DEPOSIT')
    if (desc.includes('atm')) keywords.push('ATM')
    
    return keywords
  }

  // Store exception in database
  private async storeException(exception: Exception): Promise<void> {
    await query(`
      INSERT INTO exceptions (
        company_id, type, subtype, entity_refs, evidence_jsonb,
        proposed_action, confidence, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    `, [
      exception.companyId,
      exception.type,
      exception.subtype,
      JSON.stringify(exception.entityRefs),
      JSON.stringify(exception.evidence),
      exception.proposedAction,
      exception.confidence,
      exception.status
    ])
  }

  // Get exceptions for a company
  async getExceptions(companyId: string, status?: string): Promise<Exception[]> {
    try {
      let queryText = `
        SELECT * FROM exceptions 
        WHERE company_id = $1
      `
      const params: any[] = [companyId]
      
      if (status) {
        queryText += ' AND status = $2'
        params.push(status)
      }
      
      queryText += ' ORDER BY created_at DESC'
      
      const result = await query(queryText, params)
      
      return result.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        type: row.type,
        subtype: row.subtype,
        entityRefs: row.entity_refs,
        evidence: row.evidence_jsonb,
        proposedAction: row.proposed_action,
        confidence: parseFloat(row.confidence),
        status: row.status,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
        resolvedBy: row.resolved_by
      }))
    } catch (error) {
      console.error('Error getting exceptions:', error)
      return []
    }
  }

  // Get exception statistics
  async getExceptionStats(companyId: string): Promise<{
    totalExceptions: number
    openExceptions: number
    resolvedExceptions: number
    ignoredExceptions: number
    typeBreakdown: { [key: string]: number }
    severityBreakdown: { [key: string]: number }
  }> {
    try {
      const totalResult = await query(`
        SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1
      `, [companyId])

      const statusResult = await query(`
        SELECT status, COUNT(*) as count 
        FROM exceptions 
        WHERE company_id = $1 
        GROUP BY status
      `, [companyId])

      const typeResult = await query(`
        SELECT type, COUNT(*) as count 
        FROM exceptions 
        WHERE company_id = $1 
        GROUP BY type
      `, [companyId])

      const totalExceptions = parseInt(totalResult.rows[0].count)
      
      const statusBreakdown: { [key: string]: number } = {}
      statusResult.rows.forEach((row: any) => {
        statusBreakdown[row.status] = parseInt(row.count)
      })

      const typeBreakdown: { [key: string]: number } = {}
      typeResult.rows.forEach((row: any) => {
        typeBreakdown[row.type] = parseInt(row.count)
      })

      // Calculate severity breakdown based on exception types
      const severityBreakdown: { [key: string]: number } = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }

      for (const [type, count] of Object.entries(typeBreakdown)) {
        if (type.includes('PAYOUT_MISSING')) severityBreakdown.critical += count
        else if (type.includes('STRIPE_CHARGE')) severityBreakdown.high += count
        else if (type.includes('BANK_TRANSACTION')) severityBreakdown.medium += count
        else severityBreakdown.low += count
      }

      return {
        totalExceptions,
        openExceptions: statusBreakdown.open || 0,
        resolvedExceptions: statusBreakdown.resolved || 0,
        ignoredExceptions: statusBreakdown.ignored || 0,
        typeBreakdown,
        severityBreakdown
      }
    } catch (error) {
      console.error('Error getting exception stats:', error)
      return {
        totalExceptions: 0,
        openExceptions: 0,
        resolvedExceptions: 0,
        ignoredExceptions: 0,
        typeBreakdown: {},
        severityBreakdown: {}
      }
    }
  }
}
