import { query } from '../../db-utils'

export interface ProposedAction {
  type: 'create_deposit' | 'create_payment' | 'create_transfer' | 'create_expense'
  payload: any
  confidence: number
  evidence: any
}

export interface QBOObject {
  id: string
  type: string
  amount: number
  currency: string
  txnDate: string
  memo?: string
  externalRef?: string
}

export class LedgerMatcher {
  private readonly DATE_TOLERANCE_DAYS = 2
  private readonly AMOUNT_TOLERANCE_PERCENT = 0.5

  // Find existing deposit in QBO
  async findExistingDeposit(bank: any, payout?: any): Promise<QBOObject | null> {
    try {
      const companyId = bank.company_id
      const bankAmount = bank.amount
      const bankDate = bank.posted_date
      const bankCurrency = bank.currency

      // Search for existing deposits with matching amount and date
      const startDate = new Date(bankDate)
      startDate.setDate(startDate.getDate() - this.DATE_TOLERANCE_DAYS)
      
      const endDate = new Date(bankDate)
      endDate.setDate(endDate.getDate() + this.DATE_TOLERANCE_DAYS)

      const tolerance = Math.max(bankAmount * this.AMOUNT_TOLERANCE_PERCENT / 100, 1)

      const deposits = await query(`
        SELECT * FROM qbo_objects 
        WHERE company_id = $1 
          AND obj_type = 'Deposit'
          AND txn_date BETWEEN $2 AND $3
          AND currency = $4
          AND ABS(amount - $5) <= $6
        ORDER BY ABS(amount - $5) ASC, txn_date ASC
        LIMIT 5
      `, [
        companyId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        bankCurrency,
        bankAmount,
        tolerance
      ])

      if (deposits.rows.length === 0) {
        return null
      }

      // Check for external reference match first (idempotency)
      if (payout) {
        const externalRef = `stripe_payout:${payout.payout_id}`
        const refMatch = deposits.rows.find((deposit: any) => 
          deposit.external_ref === externalRef
        )
        
        if (refMatch) {
          return this.mapQBOObject(refMatch)
        }
      }

      // Return best match by amount and date
      const bestMatch = deposits.rows[0]
      return this.mapQBOObject(bestMatch)

    } catch (error) {
      console.error('Error finding existing deposit:', error)
      return null
    }
  }

  // Propose creation of QBO deposit
  async proposeCreation(bank: any, payout?: any): Promise<ProposedAction> {
    try {
      const companyId = bank.company_id
      
      // Get company settings for account mappings
      const companySettings = await this.getCompanySettings(companyId)
      
      if (payout) {
        // Stripe payout scenario
        return this.proposeStripeDeposit(bank, payout, companySettings)
      } else {
        // Cash deposit scenario
        return this.proposeCashDeposit(bank, companySettings)
      }

    } catch (error) {
      console.error('Error proposing creation:', error)
      throw error
    }
  }

  // Propose Stripe payout deposit
  private async proposeStripeDeposit(
    bank: any, 
    payout: any, 
    settings: any
  ): Promise<ProposedAction> {
    const depositPayload = {
      TxnDate: bank.posted_date,
      PrivateNote: `Finacly • Stripe Payout ${payout.payout_id}`,
      DocNumber: `stripe_payout:${payout.payout_id}`,
      DepositToAccountRef: {
        value: settings.bankAccountId
      },
      Line: [
        {
          DetailType: 'DepositLineDetail',
          Amount: payout.amount_net / 100, // Convert from cents to dollars
          DepositLineDetail: {
            AccountRef: {
              value: settings.revenueAccountId
            }
          }
        }
      ]
    }

    // Add fee line if there are fees
    if (payout.amount_fee > 0) {
      depositPayload.Line.push({
        DetailType: 'DepositLineDetail',
        Amount: -(payout.amount_fee / 100), // Negative amount for fee
        DepositLineDetail: {
          AccountRef: {
            value: settings.feesAccountId
          }
        }
      })
    }

    return {
      type: 'create_deposit',
      payload: depositPayload,
      confidence: 0.95,
      evidence: {
        bank_amount: bank.amount,
        payout_amount: payout.amount_net,
        payout_fee: payout.amount_fee,
        currency: bank.currency,
        date: bank.posted_date,
        external_ref: `stripe_payout:${payout.payout_id}`
      }
    }
  }

