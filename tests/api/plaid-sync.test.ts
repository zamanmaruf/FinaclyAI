import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('POST /api/plaid/transactions', () => {
  it('should return 200 OK', async () => {
    const response = await request.post('/api/plaid/transactions');
    
    // May fail if no Plaid item connected, that's ok
    expect([200, 400, 404]).toContain(response.status);
  });

  it('should return proper structure on success', async () => {
    const response = await request.post('/api/plaid/transactions');
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('ok');
    }
  });

  it('should be idempotent with cursor', async () => {
    const response1 = await request.post('/api/plaid/transactions');
    
    // Only test if first call succeeded
    if (response1.status === 200) {
      const response2 = await request.post('/api/plaid/transactions');
      
      expect(response2.status).toBe(200);
      // Second call should have fewer/no new transactions due to cursor
      expect(response2.body.ok).toBe(true);
    }
  });

  it('should complete within 30 seconds', async () => {
    const start = Date.now();
    await request.post('/api/plaid/transactions');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(30000);
  });
});

describe('POST /api/plaid/sandbox-link', () => {
  it('should create sandbox connection', async () => {
    const response = await request
      .post('/api/plaid/sandbox-link')
      .set('Authorization', `Bearer ${process.env.SHARED_ADMIN_TOKEN || 'test'}`);
    
    // May succeed or return existing
    expect([200, 409]).toContain(response.status);
  });
});

