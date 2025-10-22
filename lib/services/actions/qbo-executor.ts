import { query } from '../../db-utils'
import { ConnectionManager } from '../connections'
import { AuditService } from '../audit'
import { QBOTemplates } from './qbo-templates'

export interface QBOObject {
  id: string
  type: string
  amount: number
  currency: string
  txnDate: string
  memo?: string
  externalRef?: string
  qboId: string
}

export class QBOActionsExecutor {
  private connectionManager: ConnectionManager
  private auditService: AuditService
  private templates: QBOTemplates

  constructor() {
    this.connectionManager = ConnectionManager.getInstance()
    this.auditService = new AuditService()
    this.templates = new QBOTemplates()
  }

  // Create QBO deposit
  async createDeposit(
    payload: any,
    companyId: string,
    userId: string
  ): Promise<QBOObject> {
    try {
      console.log(`🔄 Creating QBO deposit for company ${companyId}`)

      // Validate payload
      const validation = this.templates.validatePayload(payload)
      if (!validation.isValid) {
        throw new Error(`Invalid payload: ${validation.errors.join(', ')}`)
      }

      // Check for existing object with same external ref (idempotency)
      if (payload.DocNumber) {
        const existing = await this.checkExternalRef(companyId, payload.DocNumber)
        if (existing) {
          console.log(`✅ Deposit already exists with external ref ${payload.DocNumber}`)
          return existing
        }
      }

      // Get QBO connection
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      // Create QBO client
      const qboClient = this.createQBOClient(connection.authData)

      // Create deposit in QBO using proper API call
      const qboResponse = await qboClient.makeApiCall({
        url: `/v3/company/${connection.authData.realmId}/deposit`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })

      if (!qboResponse || !qboResponse.Deposit) {
        throw new Error('Failed to create deposit in QuickBooks')
      }

      const qboDeposit = qboResponse.Deposit

      // Store in database
      const qboObject = await this.storeQBOObject(companyId, 'Deposit', qboDeposit, payload)

      // Create audit event
      await this.auditService.logEvent(
        companyId,
        userId,
        'qbo_deposit_created',
        'qbo_object',
        qboObject.id,
        {
          qbo_id: qboDeposit.Id,
          amount: qboDeposit.TotalAmt,
          currency: qboDeposit.CurrencyRef?.value || 'CAD',
          external_ref: payload.DocNumber,
          txn_date: qboDeposit.TxnDate
        }
      )

      console.log(`✅ Deposit created successfully: ${qboDeposit.Id}`)
      return qboObject

    } catch (error) {
      console.error('Error creating QBO deposit:', error)
      throw error
    }
  }

  // Create QBO payment
  async createPayment(
    payload: any,
    companyId: string,
    userId: string
  ): Promise<QBOObject> {
    try {
      console.log(`🔄 Creating QBO payment for company ${companyId}`)

      // Validate payload
      const validation = this.templates.validatePayload(payload)
      if (!validation.isValid) {
        throw new Error(`Invalid payload: ${validation.errors.join(', ')}`)
      }

      // Check for existing object with same external ref (idempotency)
      if (payload.DocNumber) {
        const existing = await this.checkExternalRef(companyId, payload.DocNumber)
        if (existing) {
          console.log(`✅ Payment already exists with external ref ${payload.DocNumber}`)
          return existing
        }
      }

      // Get QBO connection
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      // Create QBO client
      const qboClient = this.createQBOClient(connection.authData)

      // Create payment in QBO using proper API call
      const qboResponse = await qboClient.makeApiCall({
        url: `/v3/company/${connection.authData.realmId}/payment`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })

      if (!qboResponse || !qboResponse.Payment) {
        throw new Error('Failed to create payment in QuickBooks')
      }

      const qboPayment = qboResponse.Payment

      // Store in database
      const qboObject = await this.storeQBOObject(companyId, 'Payment', qboPayment, payload)

      // Create audit event
      await this.auditService.logEvent(
        companyId,
        userId,
        'qbo_payment_created',
        'qbo_object',
        qboObject.id,
        {
          qbo_id: qboPayment.Id,
          amount: qboPayment.TotalAmt,
          currency: qboPayment.CurrencyRef?.value || 'CAD',
          external_ref: payload.DocNumber,
          txn_date: qboPayment.TxnDate
        }
      )

      console.log(`✅ Payment created successfully: ${qboPayment.Id}`)
      return qboObject

    } catch (error) {
      console.error('Error creating QBO payment:', error)
      throw error
    }
  }