  // Propose cash deposit
  private async proposeCashDeposit(bank: any, settings: any): Promise<ProposedAction> {
    const depositPayload = {
      TxnDate: bank.posted_date,
      PrivateNote: `Finacly • Cash Deposit - ${bank.description}`,
      DocNumber: `cash_deposit:${bank.id}`,
      DepositToAccountRef: {
        value: settings.bankAccountId
      },
      Line: [
        {
          DetailType: 'DepositLineDetail',
          Amount: bank.amount / 100, // Convert from cents to dollars
          DepositLineDetail: {
            AccountRef: {
              value: settings.cashSalesAccountId
            }
          }
        }
      ]
    }

    return {
      type: 'create_deposit',
      payload: depositPayload,
      confidence: 0.85,
      evidence: {
        bank_amount: bank.amount,
        currency: bank.currency,
        date: bank.posted_date,
        description: bank.description,
        external_ref: `cash_deposit:${bank.id}`
      }
    }
  }

  // Get company settings for account mappings
  private async getCompanySettings(companyId: string): Promise<any> {
    try {
      const result = await query(`
        SELECT settings_jsonb FROM companies WHERE id = $1
      `, [companyId])

      if (result.rows.length === 0) {
        // Return default settings
        return {
          bankAccountId: null,
          revenueAccountId: null,
          feesAccountId: null,
          cashSalesAccountId: null,
          undepositedFundsAccountId: null
        }
      }

      const settings = result.rows[0].settings_jsonb || {}
      return {
        bankAccountId: settings.bankAccountId,
        revenueAccountId: settings.revenueAccountId,
        feesAccountId: settings.feesAccountId,
        cashSalesAccountId: settings.cashSalesAccountId,
        undepositedFundsAccountId: settings.undepositedFundsAccountId
      }
    } catch (error) {
      console.error('Error getting company settings:', error)
      return {}
    }
  }

  // Map QBO object from database row
  private mapQBOObject(row: any): QBOObject {
    return {
      id: row.qbo_id,
      type: row.obj_type,
      amount: row.amount,
      currency: row.currency,
      txnDate: row.txn_date,
      memo: row.memo,
      externalRef: row.external_ref
    }
  }

  // Check if external reference exists (idempotency check)
  async checkExternalRef(companyId: string, externalRef: string): Promise<QBOObject | null> {
    try {
      const result = await query(`
        SELECT * FROM qbo_objects 
        WHERE company_id = $1 AND external_ref = $2
        LIMIT 1
      `, [companyId, externalRef])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapQBOObject(result.rows[0])
    } catch (error) {
      console.error('Error checking external ref:', error)
      return null
    }
  }

  // Get ledger match statistics
  async getLedgerStats(companyId: string): Promise<{
    totalQBOObjects: number
    totalDeposits: number
    totalPayments: number
    matchedObjects: number
    unmatchedObjects: number
    matchRate: number
  }> {
    try {
      const qboObjectsResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects WHERE company_id = $1
      `, [companyId])

      const depositsResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects 
        WHERE company_id = $1 AND obj_type = 'Deposit'
      `, [companyId])

      const paymentsResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects 
        WHERE company_id = $1 AND obj_type = 'Payment'
      `, [companyId])

      const matchesResult = await query(`
        SELECT COUNT(*) as count FROM matches 
        WHERE company_id = $1 AND (left_type = 'qbo' OR right_type = 'qbo')
      `, [companyId])

      const totalQBOObjects = parseInt(qboObjectsResult.rows[0].count)
      const totalDeposits = parseInt(depositsResult.rows[0].count)
      const totalPayments = parseInt(paymentsResult.rows[0].count)
      const matchedObjects = parseInt(matchesResult.rows[0].count)
      const unmatchedObjects = totalQBOObjects - matchedObjects
      const matchRate = totalQBOObjects > 0 ? (matchedObjects / totalQBOObjects) * 100 : 0

      return {
        totalQBOObjects,
        totalDeposits,
        totalPayments,
        matchedObjects,
        unmatchedObjects,
        matchRate
      }
    } catch (error) {
      console.error('Error getting ledger stats:', error)
      return {
        totalQBOObjects: 0,
        totalDeposits: 0,
        totalPayments: 0,
        matchedObjects: 0,
        unmatchedObjects: 0,
        matchRate: 0
      }
    }
  }

  // Find unmatched QBO objects
  async findUnmatchedObjects(companyId: string): Promise<QBOObject[]> {
    try {
      const result = await query(`
        SELECT qo.* FROM qbo_objects qo
        LEFT JOIN matches m ON (
          (m.left_type = 'qbo' AND m.left_ref = qo.qbo_id) OR
          (m.right_type = 'qbo' AND m.right_ref = qo.qbo_id)
        )
        WHERE qo.company_id = $1 AND m.id IS NULL
        ORDER BY qo.txn_date DESC
        LIMIT 100
      `, [companyId])

      return result.rows.map((row: any) => this.mapQBOObject(row))
    } catch (error) {
      console.error('Error finding unmatched objects:', error)
      return []
    }
  }
}
