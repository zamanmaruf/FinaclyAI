import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('POST /api/match/payouts-bank', () => {
  it('should return 200 OK', async () => {
    const response = await request.post('/api/match/payouts-bank');
    
    expect(response.status).toBe(200);
  });

  it('should return matching result with counts', async () => {
    const response = await request.post('/api/match/payouts-bank');
    
    expect(response.body).toHaveProperty('scanned');
    expect(response.body).toHaveProperty('matchedCount');
    expect(typeof response.body.scanned).toBe('number');
    expect(typeof response.body.matchedCount).toBe('number');
  });

  it('should return non-negative counts', async () => {
    const response = await request.post('/api/match/payouts-bank');
    
    expect(response.body.scanned).toBeGreaterThanOrEqual(0);
    expect(response.body.matchedCount).toBeGreaterThanOrEqual(0);
  });

  it('should report ambiguous matches', async () => {
    const response = await request.post('/api/match/payouts-bank');
    
    expect(response.body).toHaveProperty('ambiguous');
    expect(typeof response.body.ambiguous).toBe('number');
  });

  it('should complete within 30 seconds', async () => {
    const start = Date.now();
    await request.post('/api/match/payouts-bank');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(30000);
  });
});

