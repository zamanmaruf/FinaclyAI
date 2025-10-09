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
    
    expect(response.body).toHaveProperty('matched');
    expect(response.body).toHaveProperty('exceptions');
  });

  it('should return numeric counts', async () => {
    const response = await request.get('/api/stats');
    
    expect(typeof response.body.matched).toBe('number');
    expect(typeof response.body.exceptions).toBe('number');
  });

  it('should return non-negative counts', async () => {
    const response = await request.get('/api/stats');
    
    expect(response.body.matched).toBeGreaterThanOrEqual(0);
    expect(response.body.exceptions).toBeGreaterThanOrEqual(0);
  });
});
