import { qboGet } from '@/server/qbo/client';
import { withQboAccess } from '@/server/qbo/store';

export async function verifyQbo(realmId: string): Promise<string> {
  try {
    const result = await withQboAccess(realmId, async (accessToken) => {
      return await qboGet(realmId, `companyinfo/${realmId}?`, accessToken);
    });

    const company = result?.QueryResponse?.CompanyInfo?.[0];
    if (!company) {
      return 'QBO connection failed - no company info returned';
    }

    return `QBO connected to ${company.CompanyName || 'Unknown Company'} (${company.Id})`;
  } catch (error) {
    return `QBO verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