  // Create QBO transfer
  async createTransfer(
    payload: any,
    companyId: string,
    userId: string
  ): Promise<QBOObject> {
    try {
      console.log(`🔄 Creating QBO transfer for company ${companyId}`)

      // Validate payload
      const validation = this.templates.validatePayload(payload)
      if (!validation.isValid) {
        throw new Error(`Invalid payload: ${validation.errors.join(', ')}`)
      }

      // Check for existing object with same external ref (idempotency)
      if (payload.DocNumber) {
        const existing = await this.checkExternalRef(companyId, payload.DocNumber)
        if (existing) {
          console.log(`✅ Transfer already exists with external ref ${payload.DocNumber}`)
          return existing
        }
      }

      // Get QBO connection
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      // Create QBO client
      const qboClient = this.createQBOClient(connection.authData)

      // Create transfer in QBO using proper API call
      const qboResponse = await qboClient.makeApiCall({
        url: `/v3/company/${connection.authData.realmId}/transfer`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })

      if (!qboResponse || !qboResponse.Transfer) {
        throw new Error('Failed to create transfer in QuickBooks')
      }

      const qboTransfer = qboResponse.Transfer

      // Store in database
      const qboObject = await this.storeQBOObject(companyId, 'Transfer', qboTransfer, payload)

      // Create audit event
      await this.auditService.logEvent(
        companyId,
        userId,
        'qbo_transfer_created',
        'qbo_object',
        qboObject.id,
        {
          qbo_id: qboTransfer.Id,
          amount: qboTransfer.Amount,
          currency: qboTransfer.CurrencyRef?.value || 'CAD',
          external_ref: payload.DocNumber,
          txn_date: qboTransfer.TxnDate
        }
      )

      console.log(`✅ Transfer created successfully: ${qboTransfer.Id}`)
      return qboObject

    } catch (error) {
      console.error('Error creating QBO transfer:', error)
      throw error
    }
  }

  // Create QBO expense
  async createExpense(
    payload: any,
    companyId: string,
    userId: string
  ): Promise<QBOObject> {
    try {
      console.log(`🔄 Creating QBO expense for company ${companyId}`)

      // Validate payload
      const validation = this.templates.validatePayload(payload)
      if (!validation.isValid) {
        throw new Error(`Invalid payload: ${validation.errors.join(', ')}`)
      }

      // Check for existing object with same external ref (idempotency)
      if (payload.DocNumber) {
        const existing = await this.checkExternalRef(companyId, payload.DocNumber)
        if (existing) {
          console.log(`✅ Expense already exists with external ref ${payload.DocNumber}`)
          return existing
        }
      }

      // Get QBO connection
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      // Create QBO client
      const qboClient = this.createQBOClient(connection.authData)

      // Create expense in QBO using proper API call
      const qboResponse = await qboClient.makeApiCall({
        url: `/v3/company/${connection.authData.realmId}/expense`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })

      if (!qboResponse || !qboResponse.Expense) {
        throw new Error('Failed to create expense in QuickBooks')
      }

      const qboExpense = qboResponse.Expense

      // Store in database
      const qboObject = await this.storeQBOObject(companyId, 'Expense', qboExpense, payload)

      // Create audit event
      await this.auditService.logEvent(
        companyId,
        userId,
        'qbo_expense_created',
        'qbo_object',
        qboObject.id,
        {
          qbo_id: qboExpense.Id,
          amount: qboExpense.TotalAmt,
          currency: qboExpense.CurrencyRef?.value || 'CAD',
          external_ref: payload.DocNumber,
          txn_date: qboExpense.TxnDate
        }
      )

      console.log(`✅ Expense created successfully: ${qboExpense.Id}`)
      return qboObject

    } catch (error) {
      console.error('Error creating QBO expense:', error)
      throw error
    }
  }

