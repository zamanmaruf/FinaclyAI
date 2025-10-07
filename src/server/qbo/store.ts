import { db } from '@/server/db';
import { refreshToken } from './oauth';

export async function getActiveToken(realmId: string) {
  return await db.qboToken.findFirst({
    where: { realmId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function saveToken(realmId: string, token: {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Date;
}) {
  // Upsert company
  await db.qboCompany.upsert({
    where: { id: realmId },
    update: { updatedAt: new Date() },
    create: { id: realmId },
  });

  // Upsert token
  await db.qboToken.upsert({
    where: { realmId },
    update: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      updatedAt: new Date(),
    },
    create: {
      realmId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
    },
  });
}

export async function updateToken(realmId: string, token: {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Date;
}) {
  return await saveToken(realmId, token);
}

export function needsRefresh(token: { expiresAt: Date }): boolean {
  // Refresh if token expires within the next 5 minutes
  const fiveMinutesFromNow = new Date();
  fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);
  return token.expiresAt <= fiveMinutesFromNow;
}

export function validateToken(token: {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Date;
  realmId: string;
}): {
  isValid: boolean;
  isExpired: boolean;
  tokenType: 'playground' | 'production' | 'unknown';
  issues: string[];
} {
  const issues: string[] = [];
  const now = new Date();
  
  // Check if token is expired
  const isExpired = token.expiresAt <= now;
  if (isExpired) {
    issues.push('Token has expired');
  }
  
  // Check token format and type
  const isValidFormat = token.accessToken && token.accessToken.length > 0 && 
                       token.refreshToken && token.refreshToken.length > 0;
  if (!isValidFormat) {
    issues.push('Invalid token format');
  }
  
  // Determine token type based on patterns
  let tokenType: 'playground' | 'production' | 'unknown' = 'unknown';
  
  // Playground tokens often have different patterns or shorter lengths
  if (token.accessToken.length < 100) {
    tokenType = 'playground';
    issues.push('Token appears to be from OAuth Playground (shorter length)');
  } else if (token.accessToken.length > 200) {
    tokenType = 'production';
  }
  
  // Check for common playground indicators
  if (token.accessToken.includes('playground') || token.accessToken.includes('test')) {
    tokenType = 'playground';
    issues.push('Token contains playground/test indicators');
  }
  
  const isValid = isValidFormat && !isExpired && issues.length === 0;
  
  return {
    isValid,
    isExpired,
    tokenType,
    issues
  };
}

export async function withQboAccess<T>(
  realmId: string,
  fn: (accessToken: string) => Promise<T>
): Promise<T> {
  let token = await getActiveToken(realmId);
  
  if (!token) {
    throw new Error(`No token found for realm ${realmId}`);
  }

  if (needsRefresh(token)) {
    console.log('🔄 Refreshing QBO token for realmId:', realmId);
    
    try {
      const newToken = await refreshToken(token.refreshToken);
      
      await updateToken(realmId, {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
        tokenType: newToken.tokenType,
        expiresAt: newToken.expiresAt,
      });

      // Get the updated token
      token = await getActiveToken(realmId);
      if (!token) {
        throw new Error('Failed to retrieve refreshed token');
      }
      
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return fn(token.accessToken);
}