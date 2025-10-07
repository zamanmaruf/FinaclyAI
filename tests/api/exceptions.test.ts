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
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return exceptions with required fields', async () => {
    const response = await request.get('/api/exceptions/list');
    
    if (response.body.length > 0) {
      const exception = response.body[0];
      expect(exception).toHaveProperty('id');
      expect(exception).toHaveProperty('type');
      expect(exception).toHaveProperty('createdAt');
    }
  });

  it('should support pagination params', async () => {
    const response = await request.get('/api/exceptions/list?limit=5');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(5);
  });
});

