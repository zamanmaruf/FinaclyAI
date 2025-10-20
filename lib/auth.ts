import { query } from './db'

export interface Company {
  id: number
  name: string
  email: string
  status: 'inactive' | 'trial' | 'active' | 'suspended'
  subscription_tier: string | null
  created_at: Date
  updated_at: Date
}

export async function checkAppAccess(companyId: number): Promise<boolean> {
  try {
    const result = await query(
      'SELECT status, subscription_tier FROM companies WHERE id = $1',
      [companyId]
    )
    
    if (result.rows.length === 0) {
      return false
    }
    
    const company = result.rows[0]
    return company.status === 'active'
  } catch (error) {
    console.error('Error checking app access:', error)
    return false
  }
}

export async function getCompanyById(companyId: number): Promise<Company | null> {
  try {
    const result = await query(
      'SELECT * FROM companies WHERE id = $1',
      [companyId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0] as Company
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

export async function getCompanyByEmail(email: string): Promise<Company | null> {
  try {
    const result = await query(
      'SELECT * FROM companies WHERE email = $1',
      [email]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0] as Company
  } catch (error) {
    console.error('Error fetching company by email:', error)
    return null
  }
}

export async function createCompany(
  name: string, 
  email: string, 
  status: 'inactive' | 'trial' | 'active' | 'suspended' = 'inactive',
  subscription_tier: string | null = null
): Promise<Company | null> {
  try {
    const result = await query(
      `INSERT INTO companies (name, email, status, subscription_tier) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, status, subscription_tier]
    )
    
    return result.rows[0] as Company
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

export async function updateCompanyStatus(
  companyId: number, 
  status: 'inactive' | 'trial' | 'active' | 'suspended'
): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE companies SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, companyId]
    )
    
    return result.rowCount > 0
  } catch (error) {
    console.error('Error updating company status:', error)
    return false
  }
}

export function requireAppAccess(companyId: number | undefined) {
  if (!companyId) {
    throw new Error('Company ID is required')
  }
  
  return async () => {
    const hasAccess = await checkAppAccess(companyId)
    if (!hasAccess) {
      throw new Error('Access denied: Company does not have active subscription')
    }
    return true
  }
}
