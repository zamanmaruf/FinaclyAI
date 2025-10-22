export interface NormalizedRecord {
  amount: number // in minor units (cents)
  currency: string
  date: string
  keywords: string[]
  hashKeys: string[]
  fx?: {
    homeCurrency: string
    originalCurrency: string
    exchangeRate: number
    originalAmount: number
  }
}

export class NormalizationService {
  private readonly KEYWORD_PATTERNS = [
    // Payment processors
    { pattern: /stripe|strp/i, keyword: 'STRIPE' },
    { pattern: /paypal|pp/i, keyword: 'PAYPAL' },
    { pattern: /square/i, keyword: 'SQUARE' },
    
    // Banking
    { pattern: /interac|etransfer|e-transfer/i, keyword: 'INTERAC' },
    { pattern: /atm|cash/i, keyword: 'ATM' },
    { pattern: /deposit|dep/i, keyword: 'DEPOSIT' },
    { pattern: /withdrawal|wdl/i, keyword: 'WITHDRAWAL' },
    
    // Transaction types
    { pattern: /payment|pmt/i, keyword: 'PAYMENT' },
    { pattern: /transfer|xfer/i, keyword: 'TRANSFER' },
    { pattern: /fee|charge/i, keyword: 'FEE' },
    { pattern: /refund|rfd/i, keyword: 'REFUND' },
    
    // Business indicators
    { pattern: /pos|point of sale/i, keyword: 'POS' },
    { pattern: /online|web/i, keyword: 'ONLINE' },
    { pattern: /mobile|app/i, keyword: 'MOBILE' }
  ]

  // Normalize amounts to minor units (cents)
  normalizeAmounts(record: any): number {
    if (typeof record.amount === 'number') {
      // Assume amount is already in dollars, convert to cents
      return Math.round(record.amount * 100)
    }
    
    if (typeof record.amount === 'string') {
      // Parse string amount and convert to cents
      const amount = parseFloat(record.amount.replace(/[^0-9.-]/g, ''))
      return Math.round(amount * 100)
    }
    
    return 0
  }

  // Extract keywords from description
  extractKeywords(description: string): string[] {
    if (!description) return []
    
    const keywords: string[] = []
    const desc = description.toLowerCase()
    
    for (const { pattern, keyword } of this.KEYWORD_PATTERNS) {
      if (pattern.test(desc)) {
        keywords.push(keyword)
      }
    }
    
    // Add common business keywords
    if (desc.includes('business') || desc.includes('corp')) {
      keywords.push('BUSINESS')
    }
    
    if (desc.includes('recurring') || desc.includes('subscription')) {
      keywords.push('RECURRING')
    }
    
    return Array.from(new Set(keywords)) // Remove duplicates
  }

  // Enrich with FX data when needed
  async enrichFX(record: any, homeCurrency: string = 'CAD'): Promise<NormalizedRecord['fx'] | undefined> {
    const recordCurrency = record.currency || record.iso_currency_code || record.currency_code
    
    if (!recordCurrency || recordCurrency === homeCurrency) {
      return undefined
    }
    
    try {
      const exchangeRate = await this.getExchangeRate(recordCurrency, homeCurrency)
      
      return {
        homeCurrency,
        originalCurrency: recordCurrency,
        exchangeRate,
        originalAmount: record.amount
      }
    } catch (error) {
      console.warn(`Failed to get exchange rate for ${recordCurrency} to ${homeCurrency}:`, error)
      return undefined
    }
  }

  // Compute hash keys for matching
  computeHashKeys(record: any): string[] {
    const amount = this.normalizeAmounts(record)
    const date = this.normalizeDate(record)
    const currency = record.currency || record.iso_currency_code || 'CAD'
    
    // Create date buckets (±2 days for matching tolerance)
    const dateBuckets = this.createDateBuckets(date)
    
    return dateBuckets.map(dateBucket => 
      `${amount}_${currency}_${dateBucket}`
    )
  }

