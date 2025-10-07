import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('GET /api/health', () => {
  it('should return 200 OK', async () => {
    const response = await request.get('/api/health');
    
    expect(response.status).toBe(200);
  });

  it('should return ok: true', async () => {
    const response = await request.get('/api/health');
    
    expect(response.body).toHaveProperty('ok', true);
  });

  it('should respond within 1 second', async () => {
    const start = Date.now();
    await request.get('/api/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
});
