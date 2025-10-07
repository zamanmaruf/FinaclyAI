import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('GET /api/stats', () => {
  it('should return 200 OK', async () => {
    const response = await request.get('/api/stats');
    
    expect(response.status).toBe(200);
  });

  it('should return stats object with required fields', async () => {
    const response = await request.get('/api/stats');
    
    expect(response.body).toHaveProperty('matchedCount');
    expect(response.body).toHaveProperty('exceptionCount');
    expect(response.body).toHaveProperty('lastSyncTime');
  });

  it('should return numeric counts', async () => {
    const response = await request.get('/api/stats');
    
    expect(typeof response.body.matchedCount).toBe('number');
    expect(typeof response.body.exceptionCount).toBe('number');
  });

  it('should return non-negative counts', async () => {
    const response = await request.get('/api/stats');
    
    expect(response.body.matchedCount).toBeGreaterThanOrEqual(0);
    expect(response.body.exceptionCount).toBeGreaterThanOrEqual(0);
  });
});
