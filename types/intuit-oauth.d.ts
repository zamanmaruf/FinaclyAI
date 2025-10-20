declare module 'intuit-oauth' {
  export default class OAuthClient {
    constructor(config: {
      clientId: string
      clientSecret: string
      environment: 'sandbox' | 'production'
      redirectUri: string
      token?: any
    })
    
    authorizeUri(options: { scope: string[]; state?: string }): string
    createToken(code: string): Promise<any>
    refresh(): Promise<any>
    isAccessTokenExpired(): boolean
    setToken(token: any): void
    makeApiCall(options: any): Promise<any>
    
    static scopes: {
      Accounting: string
    }
    
    static sandboxAPIHost: string
    static productionAPIHost: string
  }
}
