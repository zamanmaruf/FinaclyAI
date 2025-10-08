import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('GET /api/exceptions/list', () => {
  it('should return 200 OK', async () => {
    const response = await request.get('/api/exceptions/list');
    
    expect(response.status).toBe(200);
  });

  it('should return array of exceptions', async () => {
    const response = await request.get('/api/exceptions/list');
    
    expect(response.body).toHaveProperty('rows');
    expect(Array.isArray(response.body.rows)).toBe(true);
  });

  it('should return exceptions with required fields', async () => {
    const response = await request.get('/api/exceptions/list');
    
    if (response.body.rows.length > 0) {
      const exception = response.body.rows[0];
      expect(exception).toHaveProperty('id');
      expect(exception).toHaveProperty('kind');
      expect(exception).toHaveProperty('createdAt');
    }
  });

  it('should support pagination params', async () => {
    const response = await request.get('/api/exceptions/list?limit=5');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('rows');
    expect(Array.isArray(response.body.rows)).toBe(true);
    expect(response.body.rows.length).toBeLessThanOrEqual(5);
  });
});

