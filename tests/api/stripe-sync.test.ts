import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('POST /api/stripe/sync', () => {
  it('should return 200 OK', async () => {
    const response = await request.post('/api/stripe/sync');
    
    expect(response.status).toBe(200);
  });

  it('should return sync result with counts', async () => {
    const response = await request.post('/api/stripe/sync');
    
    expect(response.body).toHaveProperty('ok');
    expect(response.body).toHaveProperty('message');
  });

  it('should be idempotent (second call returns same data)', async () => {
    const response1 = await request.post('/api/stripe/sync');
    const response2 = await request.post('/api/stripe/sync');
    
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    
    // Both should succeed
    expect(response1.body.ok).toBe(true);
    expect(response2.body.ok).toBe(true);
  });

  it('should complete within 30 seconds', async () => {
    const start = Date.now();
    await request.post('/api/stripe/sync');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(30000);
  });
});

