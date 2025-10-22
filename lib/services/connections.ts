import { query, getActiveConnection, markConnectionExpired } from '../db-utils'
import { decrypt } from '../encryption'

export interface Connection {
  id: string
  companyId: string
  provider: 'stripe' | 'qbo' | 'plaid' | 'flinks' | 'paypal' | 'square' | 'xero'
  status: 'connected' | 'expired' | 'revoked'
  authData: any
  lastSyncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class ConnectionManager {
  private static instance: ConnectionManager
  private eventListeners: Map<string, Function[]> = new Map()

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  // Get active connection for a company and provider
  async getActiveConnection(companyId: string, provider: string): Promise<Connection | null> {
    try {
      const connection = await getActiveConnection(companyId, provider)
      
      if (!connection) {
        return null
      }

      // Decrypt auth data
      const authData = JSON.parse(decrypt(connection.auth_encrypted))

      return {
        id: connection.id,
        companyId: connection.company_id,
        provider: connection.provider,
        status: connection.status,
        authData,
        lastSyncedAt: connection.last_synced_at,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at
      }
    } catch (error) {
      console.error(`Error getting active connection for ${provider}:`, error)
      return null
    }
  }

  // Validate connection by testing API access
  async validateConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = await query(`
        SELECT * FROM connections WHERE id = $1
      `, [connectionId])

      if (connection.rows.length === 0) {
        return false
      }

      const conn = connection.rows[0]
      const authData = JSON.parse(decrypt(conn.auth_encrypted))

      // Test connection based on provider
      switch (conn.provider) {
        case 'stripe':
          return await this.validateStripeConnection(authData)
        case 'qbo':
          return await this.validateQBOConnection(authData)
        case 'plaid':
          return await this.validatePlaidConnection(authData)
        default:
          return true // Assume valid for other providers
      }
    } catch (error) {
      console.error('Error validating connection:', error)
      return false
    }
  }

  // Refresh tokens for OAuth connections
  async refreshTokens(connectionId: string): Promise<boolean> {
    try {
      const connection = await query(`
        SELECT * FROM connections WHERE id = $1
      `, [connectionId])

      if (connection.rows.length === 0) {
        return false
      }

      const conn = connection.rows[0]
      const authData = JSON.parse(decrypt(conn.auth_encrypted))

      let refreshed = false
      let newAuthData = authData

      switch (conn.provider) {
        case 'qbo':
          refreshed = await this.refreshQBOTokens(authData)
          if (refreshed) {
            newAuthData = { ...authData, ...(refreshed as any) }
          }
          break
        case 'stripe':
          // Stripe doesn't need token refresh for API keys
          refreshed = true
          break
        default:
          refreshed = true
      }

      if (refreshed) {
        // Update connection with new auth data
        await query(`
          UPDATE connections 
          SET auth_encrypted = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [JSON.stringify(newAuthData), connectionId])

        this.emit('connection_refreshed', { connectionId, provider: conn.provider })
        return true
      }

      return false
    } catch (error) {
      console.error('Error refreshing tokens:', error)
      return false
    }
  }

  // Disconnect a provider
  async disconnectProvider(connectionId: string): Promise<boolean> {
    try {
      await query(`
        UPDATE connections 
        SET status = 'revoked', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [connectionId])

      this.emit('connection_disconnected', { connectionId })
      return true
    } catch (error) {
      console.error('Error disconnecting provider:', error)
      return false
    }
  }

  // Auto-detect and mark expired connections
  async detectExpiredConnections(): Promise<void> {
    try {
      const connections = await query(`
        SELECT id, provider, auth_encrypted, updated_at
        FROM connections 
        WHERE status = 'connected'
      `)

      for (const conn of connections.rows) {
        const isValid = await this.validateConnection(conn.id)
        
        if (!isValid) {
          await markConnectionExpired(conn.id)
          this.emit('connection_expired', { 
            connectionId: conn.id, 
            provider: conn.provider 
          })
        }
      }
    } catch (error) {
      console.error('Error detecting expired connections:', error)
    }
  }

  // Event system for observability
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  // Provider-specific validation methods
  private async validateStripeConnection(authData: any): Promise<boolean> {
    try {
      const Stripe = require('stripe')
      const stripe = new Stripe(authData.api_key || authData.secret_key)
      
      // Test with a simple API call
      await stripe.balance.retrieve()
      return true
    } catch (error) {
      console.error('Stripe connection validation failed:', error)
      return false
    }
  }

  private async validateQBOConnection(authData: any): Promise<boolean> {
    try {
      // Check if token is expired (QBO tokens expire in 1 hour)
      const tokenExpiry = new Date(authData.expires_at)
      const now = new Date()
      
      if (tokenExpiry <= now) {
        return false
      }

      // Could add actual API test here if needed
      return true
    } catch (error) {
      console.error('QBO connection validation failed:', error)
      return false
    }
  }

  private async validatePlaidConnection(authData: any): Promise<boolean> {
    try {
      const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
      
      const configuration = new Configuration({
        basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
          },
        },
      })

      const client = new PlaidApi(configuration)
      
      // Test with accounts endpoint
      await client.accountsGet({
        access_token: authData.access_token
      })
      
      return true
    } catch (error) {
      console.error('Plaid connection validation failed:', error)
      return false
    }
  }

  private async refreshQBOTokens(authData: any): Promise<any> {
    try {
      const OAuthClient = require('intuit-oauth')
      const oauthClient = new OAuthClient({
        clientId: process.env.INTUIT_CLIENT_ID,
        clientSecret: process.env.INTUIT_CLIENT_SECRET,
        environment: process.env.INTUIT_ENVIRONMENT || 'sandbox',
        redirectUri: process.env.INTUIT_REDIRECT_URI
      })

      // Set the existing tokens
      oauthClient.setToken(authData)

      // Refresh the token
      const authResponse = await oauthClient.refresh()
      
      if (authResponse.getJson()) {
        return {
          access_token: authResponse.getJson().access_token,
          refresh_token: authResponse.getJson().refresh_token,
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      }

      return null
    } catch (error) {
      console.error('QBO token refresh failed:', error)
      return null
    }
  }

  // Get all connections for a company
  async getCompanyConnections(companyId: string): Promise<Connection[]> {
    try {
      const result = await query(`
        SELECT * FROM connections 
        WHERE company_id = $1 
        ORDER BY updated_at DESC
      `, [companyId])

      return result.rows.map((conn: any) => ({
        id: conn.id,
        companyId: conn.company_id,
        provider: conn.provider,
        status: conn.status,
        authData: JSON.parse(decrypt(conn.auth_encrypted)),
        lastSyncedAt: conn.last_synced_at,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at
      }))
    } catch (error) {
      console.error('Error getting company connections:', error)
      return []
    }
  }

  // Update last synced timestamp
  async updateLastSynced(connectionId: string): Promise<void> {
    await query(`
      UPDATE connections 
      SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [connectionId])
  }
}