  // Normalize date to YYYY-MM-DD format
  private normalizeDate(record: any): string {
    const dateFields = ['date', 'posted_date', 'txn_date', 'created_at', 'arrival_date']
    
    for (const field of dateFields) {
      if (record[field]) {
        const date = new Date(record[field])
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
      }
    }
    
    return new Date().toISOString().split('T')[0]
  }

  // Create date buckets for matching tolerance
  private createDateBuckets(date: string): string[] {
    const baseDate = new Date(date)
    const buckets: string[] = []
    
    // Add ±2 days
    for (let i = -2; i <= 2; i++) {
      const bucketDate = new Date(baseDate)
      bucketDate.setDate(bucketDate.getDate() + i)
      buckets.push(bucketDate.toISOString().split('T')[0])
    }
    
    return buckets
  }

  // Get exchange rate from API with caching
  private async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}_${to}`
    const cached = await this.getCachedRate(cacheKey)
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.rate
    }
    
    try {
      const rate = await this.fetchExchangeRate(from, to)
      await this.cacheRate(cacheKey, rate)
      return rate
    } catch (error) {
      console.error(`Failed to fetch exchange rate for ${from} to ${to}:`, error)
      // Return fallback rate
      return this.getFallbackRate(from, to)
    }
  }

  // Fetch exchange rate from exchangerate.host API
  private async fetchExchangeRate(from: string, to: string): Promise<number> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    const baseUrl = apiKey 
      ? `https://api.exchangerate.host/convert?access_key=${apiKey}`
      : 'https://api.exchangerate.host/convert'
    
    const url = `${baseUrl}&from=${from}&to=${to}&amount=1`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Finacly/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success && !data.result) {
      throw new Error(`Exchange rate API returned error: ${data.error?.info || 'Unknown error'}`)
    }
    
    return data.result || data.rates?.[to] || 1.0
  }

  // Get cached exchange rate
  private async getCachedRate(cacheKey: string): Promise<{ rate: number; timestamp: Date } | null> {
    try {
      const { query } = await import('../db-utils')
      const result = await query(`
        SELECT rate, cached_at 
        FROM exchange_rates 
        WHERE currency_pair = $1 
        ORDER BY cached_at DESC 
        LIMIT 1
      `, [cacheKey])
      
      if (result.rows.length > 0) {
        return {
          rate: parseFloat(result.rows[0].rate),
          timestamp: new Date(result.rows[0].cached_at)
        }
      }
    } catch (error) {
      console.warn('Failed to get cached exchange rate:', error)
    }
    
    return null
  }

  // Cache exchange rate
  private async cacheRate(cacheKey: string, rate: number): Promise<void> {
    try {
      const { query } = await import('../db-utils')
      await query(`
        INSERT INTO exchange_rates (currency_pair, rate, cached_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (currency_pair) 
        DO UPDATE SET rate = EXCLUDED.rate, cached_at = EXCLUDED.cached_at
      `, [cacheKey, rate])
    } catch (error) {
      console.warn('Failed to cache exchange rate:', error)
    }
  }

  // Check if cache is still valid (24 hours)
  private isCacheValid(timestamp: Date): boolean {
    const now = new Date()
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
    return diffHours < 24
  }

  // Fallback rates when API is unavailable
  private getFallbackRate(from: string, to: string): number {
    const fallbackRates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'CAD': 1.35, 'EUR': 0.85, 'GBP': 0.75 },
      'EUR': { 'CAD': 1.50, 'USD': 1.18, 'GBP': 0.88 },
      'GBP': { 'CAD': 1.70, 'USD': 1.33, 'EUR': 1.14 },
      'CAD': { 'USD': 0.74, 'EUR': 0.67, 'GBP': 0.59 }
    }
    
    return fallbackRates[from]?.[to] || 1.0
  }

  // Normalize a complete record
  async normalizeRecord(record: any, homeCurrency: string = 'CAD'): Promise<NormalizedRecord> {
    const amount = this.normalizeAmounts(record)
    const currency = record.currency || record.iso_currency_code || homeCurrency
    const date = this.normalizeDate(record)
    const description = record.description || record.name || record.memo || ''
    const keywords = this.extractKeywords(description)
    const hashKeys = this.computeHashKeys(record)
    const fx = await this.enrichFX(record, homeCurrency)
    
    return {
      amount,
      currency,
      date,
      keywords,
      hashKeys,
      fx
    }
  }

  // Batch normalize multiple records
  async normalizeBatch(records: any[], homeCurrency: string = 'CAD'): Promise<NormalizedRecord[]> {
    return Promise.all(records.map(record => this.normalizeRecord(record, homeCurrency)))
  }

  // Get normalization statistics
  getNormalizationStats(normalizedRecords: NormalizedRecord[]): {
    totalRecords: number
    currencyBreakdown: { [key: string]: number }
    keywordFrequency: { [key: string]: number }
    fxRecords: number
    averageAmount: number
  } {
    const currencyBreakdown: { [key: string]: number } = {}
    const keywordFrequency: { [key: string]: number } = {}
    let fxRecords = 0
    let totalAmount = 0
    
    for (const record of normalizedRecords) {
      // Currency breakdown
      currencyBreakdown[record.currency] = (currencyBreakdown[record.currency] || 0) + 1
      
      // Keyword frequency
      for (const keyword of record.keywords) {
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1
      }
      
      // FX records
      if (record.fx) {
        fxRecords++
      }
      
      // Total amount
      totalAmount += record.amount
    }
    
    return {
      totalRecords: normalizedRecords.length,
      currencyBreakdown,
      keywordFrequency,
      fxRecords,
      averageAmount: normalizedRecords.length > 0 ? totalAmount / normalizedRecords.length : 0
    }
  }

  // Find potential matches using hash keys
  findPotentialMatches(
    record: NormalizedRecord, 
    candidateRecords: NormalizedRecord[]
  ): NormalizedRecord[] {
    const matches: NormalizedRecord[] = []
    
    for (const candidate of candidateRecords) {
      // Check if any hash keys match
      const hasMatchingHashKey = record.hashKeys.some(hashKey => 
        candidate.hashKeys.includes(hashKey)
      )
      
      if (hasMatchingHashKey) {
        matches.push(candidate)
      }
    }
    
    return matches
  }

  // Calculate match confidence between two records
  calculateMatchConfidence(
    record1: NormalizedRecord, 
    record2: NormalizedRecord
  ): number {
    let confidence = 0
    
    // Amount match (40% weight)
    const amountMatch = this.calculateAmountMatch(record1.amount, record2.amount)
    confidence += amountMatch * 0.4
    
    // Currency match (20% weight)
    const currencyMatch = record1.currency === record2.currency ? 1.0 : 0.0
    confidence += currencyMatch * 0.2
    
    // Date match (25% weight)
    const dateMatch = this.calculateDateMatch(record1.date, record2.date)
    confidence += dateMatch * 0.25
    
    // Keyword match (15% weight)
    const keywordMatch = this.calculateKeywordMatch(record1.keywords, record2.keywords)
    confidence += keywordMatch * 0.15
    
    return Math.min(confidence, 1.0)
  }

  private calculateAmountMatch(amount1: number, amount2: number): number {
    if (amount1 === amount2) return 1.0
    
    const diff = Math.abs(amount1 - amount2)
    const tolerance = Math.max(amount1 * 0.005, 1) // 0.5% tolerance, minimum 1 cent
    
    if (diff <= tolerance) return 0.95
    if (diff <= tolerance * 2) return 0.8
    if (diff <= tolerance * 3) return 0.6
    return 0.0
  }

  private calculateDateMatch(date1: string, date2: string): number {
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

  private calculateKeywordMatch(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 0.5
    
    const commonKeywords = keywords1.filter(k => keywords2.includes(k))
    const totalKeywords = new Set([...keywords1, ...keywords2]).size
    
    return commonKeywords.length / totalKeywords
  }
}
