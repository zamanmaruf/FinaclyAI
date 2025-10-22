import { query } from '../db-utils'
import { ConnectionManager } from './connections'

export interface CompanySettings {
  id: string
  companyId: string
  bankAccountId?: string
  revenueAccountId?: string
  feesAccountId?: string
  undepositedFundsAccountId?: string
  cashSalesAccountId?: string
  bankChargesAccountId?: string
  homeCurrency: string
  dateFormat: string
  timezone: string
  autoMatchThreshold: number
  dateToleranceDays: number
  amountTolerancePercent: number
  notifications: {
    email: boolean
    slack: boolean
    webhook?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface QBOAccount {
  id: string
  name: string
  type: string
  subtype?: string
  fullyQualifiedName: string
}

export class SettingsService {
  private connectionManager: ConnectionManager

  constructor() {
    this.connectionManager = ConnectionManager.getInstance()
  }

  // Get company settings
  async getSettings(companyId: string): Promise<CompanySettings | null> {
    try {
      const result = await query(`
        SELECT * FROM companies 
        WHERE id = $1
      `, [companyId])

      if (result.rows.length === 0) {
        return null
      }

      const company = result.rows[0]
      const settings = company.settings_jsonb || {}

      return {
        id: company.id,
        companyId: company.id,
        bankAccountId: settings.bankAccountId,
        revenueAccountId: settings.revenueAccountId,
        feesAccountId: settings.feesAccountId,
        undepositedFundsAccountId: settings.undepositedFundsAccountId,
        cashSalesAccountId: settings.cashSalesAccountId,
        bankChargesAccountId: settings.bankChargesAccountId,
        homeCurrency: settings.homeCurrency || 'CAD',
        dateFormat: settings.dateFormat || 'YYYY-MM-DD',
        timezone: settings.timezone || 'America/Toronto',
        autoMatchThreshold: settings.autoMatchThreshold || 0.95,
        dateToleranceDays: settings.dateToleranceDays || 2,
        amountTolerancePercent: settings.amountTolerancePercent || 0.5,
        notifications: settings.notifications || {
          email: true,
          slack: false
        },
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }
    } catch (error) {
      console.error('Error getting company settings:', error)
      return null
    }
  }

  // Update company settings
  async updateSettings(companyId: string, settings: Partial<CompanySettings>): Promise<CompanySettings> {
    try {
      const currentSettings = await this.getSettings(companyId)
      if (!currentSettings) {
        throw new Error('Company not found')
      }

      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date()
      }

      await query(`
        UPDATE companies 
        SET settings_jsonb = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(updatedSettings), companyId])

      return updatedSettings
    } catch (error) {
      console.error('Error updating company settings:', error)
      throw error
    }
  }

  // Get available QBO accounts
  async getQBOAccounts(companyId: string): Promise<QBOAccount[]> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      // Create QBO client
      const OAuthClient = require('intuit-oauth')
      const oauthClient = new OAuthClient({
        clientId: process.env.INTUIT_CLIENT_ID,
        clientSecret: process.env.INTUIT_CLIENT_SECRET,
        environment: process.env.INTUIT_ENVIRONMENT || 'sandbox',
        redirectUri: process.env.INTUIT_REDIRECT_URI
      })

      oauthClient.setToken(connection.authData)

      // Query accounts from QBO
      const response = await oauthClient.makeApiCall({
        url: `/v3/company/${connection.authData.realmId}/accounts`,
        method: 'GET'
      })

      if (!response || !response.QueryResponse || !response.QueryResponse.Account) {
        return []
      }

      return response.QueryResponse.Account.map((account: any) => ({
        id: account.Id,
        name: account.Name,
        type: account.AccountType,
        subtype: account.AccountSubType,
        fullyQualifiedName: account.FullyQualifiedName
      }))
    } catch (error) {
      console.error('Error getting QBO accounts:', error)
      return []
    }
  }

  // Validate account mappings
  async validateAccountMappings(companyId: string, mappings: {
    bankAccountId?: string
    revenueAccountId?: string
    feesAccountId?: string
    undepositedFundsAccountId?: string
    cashSalesAccountId?: string
    bankChargesAccountId?: string
  }): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const accounts = await this.getQBOAccounts(companyId)
      const accountIds = accounts.map(acc => acc.id)
      const errors: string[] = []

      // Validate each mapping
      if (mappings.bankAccountId && !accountIds.includes(mappings.bankAccountId)) {
        errors.push('Bank account ID not found in QuickBooks')
      }

      if (mappings.revenueAccountId && !accountIds.includes(mappings.revenueAccountId)) {
        errors.push('Revenue account ID not found in QuickBooks')
      }

      if (mappings.feesAccountId && !accountIds.includes(mappings.feesAccountId)) {
        errors.push('Fees account ID not found in QuickBooks')
      }

      if (mappings.undepositedFundsAccountId && !accountIds.includes(mappings.undepositedFundsAccountId)) {
        errors.push('Undeposited funds account ID not found in QuickBooks')
      }

      if (mappings.cashSalesAccountId && !accountIds.includes(mappings.cashSalesAccountId)) {
        errors.push('Cash sales account ID not found in QuickBooks')
      }

      if (mappings.bankChargesAccountId && !accountIds.includes(mappings.bankChargesAccountId)) {
        errors.push('Bank charges account ID not found in QuickBooks')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Error validating account mappings:', error)
      return {
        isValid: false,
        errors: ['Failed to validate account mappings']
      }
    }
  }

  // Get default settings for new company
  getDefaultSettings(): Partial<CompanySettings> {
    return {
      homeCurrency: 'CAD',
      dateFormat: 'YYYY-MM-DD',
      timezone: 'America/Toronto',
      autoMatchThreshold: 0.95,
      dateToleranceDays: 2,
      amountTolerancePercent: 0.5,
      notifications: {
        email: true,
        slack: false
      }
    }
  }

  // Sync account mappings from QBO
  async syncAccountMappings(companyId: string): Promise<{
    success: boolean
    accountsFound: number
    recommendedMappings: {
      bankAccountId?: string
      revenueAccountId?: string
      feesAccountId?: string
      undepositedFundsAccountId?: string
      cashSalesAccountId?: string
      bankChargesAccountId?: string
    }
  }> {
    try {
      const accounts = await this.getQBOAccounts(companyId)
      const recommendedMappings: any = {}

      // Find recommended accounts based on name patterns
      for (const account of accounts) {
        const name = account.name.toLowerCase()
        const type = account.type.toLowerCase()

        // Bank accounts
        if (type === 'bank' && !recommendedMappings.bankAccountId) {
          if (name.includes('checking') || name.includes('business') || name.includes('operating')) {
            recommendedMappings.bankAccountId = account.id
          }
        }

        // Revenue accounts
        if (type === 'income' && !recommendedMappings.revenueAccountId) {
          if (name.includes('sales') || name.includes('revenue') || name.includes('income')) {
            recommendedMappings.revenueAccountId = account.id
          }
        }

        // Fees accounts
        if (type === 'expense' && !recommendedMappings.feesAccountId) {
          if (name.includes('fee') || name.includes('charge') || name.includes('processing')) {
            recommendedMappings.feesAccountId = account.id
          }
        }

        // Undeposited funds
        if (type === 'other current asset' && !recommendedMappings.undepositedFundsAccountId) {
          if (name.includes('undeposited') || name.includes('funds')) {
            recommendedMappings.undepositedFundsAccountId = account.id
          }
        }

        // Cash sales
        if (type === 'income' && !recommendedMappings.cashSalesAccountId) {
          if (name.includes('cash') || name.includes('pos')) {
            recommendedMappings.cashSalesAccountId = account.id
          }
        }

        // Bank charges
        if (type === 'expense' && !recommendedMappings.bankChargesAccountId) {
          if (name.includes('bank') && (name.includes('charge') || name.includes('fee'))) {
            recommendedMappings.bankChargesAccountId = account.id
          }
        }
      }

      return {
        success: true,
        accountsFound: accounts.length,
        recommendedMappings
      }
    } catch (error) {
      console.error('Error syncing account mappings:', error)
      return {
        success: false,
        accountsFound: 0,
        recommendedMappings: {}
      }
    }
  }

  // Get settings statistics
  async getSettingsStats(companyId: string): Promise<{
    hasBankAccount: boolean
    hasRevenueAccount: boolean
    hasFeesAccount: boolean
    hasUndepositedFunds: boolean
    hasCashSales: boolean
    hasBankCharges: boolean
    totalAccounts: number
    lastSyncDate?: string
  }> {
    try {
      const settings = await this.getSettings(companyId)
      const accounts = await this.getQBOAccounts(companyId)

      return {
        hasBankAccount: !!settings?.bankAccountId,
        hasRevenueAccount: !!settings?.revenueAccountId,
        hasFeesAccount: !!settings?.feesAccountId,
        hasUndepositedFunds: !!settings?.undepositedFundsAccountId,
        hasCashSales: !!settings?.cashSalesAccountId,
        hasBankCharges: !!settings?.bankChargesAccountId,
        totalAccounts: accounts.length,
        lastSyncDate: settings?.updatedAt?.toISOString()
      }
    } catch (error) {
      console.error('Error getting settings stats:', error)
      return {
        hasBankAccount: false,
        hasRevenueAccount: false,
        hasFeesAccount: false,
        hasUndepositedFunds: false,
        hasCashSales: false,
        hasBankCharges: false,
        totalAccounts: 0
      }
    }
  }
}
