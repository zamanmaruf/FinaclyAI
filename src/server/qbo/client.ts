import axios from 'axios';
import { env } from '@/env';
import { withQboAccess, getActiveToken, updateToken } from './store';
import { refreshToken } from './oauth';

// Use environment-based configuration for QBO base URLs
const getQboBaseUrl = (environment: string): string => {
  switch (environment) {
    case 'production':
      return env.QBO_PRODUCTION_BASE_URL;
    case 'development':
    default:
      return env.QBO_SANDBOX_BASE_URL;
  }
};

async function makeQboRequest<T>(
  realmId: string,
  method: 'GET' | 'POST',
  path: string,
  data?: any
): Promise<T> {
  const minorVersion = env.QBO_MINOR_VERSION || '73';
  
  return withQboAccess(realmId, async (accessToken) => {
    const baseUrl = getQboBaseUrl(env.INTUIT_ENV);
    let url = `${baseUrl}/${realmId}/${path}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    // Append minorversion to every request
    const minorVersionParam = `minorversion=${minorVersion}`;
    if (url.includes('?')) {
      url += `&${minorVersionParam}`;
    } else {
      url += `?${minorVersionParam}`;
    }

    // Log effective URL and status code at debug level only
    console.log(`QBO ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        headers,
        data,
        timeout: 15000, // 15 seconds timeout
      });
      
      console.log(`QBO ${method} ${response.status} - ${url}`);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      console.log(`QBO ${method} ${status} - ${url}`);
      
      // On 401, perform one refresh and retry once
      if (status === 401) {
        console.log('🔄 QBO 401 - Attempting token refresh and retry');
        
        try {
          const currentToken = await getActiveToken(realmId);
          if (!currentToken) {
            throw new Error('No token found for refresh');
          }

          const newTokenData = await refreshToken(currentToken.refreshToken);
          await updateToken(realmId, {
            accessToken: newTokenData.accessToken,
            refreshToken: newTokenData.refreshToken,
            tokenType: newTokenData.tokenType,
            expiresAt: newTokenData.expiresAt,
          });

          // Retry the request with the new token
          const retryHeaders = { ...headers, 'Authorization': `Bearer ${newTokenData.accessToken}` };
          
          const retryResponse = await axios({
            method,
            url,
            headers: retryHeaders,
            data,
            timeout: 15000,
          });
          
          console.log(`QBO ${method} ${retryResponse.status} (retry) - ${url}`);
          return retryResponse.data;
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError.message);
          throw new Error(`Authentication failed after refresh attempt: ${refreshError.message}`);
        }
      }

      // Handle specific QBO errors
      if (status === 400) {
        const fault = error.response?.data?.Fault;
        if (fault?.Error?.[0]?.Detail?.includes('Wrong Cluster') || 
            fault?.Error?.[0]?.Detail?.includes('wrong cluster')) {
          throw new Error(`Wrong Cluster Error: This company (${realmId}) is not accessible on the current cluster. Please try a different cluster URL.`);
        }
        if (fault?.Error?.[0]?.Detail?.includes('Invalid realmId')) {
          throw new Error(`Invalid Company ID: The realmId ${realmId} is not valid or accessible.`);
        }
        if (fault?.Error?.[0]?.Detail?.includes('Unauthorized')) {
          throw new Error(`Unauthorized: Insufficient permissions for this operation.`);
        }
      }
      
      if (status === 403) {
        throw new Error(`Forbidden: Access denied for company ${realmId}. Check your app permissions.`);
      }
      
      if (status === 404) {
        throw new Error(`Company Not Found: The company ${realmId} was not found or is not accessible.`);
      }
      
      if (status >= 500) {
        throw new Error(`QBO Server Error: Intuit servers are experiencing issues (${status}). Please try again later.`);
      }

      // For other errors, surface a clean error message
      const message = error.response?.data?.Fault?.Error?.[0]?.Detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'Unknown error';
      
      throw new Error(`QBO ${method} failed (${status}): ${message}`);
    }
  });
}

export function qboGet<T>(realmId: string, path: string): Promise<T> {
  return makeQboRequest<T>(realmId, 'GET', path);
}

export function qboPost<T>(realmId: string, path: string, body: any): Promise<T> {
  return makeQboRequest<T>(realmId, 'POST', path, body);
}