  // Check if external reference exists (idempotency)
  private async checkExternalRef(companyId: string, externalRef: string): Promise<QBOObject | null> {
    try {
      const result = await query(`
        SELECT * FROM qbo_objects 
        WHERE company_id = $1 AND external_ref = $2
        LIMIT 1
      `, [companyId, externalRef])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        id: row.id,
        type: row.obj_type,
        amount: row.amount,
        currency: row.currency,
        txnDate: row.txn_date,
        memo: row.memo,
        externalRef: row.external_ref,
        qboId: row.qbo_id
      }
    } catch (error) {
      console.error('Error checking external ref:', error)
      return null
    }
  }

  // Store QBO object in database
  private async storeQBOObject(
    companyId: string,
    objType: string,
    qboObject: any,
    originalPayload: any
  ): Promise<QBOObject> {
    try {
      const amount = Math.round((qboObject.TotalAmt || qboObject.Amount || 0) * 100) // Convert to cents
      const currency = qboObject.CurrencyRef?.value || 'CAD'
      const txnDate = qboObject.TxnDate
      const memo = qboObject.PrivateNote || ''
      const externalRef = originalPayload.DocNumber

      const result = await query(`
        INSERT INTO qbo_objects (
          company_id, obj_type, qbo_id, txn_date, amount, currency,
          memo, external_ref, raw_jsonb, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING id
      `, [
        companyId,
        objType,
        qboObject.Id,
        txnDate,
        amount,
        currency,
        memo,
        externalRef,
        JSON.stringify(qboObject)
      ])

      return {
        id: result.rows[0].id,
        type: objType,
        amount,
        currency,
        txnDate,
        memo,
        externalRef,
        qboId: qboObject.Id
      }
    } catch (error) {
      console.error('Error storing QBO object:', error)
      throw error
    }
  }

  // Create QBO client with automatic token refresh
  private createQBOClient(authData: any): any {
    const OAuthClient = require('intuit-oauth')
    const oauthClient = new OAuthClient({
      clientId: process.env.INTUIT_CLIENT_ID,
      clientSecret: process.env.INTUIT_CLIENT_SECRET,
      environment: process.env.INTUIT_ENVIRONMENT || 'sandbox',
      redirectUri: process.env.INTUIT_REDIRECT_URI
    })

    // Set the tokens
    oauthClient.setToken({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
      token_type: 'Bearer'
    })

    // Add automatic token refresh wrapper
    const originalMakeApiCall = oauthClient.makeApiCall.bind(oauthClient)
    oauthClient.makeApiCall = async (options: any) => {
      try {
        return await originalMakeApiCall(options)
      } catch (error: any) {
        // Check if it's a 401 Unauthorized error
        if (error.status === 401 || error.statusCode === 401) {
          console.log('🔄 Token expired, refreshing...')
          try {
            const refreshResponse = await oauthClient.refresh()
            if (refreshResponse && refreshResponse.access_token) {
              // Update the stored token in database
              await this.updateStoredToken(authData.connectionId, refreshResponse)
              // Retry the original request
              return await originalMakeApiCall(options)
            }
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError)
            throw new Error('Token refresh failed. Please reconnect QuickBooks.')
          }
        }
        throw error
      }
    }

    return oauthClient
  }

  // Update stored token after refresh
  private async updateStoredToken(connectionId: string, newToken: any): Promise<void> {
    try {
      await query(`
        UPDATE connections 
        SET auth_encrypted = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(newToken), connectionId])
    } catch (error) {
      console.error('Failed to update stored token:', error)
    }
  }

  // Get execution statistics
  async getExecutionStats(companyId: string): Promise<{
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    executionsByType: { [key: string]: number }
    averageExecutionTime: number
  }> {
    try {
      const totalResult = await query(`
        SELECT COUNT(*) as count FROM audit_events 
        WHERE company_id = $1 AND verb LIKE 'qbo_%_created'
      `, [companyId])

      const successResult = await query(`
        SELECT COUNT(*) as count FROM audit_events 
        WHERE company_id = $1 AND verb LIKE 'qbo_%_created'
      `, [companyId])

      const typeResult = await query(`
        SELECT verb, COUNT(*) as count 
        FROM audit_events 
        WHERE company_id = $1 AND verb LIKE 'qbo_%_created'
        GROUP BY verb
      `, [companyId])

      const totalExecutions = parseInt(totalResult.rows[0].count)
      const successfulExecutions = parseInt(successResult.rows[0].count)
      const failedExecutions = 0 // Would need to track failures separately

      const executionsByType: { [key: string]: number } = {}
      typeResult.rows.forEach((row: any) => {
        const type = row.verb.replace('qbo_', '').replace('_created', '')
        executionsByType[type] = parseInt(row.count)
      })

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        executionsByType,
        averageExecutionTime: 0 // Would need to track execution times
      }
    } catch (error) {
      console.error('Error getting execution stats:', error)
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        executionsByType: {},
        averageExecutionTime: 0
      }
    }
  }
}
